import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orderItems, orders } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '$lib/server/rate-limit';

const CANCELLABLE_STATUSES = ['paid', 'pending'];

export const load: PageServerLoad = async ({ url }) => {
	const orderIdParam = url.searchParams.get('id')?.trim().toUpperCase();
	if (!orderIdParam) {
		return { order: null, items: [] };
	}

	const [order] = await db
		.select({
			id: orders.id,
			orderNumber: orders.orderNumber,
			status: orders.status,
			orderType: orders.orderType,
			customerName: orders.customerName,
			pickupTime: orders.pickupTime,
			totalAmount: orders.totalAmount,
			createdAt: orders.createdAt,
			paidAt: orders.paidAt,
			fulfilledAt: orders.fulfilledAt,
			cancellationRequestedAt: orders.cancellationRequestedAt
		})
		.from(orders)
		.where(eq(orders.orderNumber, orderIdParam));

	if (!order) {
		return { order: null, items: [], notFound: true };
	}

	const items = await db
		.select({
			id: orderItems.id,
			menuItemId: orderItems.menuItemId,
			itemName: orderItems.itemName,
			quantity: orderItems.quantity,
			unitPrice: orderItems.unitPrice,
			extras: orderItems.extras
		})
		.from(orderItems)
		.where(eq(orderItems.orderId, order.id));

	return {
		order: {
			...order,
			createdAt: order.createdAt.toISOString(),
			paidAt: order.paidAt?.toISOString() ?? null,
			fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
			cancellationRequestedAt: order.cancellationRequestedAt?.toISOString() ?? null
		},
		items
	};
};

export const actions: Actions = {
	requestCancellation: async ({ request, getClientAddress }) => {
		// The order is identified only by its number, which anyone can submit, so
		// throttle to stop scripted abuse against the whole order table.
		const limit = rateLimit('order-cancel', getClientAddress(), 10, 10 * 60 * 1000);
		if (!limit.allowed) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const data = await request.formData();
		// Authorise by the high-entropy order number (a bearer token printed on the
		// customer's receipt), never the sequential internal row id — the latter is
		// trivially guessable and would let anyone cancel arbitrary orders.
		const orderNumber = String(data.get('orderNumber') ?? '')
			.trim()
			.toUpperCase();
		if (!orderNumber) {
			return fail(400, { error: 'Missing order number' });
		}

		const [order] = await db
			.select({ id: orders.id, status: orders.status })
			.from(orders)
			.where(eq(orders.orderNumber, orderNumber));

		// Uniform response whether the order is unknown or simply not cancellable,
		// so this endpoint cannot be used to probe which orders exist or their status.
		if (!order || !CANCELLABLE_STATUSES.includes(order.status)) {
			return fail(400, { error: 'This order can no longer be cancelled.' });
		}

		await db
			.update(orders)
			.set({
				status: 'cancellation_requested',
				cancellationRequestedAt: new Date()
			})
			.where(eq(orders.id, order.id));

		return { success: true };
	}
};
