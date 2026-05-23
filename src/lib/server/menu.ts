import { asc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { menuCategories, menuItems, type MenuItemRow } from '$lib/server/db/schema';
import { menuCategories as seedCategories, DOENER_ITEM_IDS } from '$lib/config';
import type { PublicMenuCategory, PublicMenuItem } from '$lib/menu-types';
import deMessages from '../../../messages/de.json';
import enMessages from '../../../messages/en.json';
import trMessages from '../../../messages/tr.json';

const deMsg = deMessages as Record<string, string>;
const enMsg = enMessages as Record<string, string>;
const trMsg = trMessages as Record<string, string>;

// Maps the legacy config category ids to their translation keys (cat_*).
const CAT_MESSAGE_KEY: Record<string, string> = {
	doener: 'cat_doener',
	teig: 'cat_teig',
	imbiss: 'cat_imbiss',
	suppen: 'cat_suppen',
	salat: 'cat_salat',
	extras: 'cat_extras',
	getraenke: 'cat_getraenke'
};

// Arbitrary key for the advisory lock that serializes the one-time seed across
// concurrent requests / instances.
const SEED_LOCK_KEY = 739104;

interface Localized {
	de: string;
	en: string | null;
	tr: string | null;
}

function localized(key: string | undefined): Localized | null {
	if (!key) return null;
	const de = deMsg[key];
	if (de === undefined) return null;
	return { de, en: enMsg[key] ?? null, tr: trMsg[key] ?? null };
}

// ---------------------------------------------------------------------------
// First-launch seeding
// ---------------------------------------------------------------------------

async function seedMenu(): Promise<void> {
	await db.transaction(async (tx) => {
		// Serialize against other concurrent seeders (other requests / instances).
		await tx.execute(sql`select pg_advisory_xact_lock(${SEED_LOCK_KEY})`);

		const existing = await tx.select({ id: menuCategories.id }).from(menuCategories).limit(1);
		if (existing.length > 0) return;

		for (let ci = 0; ci < seedCategories.length; ci++) {
			const cat = seedCategories[ci];
			const name = localized(CAT_MESSAGE_KEY[cat.id]) ?? { de: cat.name, en: null, tr: null };
			const [insertedCat] = await tx
				.insert(menuCategories)
				.values({ nameDe: name.de, nameEn: name.en, nameTr: name.tr, sortOrder: ci })
				.returning({ id: menuCategories.id });

			for (let ii = 0; ii < cat.items.length; ii++) {
				const item = cat.items[ii];
				const itemName = localized(item.nameKey) ?? { de: item.nameKey, en: null, tr: null };
				const desc = localized(item.descKey);
				const size = localized(item.sizeKey);
				// Preserve the original numeric ids so existing carts, Stripe metadata and
				// historical order_items.menu_item_id keep resolving to the same meal.
				await tx.insert(menuItems).values({
					id: item.id,
					categoryId: insertedCat.id,
					nameDe: itemName.de,
					nameEn: itemName.en,
					nameTr: itemName.tr,
					descDe: desc?.de ?? null,
					descEn: desc?.en ?? null,
					descTr: desc?.tr ?? null,
					sizeDe: size?.de ?? null,
					sizeEn: size?.en ?? null,
					sizeTr: size?.tr ?? null,
					priceCents: Math.round(item.price * 100),
					supportsExtras: DOENER_ITEM_IDS.has(item.id) ? 1 : 0,
					isAvailable: 1,
					sortOrder: ii
				});
			}
		}

		// Move the serial sequence past the explicitly inserted ids so admin-created
		// items get fresh ids instead of colliding with the seeded ones.
		await tx.execute(
			sql`select setval(pg_get_serial_sequence('menu_items', 'id'), (select max(id) from menu_items))`
		);
	});
}

let seedPromise: Promise<void> | null = null;

/**
 * Idempotently seed the menu tables from config.ts + the messages/*.json
 * translations on first launch. Safe to call on every menu-facing load: it
 * no-ops once the tables hold data. Call this before reading the menu.
 */
export function ensureMenuSeeded(): Promise<void> {
	if (!seedPromise) {
		seedPromise = seedMenu().catch((err) => {
			seedPromise = null; // allow a retry on the next request
			throw err;
		});
	}
	return seedPromise;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

function toPublicItem(it: MenuItemRow): PublicMenuItem {
	return {
		id: it.id,
		name: { de: it.nameDe, en: it.nameEn, tr: it.nameTr },
		desc: it.descDe ? { de: it.descDe, en: it.descEn, tr: it.descTr } : null,
		size: it.sizeDe ? { de: it.sizeDe, en: it.sizeEn, tr: it.sizeTr } : null,
		price: it.priceCents / 100,
		supportsExtras: it.supportsExtras === 1
	};
}

/** Available items grouped by category, for the public page. Empty categories are dropped. */
export async function getPublicMenu(): Promise<PublicMenuCategory[]> {
	const cats = await db
		.select()
		.from(menuCategories)
		.orderBy(asc(menuCategories.sortOrder), asc(menuCategories.id));
	const items = await db
		.select()
		.from(menuItems)
		.where(eq(menuItems.isAvailable, 1))
		.orderBy(asc(menuItems.sortOrder), asc(menuItems.id));

	const byCat = new Map<number, PublicMenuItem[]>();
	for (const it of items) {
		const list = byCat.get(it.categoryId) ?? [];
		list.push(toPublicItem(it));
		byCat.set(it.categoryId, list);
	}

	return cats
		.map((c) => ({
			id: c.id,
			name: { de: c.nameDe, en: c.nameEn, tr: c.nameTr },
			items: byCat.get(c.id) ?? []
		}))
		.filter((c) => c.items.length > 0);
}

export interface AdminMenuCategory {
	id: number;
	nameDe: string;
	nameEn: string | null;
	nameTr: string | null;
	sortOrder: number;
	items: MenuItemRow[];
}

/** Every category and item (including unavailable ones), for the admin editor. */
export async function getAdminMenu(): Promise<AdminMenuCategory[]> {
	const cats = await db
		.select()
		.from(menuCategories)
		.orderBy(asc(menuCategories.sortOrder), asc(menuCategories.id));
	const items = await db
		.select()
		.from(menuItems)
		.orderBy(asc(menuItems.sortOrder), asc(menuItems.id));

	return cats.map((c) => ({
		id: c.id,
		nameDe: c.nameDe,
		nameEn: c.nameEn,
		nameTr: c.nameTr,
		sortOrder: c.sortOrder,
		items: items.filter((it) => it.categoryId === c.id)
	}));
}

/**
 * Authoritative pricing/name lookup for checkout. Only available items are
 * returned, so an item hidden by the admin cannot be ordered. Names use German
 * (the base locale) for the order record and Stripe line item.
 */
export async function getOrderableItems(): Promise<
	Map<number, { priceCents: number; name: string }>
> {
	const rows = await db
		.select({
			id: menuItems.id,
			priceCents: menuItems.priceCents,
			nameDe: menuItems.nameDe,
			isAvailable: menuItems.isAvailable
		})
		.from(menuItems);

	const map = new Map<number, { priceCents: number; name: string }>();
	for (const r of rows) {
		if (r.isAvailable !== 1) continue;
		map.set(r.id, { priceCents: r.priceCents, name: r.nameDe });
	}
	return map;
}

// ---------------------------------------------------------------------------
// Mutations (category + item CRUD). Callers must have already enforced admin auth.
// ---------------------------------------------------------------------------

export interface CategoryInput {
	nameDe: string;
	nameEn: string | null;
	nameTr: string | null;
}

export interface ItemInput {
	categoryId: number;
	nameDe: string;
	nameEn: string | null;
	nameTr: string | null;
	descDe: string | null;
	descEn: string | null;
	descTr: string | null;
	sizeDe: string | null;
	sizeEn: string | null;
	sizeTr: string | null;
	priceCents: number;
	supportsExtras: boolean;
	isAvailable: boolean;
}

export async function createCategory(input: CategoryInput): Promise<void> {
	const [{ max }] = await db
		.select({ max: sql<number>`coalesce(max(${menuCategories.sortOrder}), -1)` })
		.from(menuCategories);
	await db.insert(menuCategories).values({
		nameDe: input.nameDe,
		nameEn: input.nameEn,
		nameTr: input.nameTr,
		sortOrder: max + 1
	});
}

export async function updateCategory(id: number, input: CategoryInput): Promise<void> {
	await db
		.update(menuCategories)
		.set({
			nameDe: input.nameDe,
			nameEn: input.nameEn,
			nameTr: input.nameTr,
			updatedAt: new Date()
		})
		.where(eq(menuCategories.id, id));
}

/** Refuses to delete a category that still has meals, to avoid orphaning them. */
export async function deleteCategory(id: number): Promise<{ ok: boolean; reason?: 'not_empty' }> {
	const [child] = await db
		.select({ id: menuItems.id })
		.from(menuItems)
		.where(eq(menuItems.categoryId, id))
		.limit(1);
	if (child) return { ok: false, reason: 'not_empty' };
	await db.delete(menuCategories).where(eq(menuCategories.id, id));
	return { ok: true };
}

export async function createItem(input: ItemInput): Promise<void> {
	const [{ max }] = await db
		.select({ max: sql<number>`coalesce(max(${menuItems.sortOrder}), -1)` })
		.from(menuItems)
		.where(eq(menuItems.categoryId, input.categoryId));
	await db.insert(menuItems).values({
		categoryId: input.categoryId,
		nameDe: input.nameDe,
		nameEn: input.nameEn,
		nameTr: input.nameTr,
		descDe: input.descDe,
		descEn: input.descEn,
		descTr: input.descTr,
		sizeDe: input.sizeDe,
		sizeEn: input.sizeEn,
		sizeTr: input.sizeTr,
		priceCents: input.priceCents,
		supportsExtras: input.supportsExtras ? 1 : 0,
		isAvailable: input.isAvailable ? 1 : 0,
		sortOrder: max + 1
	});
}

export async function updateItem(id: number, input: ItemInput): Promise<void> {
	await db
		.update(menuItems)
		.set({
			categoryId: input.categoryId,
			nameDe: input.nameDe,
			nameEn: input.nameEn,
			nameTr: input.nameTr,
			descDe: input.descDe,
			descEn: input.descEn,
			descTr: input.descTr,
			sizeDe: input.sizeDe,
			sizeEn: input.sizeEn,
			sizeTr: input.sizeTr,
			priceCents: input.priceCents,
			supportsExtras: input.supportsExtras ? 1 : 0,
			isAvailable: input.isAvailable ? 1 : 0,
			updatedAt: new Date()
		})
		.where(eq(menuItems.id, id));
}

export async function deleteItem(id: number): Promise<void> {
	await db.delete(menuItems).where(eq(menuItems.id, id));
}

export async function setItemAvailability(id: number, available: boolean): Promise<void> {
	await db
		.update(menuItems)
		.set({ isAvailable: available ? 1 : 0, updatedAt: new Date() })
		.where(eq(menuItems.id, id));
}

export async function moveItem(id: number, dir: 'up' | 'down'): Promise<void> {
	const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
	if (!item) return;
	const siblings = await db
		.select()
		.from(menuItems)
		.where(eq(menuItems.categoryId, item.categoryId))
		.orderBy(asc(menuItems.sortOrder), asc(menuItems.id));
	const idx = siblings.findIndex((s) => s.id === id);
	const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
	if (swapIdx < 0 || swapIdx >= siblings.length) return;
	const other = siblings[swapIdx];
	await db.transaction(async (tx) => {
		await tx.update(menuItems).set({ sortOrder: other.sortOrder }).where(eq(menuItems.id, item.id));
		await tx.update(menuItems).set({ sortOrder: item.sortOrder }).where(eq(menuItems.id, other.id));
	});
}

export async function moveCategory(id: number, dir: 'up' | 'down'): Promise<void> {
	const cats = await db
		.select()
		.from(menuCategories)
		.orderBy(asc(menuCategories.sortOrder), asc(menuCategories.id));
	const idx = cats.findIndex((c) => c.id === id);
	if (idx < 0) return;
	const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
	if (swapIdx < 0 || swapIdx >= cats.length) return;
	const current = cats[idx];
	const other = cats[swapIdx];
	await db.transaction(async (tx) => {
		await tx
			.update(menuCategories)
			.set({ sortOrder: other.sortOrder })
			.where(eq(menuCategories.id, current.id));
		await tx
			.update(menuCategories)
			.set({ sortOrder: current.sortOrder })
			.where(eq(menuCategories.id, other.id));
	});
}
