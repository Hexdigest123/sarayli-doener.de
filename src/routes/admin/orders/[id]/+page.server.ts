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

const VALID_STATUSES = ['pending', 'paid', 'in_process', 'fulfilled', 'cancelled', 'refunded', 'cancellation_requested'] as const;

export const actions: Actions = {
	updateStatus: async ({ params, request }) => {
		const orderId = Number.parseInt(params.id, 10);
		if (Number.isNaN(orderId)) {
			return fail(400, { error: 'Invalid order ID' });
		}

		const formData = await request.formData();
		const newStatus = String(formData.get('status') || '');

		if (!VALID_STATUSES.includes(newStatus as (typeof VALID_STATUSES)[number])) {
			return fail(400, { error: 'Invalid status' });
		}

		const [existing] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, orderId));
		if (!existing) {
			return fail(404, { error: 'Order not found' });
		}
		if (existing.status === 'refunded') {
			return fail(400, { error: 'Refunded orders cannot be changed' });
		}
		if (newStatus === 'refunded') {
			return fail(400, { error: 'Use the Refund action to refund orders through Stripe' });
		}

		const updates: Record<string, unknown> = { status: newStatus };
		if (newStatus === 'fulfilled') {
			updates.fulfilledAt = new Date();
		}
		if (newStatus === 'paid') {
			updates.paidAt = new Date();
		}

		await db.update(orders).set(updates).where(eq(orders.id, orderId));

		return { success: true, action: newStatus };
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
