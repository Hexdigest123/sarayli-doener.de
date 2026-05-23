import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import {
	createSession,
	verifyPassword,
	SESSION_COOKIE_NAME,
	SESSION_MAX_AGE
} from '$lib/server/auth';
import { checkLoginRateLimit, recordLoginFailure, resetLoginRateLimit } from '$lib/server/rate-limit';

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const ip = getClientAddress();

		const retryAfter = checkLoginRateLimit(ip);
		if (retryAfter > 0) {
			const minutes = Math.ceil(retryAfter / 60);
			return fail(429, {
				error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
			});
		}

		const data = await request.formData();
		const password = data.get('password');

		if (!password || typeof password !== 'string') {
			return fail(400, { error: 'Password is required' });
		}

		const valid = await verifyPassword(password);
		if (!valid) {
			recordLoginFailure(ip);
			return fail(401, { error: 'Invalid password' });
		}

		resetLoginRateLimit(ip);

		const token = await createSession();
		cookies.set(SESSION_COOKIE_NAME, token, {
			path: '/admin',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: SESSION_MAX_AGE
		});

		throw redirect(303, '/admin');
	}
};
