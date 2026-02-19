import { index, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

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

export const storeSettings = pgTable('store_settings', {
	id: serial('id').primaryKey(),
	isOpen: integer('is_open').notNull().default(1),
	mode: text('mode').notNull().default('auto'),
	closedMessage: text('closed_message'),
	shopEnabled: integer('shop_enabled').notNull().default(1),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type StoreSettings = typeof storeSettings.$inferSelect;
