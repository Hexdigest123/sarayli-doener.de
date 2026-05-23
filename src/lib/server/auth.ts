import { compare } from 'bcryptjs';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { eq, lt } from 'drizzle-orm';
import crypto from 'node:crypto';
import { db } from '$lib/server/db';
import { adminSessions } from '$lib/server/db/schema';

const SESSION_MAX_AGE = 60 * 60 * 24; // seconds

function hashToken(token: string): string {
	return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSession(): Promise<string> {
	const token = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
	await db.insert(adminSessions).values({ tokenHash: hashToken(token), expiresAt });
	return token;
}

export async function validateSession(token: string | undefined): Promise<boolean> {
	if (!token) return false;
	const tokenHash = hashToken(token);
	const [session] = await db
		.select({ expiresAt: adminSessions.expiresAt })
		.from(adminSessions)
		.where(eq(adminSessions.tokenHash, tokenHash));
	if (!session) return false;
	if (Date.now() > session.expiresAt.getTime()) {
		await db.delete(adminSessions).where(eq(adminSessions.tokenHash, tokenHash));
		return false;
	}
	return true;
}

export async function deleteSession(token: string): Promise<void> {
	await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)));
}

// Best-effort cleanup of expired rows; safe to call opportunistically.
export async function purgeExpiredSessions(): Promise<void> {
	await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
}

export async function verifyPassword(password: string): Promise<boolean> {
	const hash = env.ADMIN_PASSWORD_HASH;
	if (!hash) return false;
	return compare(password, hash);
}

/**
 * Defense-in-depth guard for admin form actions. The primary gate is the hook in
 * hooks.server.ts (which blocks unauthenticated requests before actions run), but
 * each mutating action also calls this so a future hook regression cannot silently
 * expose it. Throws 403 when the request is not from an authenticated admin.
 */
export function requireAdmin(locals: App.Locals): void {
	if (!locals.adminAuthenticated) {
		throw error(403, 'Forbidden');
	}
}

export const SESSION_COOKIE_NAME = 'admin_session';
export { SESSION_MAX_AGE };
