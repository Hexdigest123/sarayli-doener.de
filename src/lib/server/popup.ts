import { db } from '$lib/server/db';
import { sitePopup, type SitePopup } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { renderPopupBody } from '$lib/server/markdown';

// Field limits. The image, when uploaded from a device, is stored inline as a data
// URL, so it must stay well under the adapter-node request body limit (512 KB). The
// admin wizard downscales device uploads client-side to stay comfortably below this;
// the server cap is the backstop.
const MAX_TITLE_LENGTH = 120;
const MAX_BODY_LENGTH = 2000;
const MAX_BADGE_LENGTH = 40;
const MAX_CTA_LABEL_LENGTH = 60;
const MAX_CTA_URL_LENGTH = 2048;
const MAX_IMAGE_LENGTH = 500_000;

export type PopupInput = {
	title: string;
	body: string | null;
	imageUrl: string | null;
	badge: string | null;
	ctaLabel: string | null;
	ctaUrl: string | null;
};

// What the public site needs to render the popup. `bodyHtml` is the admin's Markdown
// already rendered and sanitised on the server, ready to drop into the popup with `@html`.
export type PublicPopup = {
	title: string;
	bodyHtml: string | null;
	imageUrl: string | null;
	badge: string | null;
	ctaLabel: string | null;
	ctaUrl: string | null;
};

/** List every saved popup (drafts and the live one), live first then newest edits. */
export async function listPopups(): Promise<SitePopup[]> {
	return db.select().from(sitePopup).orderBy(desc(sitePopup.active), desc(sitePopup.updatedAt));
}

/** A single popup by id, for the admin editor. */
export async function getPopupById(id: number): Promise<SitePopup | null> {
	const [row] = await db.select().from(sitePopup).where(eq(sitePopup.id, id));
	return row ?? null;
}

/** The currently active popup shaped for the public site, or null when none is live. */
export async function getActivePopup(): Promise<PublicPopup | null> {
	const [row] = await db.select().from(sitePopup).where(eq(sitePopup.active, 1)).limit(1);
	if (!row || !row.title.trim()) return null;
	return {
		title: row.title,
		bodyHtml: renderPopupBody(row.body),
		imageUrl: row.imageUrl,
		badge: row.badge,
		ctaLabel: row.ctaLabel,
		ctaUrl: row.ctaUrl
	};
}

function trimToNull(value: string | null | undefined): string | null {
	const trimmed = (value ?? '').trim();
	return trimmed.length > 0 ? trimmed : null;
}

function isValidImage(value: string): boolean {
	return (
		/^https?:\/\//i.test(value) || /^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(value)
	);
}

function isValidCtaUrl(value: string): boolean {
	// Allow absolute http(s) links, same-site paths, and in-page anchors.
	return /^https?:\/\//i.test(value) || value.startsWith('/') || value.startsWith('#');
}

/**
 * Validate and normalise raw form values into a clean popup record.
 * Returns either the normalised input or a human-readable error message.
 */
export function validatePopupInput(raw: {
	title?: unknown;
	body?: unknown;
	imageUrl?: unknown;
	badge?: unknown;
	ctaLabel?: unknown;
	ctaUrl?: unknown;
}): { ok: true; value: PopupInput } | { ok: false; error: string } {
	const asString = (v: unknown) => (typeof v === 'string' ? v : '');

	const title = asString(raw.title).trim();
	if (!title) return { ok: false, error: 'A title is required.' };
	if (title.length > MAX_TITLE_LENGTH) {
		return { ok: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
	}

	const body = trimToNull(asString(raw.body));
	if (body && body.length > MAX_BODY_LENGTH) {
		return { ok: false, error: `Description must be ${MAX_BODY_LENGTH} characters or fewer.` };
	}

	const badge = trimToNull(asString(raw.badge));
	if (badge && badge.length > MAX_BADGE_LENGTH) {
		return { ok: false, error: `Badge must be ${MAX_BADGE_LENGTH} characters or fewer.` };
	}

	const imageUrl = trimToNull(asString(raw.imageUrl));
	if (imageUrl) {
		if (imageUrl.length > MAX_IMAGE_LENGTH) {
			return {
				ok: false,
				error: 'The uploaded image is too large. Please use a smaller image or an image URL.'
			};
		}
		if (!isValidImage(imageUrl)) {
			return { ok: false, error: 'Image must be an http(s) URL or an uploaded image file.' };
		}
	}

	const ctaLabel = trimToNull(asString(raw.ctaLabel));
	if (ctaLabel && ctaLabel.length > MAX_CTA_LABEL_LENGTH) {
		return {
			ok: false,
			error: `Button label must be ${MAX_CTA_LABEL_LENGTH} characters or fewer.`
		};
	}

	const ctaUrl = trimToNull(asString(raw.ctaUrl));
	if (ctaUrl) {
		if (ctaUrl.length > MAX_CTA_URL_LENGTH) {
			return { ok: false, error: 'Button link is too long.' };
		}
		if (!isValidCtaUrl(ctaUrl)) {
			return {
				ok: false,
				error: 'Button link must be a URL (https://…), a path (/…) or an anchor (#…).'
			};
		}
	}

	// A button needs a destination to be useful; drop a label with no link.
	const finalCtaLabel = ctaUrl ? ctaLabel : null;

	return {
		ok: true,
		value: { title, body, imageUrl, badge, ctaLabel: finalCtaLabel, ctaUrl }
	};
}

function contentValues(input: PopupInput) {
	return {
		title: input.title,
		body: input.body,
		imageUrl: input.imageUrl,
		badge: input.badge,
		ctaLabel: input.ctaLabel,
		ctaUrl: input.ctaUrl,
		updatedAt: new Date()
	};
}

/**
 * Create a new draft or update an existing popup's content. Never changes the active
 * flag — a draft stays a draft and the live popup stays live (its content is refreshed).
 * Returns the row id so the caller can keep editing it. If `id` is given but no longer
 * exists, a new draft is created instead.
 */
export async function upsertPopup(id: number | null, input: PopupInput): Promise<number> {
	if (id != null) {
		const updated = await db
			.update(sitePopup)
			.set(contentValues(input))
			.where(eq(sitePopup.id, id))
			.returning({ id: sitePopup.id });
		if (updated.length > 0) return updated[0].id;
	}
	const [inserted] = await db
		.insert(sitePopup)
		.values({ active: 0, ...contentValues(input) })
		.returning({ id: sitePopup.id });
	return inserted.id;
}

/**
 * Make one popup the live one. Deactivates every other popup first so only a single
 * row is ever active (also guarded by the `site_popup_single_active_idx` partial unique
 * index). Bumps the activated row's `updatedAt` to record when it went live.
 */
export async function publishPopup(id: number): Promise<void> {
	await db.transaction(async (tx) => {
		await tx.update(sitePopup).set({ active: 0 }).where(eq(sitePopup.active, 1));
		await tx
			.update(sitePopup)
			.set({ active: 1, updatedAt: new Date() })
			.where(eq(sitePopup.id, id));
	});
}

/** Take the live popup down. Its content is kept as a draft so it can be re-published. */
export async function takeDownPopup(id: number): Promise<void> {
	await db.update(sitePopup).set({ active: 0, updatedAt: new Date() }).where(eq(sitePopup.id, id));
}

/** Permanently delete a saved popup. */
export async function deletePopup(id: number): Promise<void> {
	await db.delete(sitePopup).where(eq(sitePopup.id, id));
}
