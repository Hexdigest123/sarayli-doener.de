import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/server/stripe';
import { db } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';
import { doenerExtras } from '$lib/config';
import { ensureMenuSeeded, getOrderableItems } from '$lib/server/menu';
import { isStoreOpen, isShopEnabled } from '$lib/server/store-status';
import { generateOrderNumber } from '$lib/server/order-number';
import { computeVisitorId } from '$lib/server/tracking';
import { rateLimit } from '$lib/server/rate-limit';
import { eq } from 'drizzle-orm';

interface CheckoutItemInput {
	menuItemId: number;
	quantity: number;
	extras?: string[];
}

interface CheckoutBody {
	items: CheckoutItemInput[];
	orderType: 'pickup' | 'dine_in';
	pickupTime?: string;
	customerName: string;
	customerPhone: string;
	customerEmail?: string;
	notes?: string;
}

const extrasLabelMap = new Map(doenerExtras.map((e) => [e.id, e.label]));

// Field bounds. The whole body is also capped by adapter-node's BODY_SIZE_LIMIT,
// but per-field limits keep stored data sane and well under Stripe's 500-char
// metadata limit (so a long name can't fail the Stripe call after the order row
// has already been written). MAX_ITEMS caps the per-request DB/Stripe work.
const MAX_ITEMS = 100;
const MAX_NAME = 100;
const MAX_PHONE = 32;
const MAX_EMAIL = 200;
const MAX_NOTES = 500;
const MAX_PICKUP_TIME = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: RequestHandler = async (event) => {
	const { request, url } = event;

	// Each request writes an order + items and creates a Stripe session, so throttle
	// per IP to stop scripted spam of the order table and the Stripe API.
	const limit = rateLimit('checkout', event.getClientAddress(), 15, 10 * 60 * 1000);
	if (!limit.allowed) {
		throw error(429, 'Too many requests. Please try again later.');
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const { items, orderType, pickupTime, customerName, customerPhone, customerEmail, notes } =
		body as CheckoutBody;

	if (!(await isShopEnabled())) {
		throw error(503, 'Online ordering is currently disabled');
	}

	if (!(await isStoreOpen())) {
		throw error(503, 'Store is currently closed');
	}

	if (!Array.isArray(items) || items.length === 0 || !orderType) {
		throw error(400, 'Missing required fields');
	}

	if (items.length > MAX_ITEMS) {
		throw error(400, 'Too many items');
	}

	if (!['pickup', 'dine_in'].includes(orderType)) {
		throw error(400, 'Invalid order type');
	}

	// Validate and bound the customer-supplied text fields before touching the DB.
	const name = typeof customerName === 'string' ? customerName.trim() : '';
	if (!name || name.length > MAX_NAME) {
		throw error(400, 'Invalid name');
	}
	const phone = typeof customerPhone === 'string' ? customerPhone.trim() : '';
	if (!phone || phone.length > MAX_PHONE) {
		throw error(400, 'Invalid phone number');
	}
	const email = typeof customerEmail === 'string' ? customerEmail.trim() : '';
	if (email && (email.length > MAX_EMAIL || !EMAIL_RE.test(email))) {
		throw error(400, 'Invalid email');
	}
	const trimmedNotes = typeof notes === 'string' ? notes.trim() : '';
	if (trimmedNotes.length > MAX_NOTES) {
		throw error(400, 'Notes are too long');
	}
	const trimmedPickupTime = typeof pickupTime === 'string' ? pickupTime.trim() : '';
	if (trimmedPickupTime.length > MAX_PICKUP_TIME) {
		throw error(400, 'Invalid pickup time');
	}

	// Authoritative pricing/names come from the DB, never the client. Only available
	// items can be ordered. Seed on first launch in case checkout is the first hit.
	await ensureMenuSeeded();
	const menuItemMap = await getOrderableItems();

	const validatedItems: Array<{
		menuItemId: number;
		displayName: string;
		price: number;
		quantity: number;
		extras: string[];
	}> = [];
	let totalCents = 0;

	for (const item of items) {
		const menuItem = menuItemMap.get(item.menuItemId);
		if (!menuItem) {
			throw error(400, `Invalid menu item: ${item.menuItemId}`);
		}

		const quantity = Math.max(1, Math.min(99, Math.floor(item.quantity)));
		const priceCents = menuItem.priceCents;
		// Only keep known extra ids (deduped); arbitrary client strings are dropped so
		// they can't be stored or echoed into the Stripe line-item description.
		const extras = Array.isArray(item.extras)
			? [
					...new Set(
						item.extras.filter((e): e is string => typeof e === 'string' && extrasLabelMap.has(e))
					)
				]
			: [];

		totalCents += priceCents * quantity;
		validatedItems.push({
			menuItemId: item.menuItemId,
			displayName: menuItem.name,
			price: priceCents,
			quantity,
			extras
		});
	}

	const orderNumber = await generateOrderNumber();
	const visitorId = computeVisitorId(event);

	const [createdOrder] = await db
		.insert(orders)
		.values({
			orderNumber,
			status: 'pending',
			orderType,
			customerName: name,
			customerPhone: phone,
			customerEmail: email || null,
			pickupTime: trimmedPickupTime || null,
			totalAmount: totalCents,
			visitorId,
			notes: trimmedNotes || null
		})
		.returning();

	await db.insert(orderItems).values(
		validatedItems.map((item) => ({
			orderId: createdOrder.id,
			menuItemId: item.menuItemId,
			itemName: item.displayName,
			quantity: item.quantity,
			unitPrice: item.price,
			extras: item.extras.length > 0 ? JSON.stringify(item.extras) : null
		}))
	);

	const extrasPerItem: Record<string, string[]> = {};
	for (const item of validatedItems) {
		if (item.extras.length > 0) {
			const key = `item_${item.menuItemId}`;
			extrasPerItem[key] = item.extras.map((e) => extrasLabelMap.get(e) ?? e);
		}
	}

	let session;
	try {
		session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'payment',
			currency: 'eur',
			line_items: validatedItems.map((item) => ({
				price_data: {
					currency: 'eur',
					product_data: {
						name: item.displayName,
						...(item.extras.length > 0
							? { description: item.extras.map((e) => extrasLabelMap.get(e) ?? e).join(', ') }
							: {})
					},
					unit_amount: item.price
				},
				quantity: item.quantity
			})),
			metadata: {
				order_id: String(createdOrder.id),
				order_number: orderNumber,
				order_type: orderType,
				customer_name: name,
				customer_phone: phone,
				...(Object.keys(extrasPerItem).length > 0 ? { extras: JSON.stringify(extrasPerItem) } : {})
			},
			success_url: `${url.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${url.origin}/checkout/cancel`
		});
	} catch (err) {
		// Don't leave an unpayable pending order behind if Stripe rejects the request.
		console.error('Stripe session creation failed:', err);
		await db.delete(orderItems).where(eq(orderItems.orderId, createdOrder.id));
		await db.delete(orders).where(eq(orders.id, createdOrder.id));
		throw error(502, 'Could not start checkout. Please try again.');
	}

	await db
		.update(orders)
		.set({ stripeSessionId: session.id })
		.where(eq(orders.id, createdOrder.id));

	return json({ url: session.url });
};
