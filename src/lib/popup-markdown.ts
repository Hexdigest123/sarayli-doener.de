import sanitizeHtml from 'sanitize-html';
import { markdownToHtml } from '$lib/markdown';

// Allowlist for the HTML that admin-authored Markdown is allowed to produce. Everything
// outside this set is stripped, so even though the popup body is rendered with `@html`,
// only this safe subset can ever reach a browser. This module is intentionally NOT under
// `$lib/server` so the admin editor can run the exact same sanitiser on its live preview
// (parity with what visitors see, and defence-in-depth against self-XSS).
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: [
		'p',
		'br',
		'hr',
		'strong',
		'b',
		'em',
		'i',
		'u',
		's',
		'del',
		'code',
		'pre',
		'blockquote',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'ul',
		'ol',
		'li',
		'a',
		'img',
		'table',
		'thead',
		'tbody',
		'tfoot',
		'tr',
		'th',
		'td'
	],
	allowedAttributes: {
		// `rel` must be allowed for the defang transform below to survive attribute filtering.
		a: ['href', 'title', 'rel'],
		img: ['src', 'alt', 'title']
	},
	// Block javascript:/data: link schemes; images may only load over http(s).
	allowedSchemes: ['http', 'https', 'mailto', 'tel'],
	allowedSchemesByTag: { img: ['http', 'https'] },
	// Defang outbound links regardless of how the author wrote them.
	transformTags: {
		a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' })
	}
};

/**
 * Render admin Markdown into a safe HTML fragment for `@html` rendering. Returns null when
 * the body is empty (so callers can skip the block). Used by the public site (authoritative
 * server render) and by the admin editor's live preview.
 */
export function renderPopupBody(markdown: string | null | undefined): string | null {
	const raw = markdownToHtml(markdown);
	if (!raw) return null;
	const clean = sanitizeHtml(raw, SANITIZE_OPTIONS).trim();
	return clean.length > 0 ? clean : null;
}
