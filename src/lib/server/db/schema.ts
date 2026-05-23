import { sql } from 'drizzle-orm';
import {
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core';

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

export const visitorEvents = pgTable(
	'visitor_events',
	{
		id: serial('id').primaryKey(),
		visitorId: text('visitor_id').notNull(),
		eventType: text('event_type').notNull(),
		page: text('page').notNull(),
		metadata: jsonb('metadata'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('visitor_events_visitor_id_created_at_idx').on(table.visitorId, table.createdAt)
	]
);

export type VisitorEvent = typeof visitorEvents.$inferSelect;
export type NewVisitorEvent = typeof visitorEvents.$inferInsert;

export const orders = pgTable(
	'orders',
	{
		id: serial('id').primaryKey(),
		orderNumber: text('order_number').unique().notNull(),
		stripeSessionId: text('stripe_session_id').unique(),
		stripePaymentIntentId: text('stripe_payment_intent_id'),
		status: text('status').notNull().default('pending'),
		orderType: text('order_type').notNull(),
		customerName: text('customer_name').notNull(),
		customerPhone: text('customer_phone').notNull(),
		customerEmail: text('customer_email'),
		pickupTime: text('pickup_time'),
		totalAmount: integer('total_amount').notNull(),
		currency: text('currency').notNull().default('eur'),
		visitorId: text('visitor_id'),
		notes: text('notes'),
		metadata: jsonb('metadata'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		paidAt: timestamp('paid_at', { withTimezone: true }),
		fulfilledAt: timestamp('fulfilled_at', { withTimezone: true }),
		cancellationRequestedAt: timestamp('cancellation_requested_at', { withTimezone: true })
	},
	(table) => [
		index('orders_status_idx').on(table.status),
		index('orders_created_at_idx').on(table.createdAt),
		index('orders_stripe_session_id_idx').on(table.stripeSessionId),
		index('orders_order_number_idx').on(table.orderNumber)
	]
);

export const orderItems = pgTable('order_items', {
	id: serial('id').primaryKey(),
	orderId: integer('order_id')
		.notNull()
		.references(() => orders.id),
	menuItemId: integer('menu_item_id').notNull(),
	itemName: text('item_name').notNull(),
	quantity: integer('quantity').notNull(),
	unitPrice: integer('unit_price').notNull(),
	extras: text('extras'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Menu is fully admin-managed and persisted here. On first launch the tables are
// seeded from src/lib/config.ts + the messages/*.json translations (see
// src/lib/server/menu.ts → ensureMenuSeeded). Text is stored per locale (de required,
// en/tr optional and fall back to de) because Paraglide messages are compiled at build
// time and cannot represent meals created at runtime.
export const menuCategories = pgTable(
	'menu_categories',
	{
		id: serial('id').primaryKey(),
		nameDe: text('name_de').notNull(),
		nameEn: text('name_en'),
		nameTr: text('name_tr'),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('menu_categories_sort_order_idx').on(table.sortOrder)]
);

export const menuItems = pgTable(
	'menu_items',
	{
		id: serial('id').primaryKey(),
		categoryId: integer('category_id')
			.notNull()
			.references(() => menuCategories.id),
		nameDe: text('name_de').notNull(),
		nameEn: text('name_en'),
		nameTr: text('name_tr'),
		descDe: text('desc_de'),
		descEn: text('desc_en'),
		descTr: text('desc_tr'),
		sizeDe: text('size_de'),
		sizeEn: text('size_en'),
		sizeTr: text('size_tr'),
		// Price in cents, matching orders.totalAmount / order_items.unit_price.
		priceCents: integer('price_cents').notNull(),
		// 1 when the item shows the free-toppings ("Extras") picker (formerly DOENER_ITEM_IDS).
		supportsExtras: integer('supports_extras').notNull().default(0),
		// 0 hides the item from the public menu without deleting it.
		isAvailable: integer('is_available').notNull().default(1),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('menu_items_category_id_sort_order_idx').on(table.categoryId, table.sortOrder)]
);

export type MenuCategoryRow = typeof menuCategories.$inferSelect;
export type NewMenuCategoryRow = typeof menuCategories.$inferInsert;
export type MenuItemRow = typeof menuItems.$inferSelect;
export type NewMenuItemRow = typeof menuItems.$inferInsert;

export const storeSettings = pgTable('store_settings', {
	id: serial('id').primaryKey(),
	isOpen: integer('is_open').notNull().default(1),
	mode: text('mode').notNull().default('auto'),
	closedMessage: text('closed_message'),
	shopEnabled: integer('shop_enabled').notNull().default(1),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Admin sessions are persisted server-side so they survive restarts and are shared
// across instances. The primary key is a SHA-256 hash of the session token, never the
// token itself, so a leaked DB row cannot be replayed as a valid session cookie.
export const adminSessions = pgTable('admin_sessions', {
	tokenHash: text('token_hash').primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Admin-managed site popups. Each row is a saved draft; the admin can keep several and
// publish one at a time. The `site_popup_single_active_idx` partial unique index
// enforces that at most one row has `active` = 1, so the public site always has a single
// source of truth (publishing one popup deactivates the rest in the same transaction).
// `imageUrl` holds either an external URL or a self-contained data URL produced when an
// image is uploaded from the admin's device. `updatedAt` doubles as a version token:
// bumping it re-shows the popup to visitors who had already dismissed an earlier version.
// `closesShop` = 1 means the store counts as closed for as long as this popup is the live
// one (orders are blocked), so an announcement and a closure can be published in one step.
export const sitePopup = pgTable(
	'site_popup',
	{
		id: serial('id').primaryKey(),
		active: integer('active').notNull().default(0),
		title: text('title').notNull().default(''),
		body: text('body'),
		imageUrl: text('image_url'),
		badge: text('badge'),
		ctaLabel: text('cta_label'),
		ctaUrl: text('cta_url'),
		closesShop: integer('closes_shop').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('site_popup_single_active_idx')
			.on(table.active)
			.where(sql`${table.active} = 1`)
	]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type StoreSettings = typeof storeSettings.$inferSelect;
export type SitePopup = typeof sitePopup.$inferSelect;
export type NewSitePopup = typeof sitePopup.$inferInsert;
