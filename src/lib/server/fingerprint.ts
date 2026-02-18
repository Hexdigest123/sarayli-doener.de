import { createHash } from 'node:crypto';

export interface FingerprintSignals {
	ip: string;
	userAgent: string | null;
	acceptLanguage: string | null;
	screenWidth?: number;
	screenHeight?: number;
	timezone?: string;
	platform?: string;
	language?: string;
	colorDepth?: number;
	devicePixelRatio?: number;
	maxTouchPoints?: number;
	hardwareConcurrency?: number;
}

/**
 * Generate a deterministic visitor ID from multiple browser/request signals.
 * Uses SHA-256 to produce a 64-char hex hash.
 *
 * Signal concatenation order is fixed and uses '|' separator.
 * Missing optional signals are represented as empty strings.
 */
export function generateVisitorId(signals: FingerprintSignals): string {
	const parts = [
		signals.ip,
		signals.userAgent ?? '',
		signals.acceptLanguage ?? '',
		signals.screenWidth?.toString() ?? '',
		signals.screenHeight?.toString() ?? '',
		signals.timezone ?? '',
		signals.platform ?? '',
		signals.language ?? '',
		signals.colorDepth?.toString() ?? '',
		signals.devicePixelRatio?.toString() ?? '',
		signals.maxTouchPoints?.toString() ?? '',
		signals.hardwareConcurrency?.toString() ?? ''
	];

	const raw = parts.join('|');
	return createHash('sha256').update(raw).digest('hex');
}

/**
 * Parse the client fingerprint cookie (_vfp) safely.
 * Returns partial signals or empty object if cookie is missing/malformed.
 */
export function parseClientFingerprint(
	cookieValue: string | undefined
): Partial<FingerprintSignals> {
	if (!cookieValue) return {};

	try {
		const parsed = JSON.parse(decodeURIComponent(cookieValue));
		if (typeof parsed !== 'object' || parsed === null) return {};

		return {
			screenWidth: typeof parsed.sw === 'number' ? parsed.sw : undefined,
			screenHeight: typeof parsed.sh === 'number' ? parsed.sh : undefined,
			timezone: typeof parsed.tz === 'string' ? parsed.tz : undefined,
			platform: typeof parsed.pl === 'string' ? parsed.pl : undefined,
			language: typeof parsed.lang === 'string' ? parsed.lang : undefined,
			colorDepth: typeof parsed.cd === 'number' ? parsed.cd : undefined,
			devicePixelRatio: typeof parsed.dpr === 'number' ? parsed.dpr : undefined,
			maxTouchPoints: typeof parsed.tp === 'number' ? parsed.tp : undefined,
			hardwareConcurrency: typeof parsed.hc === 'number' ? parsed.hc : undefined
		};
	} catch {
		return {};
	}
}
