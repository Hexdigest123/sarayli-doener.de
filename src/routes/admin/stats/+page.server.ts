import type { PageServerLoad } from './$types';
import { and, count, gte, inArray, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';

const revenueStatuses = ['paid', 'fulfilled'];

export const load: PageServerLoad = async () => {
	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const weekStart = new Date(todayStart);
	weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

	const [
		totalOrders,
		totalRevenue,
		todayOrders,
		todayRevenue,
		weekRevenue,
		monthRevenue,
		statusCounts,
		dailyRevenue,
		orderTypeDistribution
	] = await Promise.all([
		db.select({ count: count() }).from(orders),
		db
			.select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
			.from(orders)
			.where(inArray(orders.status, revenueStatuses)),
		db.select({ count: count() }).from(orders).where(gte(orders.createdAt, todayStart)),
		db
			.select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
			.from(orders)
			.where(and(gte(orders.createdAt, todayStart), inArray(orders.status, revenueStatuses))),
		db
			.select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
			.from(orders)
			.where(and(gte(orders.createdAt, weekStart), inArray(orders.status, revenueStatuses))),
		db
			.select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
			.from(orders)
			.where(and(gte(orders.createdAt, monthStart), inArray(orders.status, revenueStatuses))),
		db.select({ status: orders.status, count: count() }).from(orders).groupBy(orders.status),
		db
			.select({
				date: sql<string>`TO_CHAR(${orders.createdAt}, 'DD.MM')`.as('date'),
				revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
				count: count()
			})
			.from(orders)
			.where(and(gte(orders.createdAt, monthStart), inArray(orders.status, revenueStatuses)))
			.groupBy(sql`DATE(${orders.createdAt})`, sql`TO_CHAR(${orders.createdAt}, 'DD.MM')`)
			.orderBy(sql`DATE(${orders.createdAt})`),
		db
			.select({ type: orders.orderType, count: count() })
			.from(orders)
			.where(inArray(orders.status, revenueStatuses))
			.groupBy(orders.orderType)
	]);

	return {
		totalOrders: totalOrders[0]?.count ?? 0,
		totalRevenue: Number(totalRevenue[0]?.total ?? 0),
		todayOrders: todayOrders[0]?.count ?? 0,
		todayRevenue: Number(todayRevenue[0]?.total ?? 0),
		weekRevenue: Number(weekRevenue[0]?.total ?? 0),
		monthRevenue: Number(monthRevenue[0]?.total ?? 0),
		statusCounts: statusCounts.map((status) => ({ status: status.status, count: status.count })),
		dailyRevenue: dailyRevenue.map((day) => ({
			date: day.date,
			revenue: Number(day.revenue),
			count: day.count
		})),
		orderTypeDistribution: orderTypeDistribution.map((orderType) => ({
			type: orderType.type,
			count: orderType.count
		}))
	};
};
