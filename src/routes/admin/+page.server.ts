import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { pageViews } from '$lib/server/db/schema';
import { desc, sql, count, countDistinct, eq, gte, lte, and, type SQL } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const perPage = Math.min(100, Math.max(10, Number(url.searchParams.get('perPage')) || 50));
	const sortBy = url.searchParams.get('sortBy') || 'createdAt';
	const sortDir = url.searchParams.get('sortDir') || 'desc';
	const dateFrom = url.searchParams.get('dateFrom') || '';
	const dateTo = url.searchParams.get('dateTo') || '';
	const sourceFilter = url.searchParams.get('source') || '';

	const conditions: SQL[] = [];
	if (dateFrom) {
		conditions.push(gte(pageViews.createdAt, new Date(dateFrom)));
	}
	if (dateTo) {
		const endDate = new Date(dateTo);
		endDate.setDate(endDate.getDate() + 1);
		conditions.push(lte(pageViews.createdAt, endDate));
	}
	if (sourceFilter) {
		conditions.push(eq(pageViews.utmSource, sourceFilter));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const sortColumn = (() => {
		switch (sortBy) {
			case 'visitorId':
				return pageViews.visitorId;
			case 'ipAddress':
				return pageViews.ipAddress;
			case 'landingPage':
				return pageViews.landingPage;
			case 'utmSource':
				return pageViews.utmSource;
			case 'utmMedium':
				return pageViews.utmMedium;
			case 'utmCampaign':
				return pageViews.utmCampaign;
			case 'referer':
				return pageViews.referer;
			case 'locale':
				return pageViews.locale;
			default:
				return pageViews.createdAt;
		}
	})();

	const orderBy = sortDir === 'asc' ? sortColumn : desc(sortColumn);

	const fromDate = dateFrom ? new Date(dateFrom) : null;
	const toDate = dateTo ? new Date(dateTo) : null;
	const rangeDays =
		fromDate && toDate
			? Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
			: null;
	const useHourly = rangeDays !== null && rangeDays <= 1;

	const timelineFormat = useHourly
		? sql<string>`TO_CHAR(${pageViews.createdAt}, 'HH24:00')`
		: sql<string>`TO_CHAR(${pageViews.createdAt}, 'DD.MM')`;
	const timelineGroupBy = useHourly
		? sql`TO_CHAR(${pageViews.createdAt}, 'HH24:00')`
		: sql`DATE(${pageViews.createdAt})`;
	const timelineOrderBy = useHourly
		? sql`TO_CHAR(${pageViews.createdAt}, 'HH24:00')`
		: sql`DATE(${pageViews.createdAt})`;

	const [
		views,
		totalResult,
		uniqueVisitorsResult,
		sourceStats,
		campaignStats,
		dailyStats,
		allSources,
		trafficTimeline
	] = await Promise.all([
		db
			.select()
			.from(pageViews)
			.where(whereClause)
			.orderBy(orderBy)
			.limit(perPage)
			.offset((page - 1) * perPage),

		db.select({ count: count() }).from(pageViews).where(whereClause),

		db
			.select({ count: countDistinct(pageViews.visitorId) })
			.from(pageViews)
			.where(whereClause),

		db
			.select({ source: pageViews.utmSource, count: count() })
			.from(pageViews)
			.where(whereClause)
			.groupBy(pageViews.utmSource)
			.orderBy(desc(count()))
			.limit(10),

		db
			.select({ campaign: pageViews.utmCampaign, count: count() })
			.from(pageViews)
			.where(and(whereClause, sql`${pageViews.utmCampaign} IS NOT NULL`))
			.groupBy(pageViews.utmCampaign)
			.orderBy(desc(count()))
			.limit(10),

		db
			.select({
				date: sql<string>`DATE(${pageViews.createdAt})`.as('date'),
				count: count()
			})
			.from(pageViews)
			.where(whereClause)
			.groupBy(sql`DATE(${pageViews.createdAt})`)
			.orderBy(sql`DATE(${pageViews.createdAt})`),

		db
			.selectDistinct({ source: pageViews.utmSource })
			.from(pageViews)
			.where(sql`${pageViews.utmSource} IS NOT NULL`),

		db
			.select({
				label: timelineFormat.as('label'),
				count: count()
			})
			.from(pageViews)
			.where(whereClause)
			.groupBy(timelineGroupBy, timelineFormat)
			.orderBy(timelineOrderBy)
	]);

	const todayViews =
		dailyStats.find((d) => d.date === new Date().toISOString().split('T')[0])?.count ?? 0;
	const topSource = sourceStats[0]?.source ?? 'Direct';

	return {
		views: views.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() })),
		totalViews: totalResult[0]?.count ?? 0,
		uniqueVisitors: uniqueVisitorsResult[0]?.count ?? 0,
		todayViews,
		topSource,
		sourceStats: sourceStats.map((s) => ({ source: s.source ?? 'Direct', count: s.count })),
		campaignStats: campaignStats.map((c) => ({ campaign: c.campaign ?? 'None', count: c.count })),
		dailyStats: dailyStats.map((d) => ({ date: d.date, count: d.count })),
		trafficTimeline: trafficTimeline.map((t) => ({ label: t.label, count: t.count })),
		allSources: allSources.map((s) => s.source).filter((s): s is string => s !== null),
		pagination: {
			page,
			perPage,
			total: totalResult[0]?.count ?? 0,
			totalPages: Math.ceil((totalResult[0]?.count ?? 0) / perPage)
		},
		filters: { sortBy, sortDir, dateFrom, dateTo, source: sourceFilter }
	};
};
