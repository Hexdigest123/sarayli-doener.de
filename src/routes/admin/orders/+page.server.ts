import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orderItems, orders } from '$lib/server/db/schema';
import { and, count, desc, eq, gte, inArray, lte, type SQL } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const perPage = 25;
	const statusFilter = url.searchParams.get('status') || '';
	const dateFrom = url.searchParams.get('dateFrom') || '';
	const dateTo = url.searchParams.get('dateTo') || '';

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
			.orderBy(desc(orders.createdAt))
			.limit(perPage)
			.offset((page - 1) * perPage),
		db.select({ count: count() }).from(orders).where(whereClause)
	]);

	const ids = orderList.map((order) => order.id);
	const itemCounts =
		ids.length > 0
			? await db
					.select({ orderId: orderItems.orderId, count: count() })
					.from(orderItems)
					.where(inArray(orderItems.orderId, ids))
					.groupBy(orderItems.orderId)
			: [];

	const itemCountMap = new Map(itemCounts.map((row) => [row.orderId, row.count]));

	const total = totalResult[0]?.count ?? 0;

	return {
		orders: orderList.map((order) => ({
			...order,
			createdAt: order.createdAt.toISOString(),
			paidAt: order.paidAt?.toISOString() ?? null,
			fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
			itemCount: itemCountMap.get(order.id) ?? 0
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
			dateTo
		}
	};
};

export const actions: Actions = {
	fulfill: async ({ request }) => {
		const data = await request.formData();
		const orderIdRaw = data.get('orderId');
		const orderId = Number.parseInt(String(orderIdRaw), 10);

		if (!orderId) {
			return fail(400, { error: 'Missing order ID' });
		}

		await db
			.update(orders)
			.set({ status: 'fulfilled', fulfilledAt: new Date() })
			.where(eq(orders.id, orderId));

		return { success: true };
	}
};
