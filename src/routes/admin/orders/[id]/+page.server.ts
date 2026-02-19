import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orderItems, orders } from '$lib/server/db/schema';
import { stripe } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ params }) => {
	const orderId = Number.parseInt(params.id, 10);
	if (Number.isNaN(orderId)) {
		throw error(404, 'Invalid order ID');
	}

	const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
	if (!order) {
		throw error(404, 'Order not found');
	}

	const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

	return {
		order: {
			...order,
			createdAt: order.createdAt.toISOString(),
			paidAt: order.paidAt?.toISOString() ?? null,
			fulfilledAt: order.fulfilledAt?.toISOString() ?? null
		},
		items: items.map((item) => ({
			...item,
			createdAt: item.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	fulfill: async ({ params }) => {
		const orderId = Number.parseInt(params.id, 10);
		if (Number.isNaN(orderId)) {
			return fail(400, { error: 'Invalid order ID' });
		}

		await db
			.update(orders)
			.set({ status: 'fulfilled', fulfilledAt: new Date() })
			.where(eq(orders.id, orderId));

		return { success: true, action: 'fulfilled' };
	},
	refund: async ({ params }) => {
		const orderId = Number.parseInt(params.id, 10);
		if (Number.isNaN(orderId)) {
			return fail(400, { error: 'Invalid order ID' });
		}

		const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
		if (!order?.stripePaymentIntentId) {
			return fail(400, { error: 'No payment intent found' });
		}

		try {
			await stripe.refunds.create({
				payment_intent: order.stripePaymentIntentId
			});

			await db.update(orders).set({ status: 'refunded' }).where(eq(orders.id, orderId));
			return { success: true, action: 'refunded' };
		} catch {
			return fail(500, { error: 'Refund failed' });
		}
	}
};
