import { sequence } from '@sveltejs/kit/hooks';
import { error, redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { handleTracking } from '$lib/server/tracking';
import { validateSession, SESSION_COOKIE_NAME } from '$lib/server/auth';

// Content-Security-Policy. The site loads no third-party scripts (Stripe uses a
// hosted-checkout redirect, not Stripe.js) and no iframes, so script/connect/frame
// stay locked to 'self'. Google Fonts is the only external origin (its stylesheet
// and font files). 'unsafe-inline' is required for script-src because SvelteKit
// emits an inline hydration bootstrap and the app injects inline JSON-LD via
// {@html}; the strong protections here are frame-ancestors (clickjacking),
// object-src 'none', and base-uri/form-action 'self'. Tightening script-src to a
// nonce would require plumbing the nonce into the JSON-LD {@html} blocks.
const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' data: https:",
	"connect-src 'self'",
	"frame-src 'none'",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"object-src 'none'"
].join('; ');

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	const headers = response.headers;
	headers.set('X-Content-Type-Options', 'nosniff');
	headers.set('X-Frame-Options', 'DENY');
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	if (!dev) {
		// HSTS and CSP only in production: dev runs over http and Vite's HMR uses a
		// websocket that a strict connect-src would block.
		headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
		headers.set('Content-Security-Policy', CSP);
	}
	return response;
};

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

export const handle: Handle = sequence(
	handleSecurityHeaders,
	handleParaglide,
	handleAuth,
	handleTracking
);

export const handleError: HandleServerError = ({ error, status }) => {
	if (status !== 404) {
		console.error('Server error:', error);
	}
	return {
		message: status === 404 ? 'Not Found' : 'Internal Error'
	};
};
