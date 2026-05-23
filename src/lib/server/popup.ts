import { db } from '$lib/server/db';
import { sitePopup, type SitePopup } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const POPUP_ROW_ID = 1;

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

// What the public site needs to render the popup. `version` lets the client remember a
// per-visitor dismissal that resets whenever the admin republishes new content.
export type PublicPopup = {
	title: string;
	body: string | null;
	imageUrl: string | null;
	badge: string | null;
	ctaLabel: string | null;
	ctaUrl: string | null;
	version: number;
};

async function getRow(): Promise<SitePopup | null> {
	const [row] = await db.select().from(sitePopup).where(eq(sitePopup.id, POPUP_ROW_ID));
	return row ?? null;
}

/** Full row for the admin editor (active or not). */
export async function getPopup(): Promise<SitePopup | null> {
	return getRow();
}

/** Active popup shaped for the public site, or null when none is live. */
export async function getActivePopup(): Promise<PublicPopup | null> {
	const row = await getRow();
	if (!row || row.active !== 1 || !row.title.trim()) return null;
	return {
		title: row.title,
		body: row.body,
		imageUrl: row.imageUrl,
		badge: row.badge,
		ctaLabel: row.ctaLabel,
		ctaUrl: row.ctaUrl,
		version: row.updatedAt.getTime()
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

/** Upsert the popup content and mark it active. Bumps the version (updatedAt). */
export async function savePopup(input: PopupInput): Promise<void> {
	const values = {
		active: 1,
		title: input.title,
		body: input.body,
		imageUrl: input.imageUrl,
		badge: input.badge,
		ctaLabel: input.ctaLabel,
		ctaUrl: input.ctaUrl,
		updatedAt: new Date()
	};

	const existing = await getRow();
	if (existing) {
		await db.update(sitePopup).set(values).where(eq(sitePopup.id, POPUP_ROW_ID));
	} else {
		await db.insert(sitePopup).values({ id: POPUP_ROW_ID, ...values });
	}
}

/** Save the popup as a draft without showing it to visitors. */
export async function saveDraft(input: PopupInput): Promise<void> {
	const values = {
		active: 0,
		title: input.title,
		body: input.body,
		imageUrl: input.imageUrl,
		badge: input.badge,
		ctaLabel: input.ctaLabel,
		ctaUrl: input.ctaUrl,
		updatedAt: new Date()
	};

	const existing = await getRow();
	if (existing) {
		await db.update(sitePopup).set(values).where(eq(sitePopup.id, POPUP_ROW_ID));
	} else {
		await db.insert(sitePopup).values({ id: POPUP_ROW_ID, ...values });
	}
}

/** Take the popup down. Content is kept so it can be re-published later. */
export async function removePopup(): Promise<void> {
	const existing = await getRow();
	if (!existing) return;
	await db
		.update(sitePopup)
		.set({ active: 0, updatedAt: new Date() })
		.where(eq(sitePopup.id, POPUP_ROW_ID));
}
