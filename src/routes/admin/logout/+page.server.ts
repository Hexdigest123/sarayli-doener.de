import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { deleteSession, SESSION_COOKIE_NAME } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const token = cookies.get(SESSION_COOKIE_NAME);
		if (token) {
			deleteSession(token);
		}
		cookies.delete(SESSION_COOKIE_NAME, { path: '/admin' });
		throw redirect(303, '/admin/login');
	}
};
