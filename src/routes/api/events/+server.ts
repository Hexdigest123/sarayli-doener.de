import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { visitorEvents } from '$lib/server/db/schema';
import { computeVisitorId } from '$lib/server/tracking';
import { rateLimit } from '$lib/server/rate-limit';

const MAX_EVENTS_PER_REQUEST = 50;
const MAX_METADATA_BYTES = 2048;
const VALID_EVENT_TYPES = new Set(['scroll_depth', 'click']);

interface IncomingEvent {
	type: string;
	page: string;
	metadata?: Record<string, unknown>;
}

function isValidEvent(e: unknown): e is IncomingEvent {
	if (typeof e !== 'object' || e === null) return false;
	const obj = e as Record<string, unknown>;
	return (
		typeof obj.type === 'string' &&
		VALID_EVENT_TYPES.has(obj.type) &&
		typeof obj.page === 'string' &&
		obj.page.length > 0 &&
		obj.page.length <= 2048
	);
}

// Drop oversized or non-object metadata so a client can't grow the jsonb column
// without bound. Returns null when the blob is missing, malformed, or too large.
function boundMetadata(m: unknown): Record<string, unknown> | null {
	if (typeof m !== 'object' || m === null || Array.isArray(m)) return null;
	try {
		if (JSON.stringify(m).length > MAX_METADATA_BYTES) return null;
		return m as Record<string, unknown>;
	} catch {
		return null;
	}
}

export const POST: RequestHandler = async (event) => {
	// This endpoint writes to the DB on an unauthenticated, client-set consent
	// cookie, so cap the request rate per IP before doing any work.
	const limit = rateLimit('events', event.getClientAddress(), 60, 60 * 1000);
	if (!limit.allowed) {
		return json({ error: 'rate_limited' }, { status: 429 });
	}

	const consent = event.cookies.get('tracking_consent');
	if (consent !== 'granted') {
		return json({ error: 'consent_required' }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		return json({ error: 'invalid_json' }, { status: 400 });
	}

	if (
		typeof body !== 'object' ||
		body === null ||
		!Array.isArray((body as Record<string, unknown>).events)
	) {
		return json({ error: 'missing_events_array' }, { status: 400 });
	}

	const events = (body as { events: unknown[] }).events;

	if (events.length === 0) {
		return json({ ok: true });
	}

	if (events.length > MAX_EVENTS_PER_REQUEST) {
		return json({ error: 'too_many_events', max: MAX_EVENTS_PER_REQUEST }, { status: 400 });
	}

	const valid = events.filter(isValidEvent);
	if (valid.length === 0) {
		return json({ error: 'no_valid_events' }, { status: 400 });
	}

	const visitorId = computeVisitorId(event);

	await db.insert(visitorEvents).values(
		valid.map((e) => ({
			visitorId,
			eventType: e.type,
			page: e.page,
			metadata: boundMetadata(e.metadata)
		}))
	);

	return json({ ok: true, accepted: valid.length });
};
