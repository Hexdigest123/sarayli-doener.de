import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/server/stripe';
import { db } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';
import { menuCategories } from '$lib/config';
import { eq } from 'drizzle-orm';

interface CheckoutItemInput {
	menuItemId: number;
	quantity: number;
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

const menuItemMap = new Map<number, { price: number; nameKey: string }>();
for (const category of menuCategories) {
	for (const item of category.items) {
		menuItemMap.set(item.id, { price: item.price, nameKey: item.nameKey });
	}
}

export const POST: RequestHandler = async ({ request, url }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const {
		items,
		orderType,
		pickupTime,
		customerName,
		customerPhone,
		customerEmail,
		notes
	} = body as CheckoutBody;

	if (!Array.isArray(items) || items.length === 0 || !orderType || !customerName || !customerPhone) {
		throw error(400, 'Missing required fields');
	}

	if (!['pickup', 'dine_in'].includes(orderType)) {
		throw error(400, 'Invalid order type');
	}

	const validatedItems: Array<{
		menuItemId: number;
		nameKey: string;
		price: number;
		quantity: number;
	}> = [];
	let totalCents = 0;

	for (const item of items) {
		const menuItem = menuItemMap.get(item.menuItemId);
		if (!menuItem) {
			throw error(400, `Invalid menu item: ${item.menuItemId}`);
		}

		const quantity = Math.max(1, Math.min(99, Math.floor(item.quantity)));
		const priceCents = Math.round(menuItem.price * 100);

		totalCents += priceCents * quantity;
		validatedItems.push({
			menuItemId: item.menuItemId,
			nameKey: menuItem.nameKey,
			price: priceCents,
			quantity
		});
	}

	const [createdOrder] = await db
		.insert(orders)
		.values({
			status: 'pending',
			orderType,
			customerName,
			customerPhone,
			customerEmail: customerEmail || null,
			pickupTime: pickupTime || null,
			totalAmount: totalCents,
			notes: notes || null
		})
		.returning();

	await db.insert(orderItems).values(
		validatedItems.map((item) => ({
			orderId: createdOrder.id,
			menuItemId: item.menuItemId,
			itemName: item.nameKey,
			quantity: item.quantity,
			unitPrice: item.price
		}))
	);

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		mode: 'payment',
		currency: 'eur',
		line_items: validatedItems.map((item) => ({
			price_data: {
				currency: 'eur',
				product_data: {
					name: item.nameKey
				},
				unit_amount: item.price
			},
			quantity: item.quantity
		})),
		metadata: {
			order_id: String(createdOrder.id),
			order_type: orderType,
			customer_name: customerName,
			customer_phone: customerPhone
		},
		success_url: `${url.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/checkout/cancel`
	});

	await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, createdOrder.id));

	return json({ url: session.url });
};
