import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const pageViews = pgTable('page_views', {
	id: serial('id').primaryKey(),
	ipAddress: text('ip_address').notNull(),
	visitorId: text('visitor_id'),
	userAgent: text('user_agent'),
	referer: text('referer'),
	landingPage: text('landing_page').notNull(),
	utmSource: text('utm_source'),
	utmMedium: text('utm_medium'),
	utmCampaign: text('utm_campaign'),
	utmTerm: text('utm_term'),
	utmContent: text('utm_content'),
	locale: text('locale'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
