import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orderItems, orders } from '$lib/server/db/schema';
import { stripe } from '$lib/server/stripe';
import { and, asc, count, desc, eq, gte, inArray, lte, type SQL } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'paid', 'in_process', 'fulfilled', 'cancelled', 'refunded', 'cancellation_requested'] as const;

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const allowedPerPage = [25, 50, 100, 250];
	const rawPerPage = Number(url.searchParams.get('perPage')) || 25;
	const perPage = allowedPerPage.includes(rawPerPage) ? rawPerPage : 25;
	const statusFilter = url.searchParams.get('status') || '';
	const dateFrom = url.searchParams.get('dateFrom') || '';
	const dateTo = url.searchParams.get('dateTo') || '';
	const sortBy = url.searchParams.get('sort') || 'createdAt';
	const sortDir = url.searchParams.get('dir') === 'asc' ? 'asc' : 'desc';

	const sortColumns: Record<string, typeof orders.createdAt> = {
		createdAt: orders.createdAt,
		orderNumber: orders.orderNumber,
		customerName: orders.customerName,
		totalAmount: orders.totalAmount,
		status: orders.status,
		orderType: orders.orderType,
		pickupTime: orders.pickupTime
	};
	const sortColumn = sortColumns[sortBy] ?? orders.createdAt;
	const orderByClause = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

	const conditions: SQL[] = [];
	if (statusFilter) {
		conditions.push(eq(orders.status, statusFilter));
	}
	if (dateFrom) {
		conditions.push(gte(orders.createdAt, new Date(dateFrom)));
	}
	if (dateTo) {
		const end = new Date(dateTo);
		end.setDate(end.getDate() + 1);
		conditions.push(lte(orders.createdAt, end));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [orderList, totalResult] = await Promise.all([
		db
			.select()
			.from(orders)
			.where(whereClause)
			.orderBy(orderByClause)
			.limit(perPage)
			.offset((page - 1) * perPage),
		db.select({ count: count() }).from(orders).where(whereClause)
	]);

	const ids = orderList.map((order) => order.id);

	const [itemCounts, itemsList] = ids.length > 0
		? await Promise.all([
				db
					.select({ orderId: orderItems.orderId, count: count() })
					.from(orderItems)
					.where(inArray(orderItems.orderId, ids))
					.groupBy(orderItems.orderId),
				db
					.select()
					.from(orderItems)
					.where(inArray(orderItems.orderId, ids))
			])
		: [[], []];

	const itemCountMap = new Map(itemCounts.map((row) => [row.orderId, row.count]));

	const itemsByOrder = new Map<number, typeof itemsList>();
	for (const item of itemsList) {
		const list = itemsByOrder.get(item.orderId) ?? [];
		list.push(item);
		itemsByOrder.set(item.orderId, list);
	}

	const total = totalResult[0]?.count ?? 0;

	return {
		orders: orderList.map((order) => ({
			...order,
			createdAt: order.createdAt.toISOString(),
			paidAt: order.paidAt?.toISOString() ?? null,
			fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
			itemCount: itemCountMap.get(order.id) ?? 0,
			items: itemsByOrder.get(order.id) ?? []
		})),
		pagination: {
			page,
			perPage,
			total,
			totalPages: Math.ceil(total / perPage)
		},
		filters: {
			status: statusFilter,
			dateFrom,
			dateTo,
			sort: sortBy,
			dir: sortDir,
			perPage
		}
	};
};

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const data = await request.formData();
		const orderIdRaw = data.get('orderId');
		const newStatus = String(data.get('status') || '');
		const orderId = Number.parseInt(String(orderIdRaw), 10);

		if (!orderId) {
			return fail(400, { error: 'Missing order ID' });
		}

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

		return { success: true };
	},

	refund: async ({ request }) => {
		const data = await request.formData();
		const orderId = Number.parseInt(String(data.get('orderId')), 10);

		if (!orderId) {
			return fail(400, { error: 'Missing order ID' });
		}

		const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
		if (!order) {
			return fail(404, { error: 'Order not found' });
		}

		if (!['paid', 'pending', 'cancellation_requested'].includes(order.status)) {
			return fail(400, { error: 'Cannot refund an order with status: ' + order.status });
		}

		if (!order.stripePaymentIntentId) {
			await db.update(orders).set({ status: 'cancelled' }).where(eq(orders.id, orderId));
			return { success: true, refunded: false, cancelled: true };
		}

		try {
			await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
			await db.update(orders).set({ status: 'refunded' }).where(eq(orders.id, orderId));
			return { success: true, refunded: true };
		} catch {
			return fail(500, { error: 'Stripe refund failed' });
		}
	}
};
