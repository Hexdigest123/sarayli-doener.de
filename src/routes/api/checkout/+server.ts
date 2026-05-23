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

export const POST: RequestHandler = async (event) => {
	const { request, url } = event;
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

	if (
		!Array.isArray(items) ||
		items.length === 0 ||
		!orderType ||
		!customerName ||
		!customerPhone
	) {
		throw error(400, 'Missing required fields');
	}

	if (!['pickup', 'dine_in'].includes(orderType)) {
		throw error(400, 'Invalid order type');
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
		const extras = Array.isArray(item.extras)
			? item.extras.filter((e): e is string => typeof e === 'string')
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
			customerName,
			customerPhone,
			customerEmail: customerEmail || null,
			pickupTime: pickupTime || null,
			totalAmount: totalCents,
			visitorId,
			notes: notes || null
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

	const session = await stripe.checkout.sessions.create({
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
			customer_name: customerName,
			customer_phone: customerPhone,
			...(Object.keys(extrasPerItem).length > 0 ? { extras: JSON.stringify(extrasPerItem) } : {})
		},
		success_url: `${url.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/checkout/cancel`
	});

	await db
		.update(orders)
		.set({ stripeSessionId: session.id })
		.where(eq(orders.id, createdOrder.id));

	return json({ url: session.url });
};
