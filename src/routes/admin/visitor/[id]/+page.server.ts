import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageViews, visitorEvents } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const visitorId = params.id;

	if (!visitorId) {
		error(404, 'Visitor ID is required');
	}

	const views = await db
		.select()
		.from(pageViews)
		.where(eq(pageViews.visitorId, visitorId))
		.orderBy(desc(pageViews.createdAt));

	const events = await db
		.select()
		.from(visitorEvents)
		.where(eq(visitorEvents.visitorId, visitorId))
		.orderBy(desc(visitorEvents.createdAt));

	if (views.length === 0 && events.length === 0) {
		error(404, 'Visitor not found');
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
		totalPageViews: views.length,
		totalEvents: events.length
	};
};
