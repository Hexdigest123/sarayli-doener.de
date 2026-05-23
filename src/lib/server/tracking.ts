import type { Handle, RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageViews } from '$lib/server/db/schema';
import { generateVisitorId, parseClientFingerprint } from '$lib/server/fingerprint';
import { rateLimit } from '$lib/server/rate-limit';

// Bound stored analytics strings so a crafted request (long UA / referer / query
// string) can't write oversized rows.
const cap = (value: string | null, max: number): string | null =>
	value == null ? null : value.slice(0, max);

const REFERER_SOURCE_MAP: [pattern: string, source: string, medium: string][] = [
	['tiktok.com', 'tiktok', 'social'],
	['instagram.com', 'instagram', 'social'],
	['facebook.com', 'facebook', 'social'],
	['fb.com', 'facebook', 'social'],
	['twitter.com', 'twitter', 'social'],
	['x.com', 'twitter', 'social'],
	['t.co', 'twitter', 'social'],
	['youtube.com', 'youtube', 'social'],
	['youtu.be', 'youtube', 'social'],
	['linkedin.com', 'linkedin', 'social'],
	['pinterest.com', 'pinterest', 'social'],
	['reddit.com', 'reddit', 'social'],
	['snapchat.com', 'snapchat', 'social'],
	['whatsapp.com', 'whatsapp', 'social'],
	['wa.me', 'whatsapp', 'social'],
	['telegram.org', 'telegram', 'social'],
	['t.me', 'telegram', 'social'],
	['google.com', 'google', 'organic'],
	['google.de', 'google', 'organic'],
	['bing.com', 'bing', 'organic'],
	['duckduckgo.com', 'duckduckgo', 'organic'],
	['yahoo.com', 'yahoo', 'organic'],
	['ecosia.org', 'ecosia', 'organic'],
	['maps.google', 'google_maps', 'listing'],
	['maps.app.goo.gl', 'google_maps', 'listing'],
	['yelp.com', 'yelp', 'review'],
	['tripadvisor.com', 'tripadvisor', 'review'],
	['lieferando.de', 'lieferando', 'referral'],
	['uber.com', 'uber_eats', 'referral']
];

function inferSourceFromReferer(referer: string): { source: string; medium: string } | null {
	let hostname: string;
	try {
		hostname = new URL(referer).hostname.toLowerCase();
	} catch {
		return null;
	}

	for (const [pattern, source, medium] of REFERER_SOURCE_MAP) {
		if (hostname.includes(pattern)) {
			return { source, medium };
		}
	}

	return null;
}

const getLocaleFromPath = (pathname: string): 'de' | 'en' | 'tr' => {
	const firstSegment = pathname.split('/').filter(Boolean)[0];

	if (firstSegment === 'de' || firstSegment === 'en' || firstSegment === 'tr') {
		return firstSegment;
	}

	return 'de';
};

export function computeVisitorId(event: RequestEvent): string {
	const ip = event.getClientAddress();
	const userAgent = event.request.headers.get('user-agent');
	const acceptLanguage = event.request.headers.get('accept-language');
	const clientSignals = parseClientFingerprint(event.cookies.get('_vfp'));

	return generateVisitorId({
		ip,
		userAgent,
		acceptLanguage,
		...clientSignals
	});
}

export async function trackPageView(event: RequestEvent): Promise<void> {
	try {
		const referer = event.request.headers.get('referer');
		const utmSource = event.url.searchParams.get('utm_source');
		const utmMedium = event.url.searchParams.get('utm_medium');

		let source = utmSource;
		let medium = utmMedium;

		if (!source && referer) {
			const inferred = inferSourceFromReferer(referer);
			if (inferred) {
				source = inferred.source;
				medium = medium ?? inferred.medium;
			}
		}

		const ip = event.getClientAddress();
		const userAgent = event.request.headers.get('user-agent');
		const visitorId = computeVisitorId(event);

		await db.insert(pageViews).values({
			ipAddress: ip,
			visitorId,
			userAgent: cap(userAgent, 512),
			referer: cap(referer, 2048),
			landingPage: cap(`${event.url.pathname}${event.url.search}`, 2048) ?? '/',
			utmSource: cap(source, 256),
			utmMedium: cap(medium, 256),
			utmCampaign: cap(event.url.searchParams.get('utm_campaign'), 256),
			utmTerm: cap(event.url.searchParams.get('utm_term'), 256),
			utmContent: cap(event.url.searchParams.get('utm_content'), 256),
			locale: getLocaleFromPath(event.url.pathname)
		});
	} catch (error) {
		console.error('Failed to track page view', error);
	}
}

export const handleTracking: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	const consent = event.cookies.get('tracking_consent');

	if (
		consent === 'granted' &&
		!pathname.includes('.') &&
		!pathname.startsWith('/admin') &&
		!pathname.startsWith('/_app') &&
		!pathname.startsWith('/api')
	) {
		// Cap page-view inserts per IP so a flood of requests can't bloat the table.
		// Generous enough that normal browsing is never throttled.
		if (rateLimit('pageview', event.getClientAddress(), 60, 60 * 1000).allowed) {
			void trackPageView(event);
		}
	}

	return resolve(event);
};
