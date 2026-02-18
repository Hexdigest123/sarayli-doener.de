import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import {
	createSession,
	verifyPassword,
	SESSION_COOKIE_NAME,
	SESSION_MAX_AGE
} from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (!password || typeof password !== 'string') {
			return fail(400, { error: 'Password is required' });
		}

		const valid = await verifyPassword(password);
		if (!valid) {
			return fail(401, { error: 'Invalid password' });
		}

		const token = createSession();
		cookies.set(SESSION_COOKIE_NAME, token, {
			path: '/admin',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: SESSION_MAX_AGE
		});

		throw redirect(303, '/admin');
	}
};
