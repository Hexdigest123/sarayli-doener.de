import type { Handle, RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageViews } from '$lib/server/db/schema';
import { generateVisitorId, parseClientFingerprint } from '$lib/server/fingerprint';

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
		const acceptLanguage = event.request.headers.get('accept-language');
		const clientSignals = parseClientFingerprint(event.cookies.get('_vfp'));

		const visitorId = generateVisitorId({
			ip,
			userAgent,
			acceptLanguage,
			...clientSignals
		});

		await db.insert(pageViews).values({
			ipAddress: ip,
			visitorId,
			userAgent,
			referer,
			landingPage: `${event.url.pathname}${event.url.search}`,
			utmSource: source,
			utmMedium: medium,
			utmCampaign: event.url.searchParams.get('utm_campaign'),
			utmTerm: event.url.searchParams.get('utm_term'),
			utmContent: event.url.searchParams.get('utm_content'),
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
		void trackPageView(event);
	}

	return resolve(event);
};
