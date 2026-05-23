import { sequence } from '@sveltejs/kit/hooks';
import { error, redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { handleTracking } from '$lib/server/tracking';
import { validateSession, SESSION_COOKIE_NAME } from '$lib/server/auth';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

// Public admin routes that an unauthenticated client must be able to reach.
// `/admin/logout` is included so an expired session can still clear its cookie.
const PUBLIC_ADMIN_ROUTES = new Set(['/admin/login', '/admin/logout']);

const handleAuth: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/admin')) {
		const token = event.cookies.get(SESSION_COOKIE_NAME);
		const authenticated = await validateSession(token);
		event.locals.adminAuthenticated = authenticated;

		// Enforce auth here, in the hook, so it applies to form actions too. The
		// admin layout's load() guard does NOT run before a POST action, so relying
		// on it alone would leave every admin mutation reachable unauthenticated.
		if (!authenticated && !PUBLIC_ADMIN_ROUTES.has(event.url.pathname)) {
			if (event.request.method === 'GET' || event.request.method === 'HEAD') {
				throw redirect(302, '/admin/login');
			}
			throw error(403, 'Forbidden');
		}
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth, handleTracking);

export const handleError: HandleServerError = ({ error, status }) => {
	if (status !== 404) {
		console.error('Server error:', error);
	}
	return {
		message: status === 404 ? 'Not Found' : 'Internal Error'
	};
};
