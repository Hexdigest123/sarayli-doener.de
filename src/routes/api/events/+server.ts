import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { visitorEvents } from '$lib/server/db/schema';
import { computeVisitorId } from '$lib/server/tracking';

const MAX_EVENTS_PER_REQUEST = 50;
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

export const POST: RequestHandler = async (event) => {
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
			metadata: e.metadata ?? null
		}))
	);

	return json({ ok: true, accepted: valid.length });
};
