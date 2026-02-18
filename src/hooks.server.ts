import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
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

const handleAuth: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/admin')) {
		const token = event.cookies.get(SESSION_COOKIE_NAME);
		event.locals.adminAuthenticated = validateSession(token);
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth, handleTracking);
