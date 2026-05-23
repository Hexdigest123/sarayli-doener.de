// In-memory throttles for the admin login (brute-force lockout) and the public
// write endpoints (fixed-window abuse limiting). Keyed by client IP.
//
// Note: state is process-local, matching a single-instance deployment. For a
// multi-instance/replica setup, back this with a shared store (Redis/Postgres)
// so the limit is enforced globally.
//
// SECURITY: every key here is the IP from event.getClientAddress(). With
// adapter-node + ADDRESS_HEADER=X-Forwarded-For (see docker-compose.yml), that IP
// is only trustworthy when the app is reachable *solely* through a reverse proxy
// that sets/overwrites X-Forwarded-For and XFF_DEPTH equals the number of trusted
// proxies. If the container is ever exposed directly (or XFF_DEPTH is wrong), a
// client can spoof X-Forwarded-For and defeat every limit below. Keep the proxy in
// front and XFF_DEPTH accurate.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // failures counted within this window
const LOCKOUT_MS = 15 * 60 * 1000; // lockout duration once the limit is hit

type Attempt = { count: number; firstAt: number; lockedUntil: number };

const attempts = new Map<string, Attempt>();

/**
 * Returns the number of seconds the caller must wait before retrying, or 0 if a
 * login attempt is currently allowed for this key.
 */
export function checkLoginRateLimit(key: string): number {
	const now = Date.now();
	const entry = attempts.get(key);
	if (!entry) return 0;
	if (entry.lockedUntil > now) {
		return Math.ceil((entry.lockedUntil - now) / 1000);
	}
	return 0;
}

export function recordLoginFailure(key: string): void {
	const now = Date.now();
	const entry = attempts.get(key);

	if (!entry || now - entry.firstAt > WINDOW_MS) {
		attempts.set(key, { count: 1, firstAt: now, lockedUntil: 0 });
		return;
	}

	entry.count += 1;
	if (entry.count >= MAX_ATTEMPTS) {
		entry.lockedUntil = now + LOCKOUT_MS;
	}
}

export function resetLoginRateLimit(key: string): void {
	attempts.delete(key);
}

// --- Generic fixed-window limiter for public write endpoints ----------------

type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();

// Drop expired windows periodically so a flood of distinct (possibly spoofed)
// keys cannot grow the map without bound.
let lastSweep = 0;
function sweep(now: number): void {
	if (now - lastSweep < 60_000) return;
	lastSweep = now;
	for (const [key, win] of windows) {
		if (win.resetAt <= now) windows.delete(key);
	}
}

/**
 * Fixed-window rate limit. Each call within the window counts against `limit`
 * (including the call that trips it). Returns whether the call is allowed and,
 * when blocked, the seconds until the window resets.
 *
 * `bucket` namespaces independent limits (e.g. 'checkout' vs 'events') so they
 * don't share counters for the same IP.
 */
export function rateLimit(
	bucket: string,
	key: string,
	limit: number,
	windowMs: number
): { allowed: boolean; retryAfter: number } {
	const now = Date.now();
	sweep(now);
	const mapKey = `${bucket}:${key}`;
	const win = windows.get(mapKey);

	if (!win || win.resetAt <= now) {
		windows.set(mapKey, { count: 1, resetAt: now + windowMs });
		return { allowed: true, retryAfter: 0 };
	}

	if (win.count >= limit) {
		return { allowed: false, retryAfter: Math.ceil((win.resetAt - now) / 1000) };
	}

	win.count += 1;
	return { allowed: true, retryAfter: 0 };
}
