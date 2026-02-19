import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageViews, visitorEvents, orders, orderItems } from '$lib/server/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const visitorId = params.id;

	if (!visitorId) {
		error(404, 'Visitor ID is required');
	}

	const [views, events, visitorOrders] = await Promise.all([
		db
			.select()
			.from(pageViews)
			.where(eq(pageViews.visitorId, visitorId))
			.orderBy(desc(pageViews.createdAt)),
		db
			.select()
			.from(visitorEvents)
			.where(eq(visitorEvents.visitorId, visitorId))
			.orderBy(desc(visitorEvents.createdAt)),
		db
			.select()
			.from(orders)
			.where(eq(orders.visitorId, visitorId))
			.orderBy(desc(orders.createdAt))
	]);

	if (views.length === 0 && events.length === 0) {
		error(404, 'Visitor not found');
	}

	const orderIds = visitorOrders.map((o) => o.id);
	const items = orderIds.length > 0
		? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
		: [];

	const itemsByOrder = new Map<number, typeof items>();
	for (const item of items) {
		const list = itemsByOrder.get(item.orderId) ?? [];
		list.push(item);
		itemsByOrder.set(item.orderId, list);
	}

	const latestView = views[0];
	const ipAddress = latestView?.ipAddress || 'Unknown';
	const userAgent = latestView?.userAgent || 'Unknown';

	const allDates = [...views.map((v) => v.createdAt), ...events.map((e) => e.createdAt)].filter(
		(d): d is Date => d !== null
	);

	let firstSeen = new Date().toISOString();
	let lastSeen = new Date().toISOString();

	if (allDates.length > 0) {
		const sortedDates = allDates.sort((a, b) => a.getTime() - b.getTime());
		firstSeen = sortedDates[0].toISOString();
		lastSeen = sortedDates[sortedDates.length - 1].toISOString();
	}

	return {
		visitorId,
		ipAddress,
		userAgent,
		firstSeen,
		lastSeen,
		pageViews: views.map((v) => ({
			...v,
			createdAt: v.createdAt.toISOString()
		})),
		events: events.map((e) => ({
			...e,
			createdAt: e.createdAt.toISOString()
		})),
		orders: visitorOrders.map((o) => ({
			...o,
			createdAt: o.createdAt.toISOString(),
			paidAt: o.paidAt?.toISOString() ?? null,
			fulfilledAt: o.fulfilledAt?.toISOString() ?? null,
			items: itemsByOrder.get(o.id) ?? []
		})),
		totalPageViews: views.length,
		totalEvents: events.length,
		totalOrders: visitorOrders.length
	};
};
