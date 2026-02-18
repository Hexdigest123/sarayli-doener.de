import { compare } from 'bcryptjs';
import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';

const sessions = new Map<string, { expiresAt: number }>();

const SESSION_MAX_AGE = 60 * 60 * 24;

export function createSession(): string {
	const token = crypto.randomUUID();
	sessions.set(token, { expiresAt: Date.now() + SESSION_MAX_AGE * 1000 });
	return token;
}

export function validateSession(token: string | undefined): boolean {
	if (!token) return false;
	const session = sessions.get(token);
	if (!session) return false;
	if (Date.now() > session.expiresAt) {
		sessions.delete(token);
		return false;
	}
	return true;
}

export function deleteSession(token: string): void {
	sessions.delete(token);
}

export async function verifyPassword(password: string): Promise<boolean> {
	const hash = env.ADMIN_PASSWORD_HASH;
	if (!hash) return false;
	return compare(password, hash);
}

export const SESSION_COOKIE_NAME = 'admin_session';
export { SESSION_MAX_AGE };
