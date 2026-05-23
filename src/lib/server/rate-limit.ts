// In-memory brute-force throttle for the admin login. Keyed by client IP: after
// MAX_ATTEMPTS failures inside WINDOW_MS, the key is locked for LOCKOUT_MS.
//
// Note: state is process-local, matching a single-instance deployment. For a
// multi-instance/replica setup, back this with a shared store (Redis/Postgres)
// so the limit is enforced globally.

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
