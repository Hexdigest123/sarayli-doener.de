import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (url.pathname === '/admin/login') {
		return {};
	}

	if (!locals.adminAuthenticated) {
		throw redirect(302, '/admin/login');
	}

	return {};
};
