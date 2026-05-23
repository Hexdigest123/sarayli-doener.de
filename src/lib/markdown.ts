import { marked } from 'marked';

// Shared Markdown configuration used on both the server (authoritative render) and in the
// admin editor's live preview, so the admin sees the same structure visitors will get.
// `breaks: true` turns a single newline into a <br>, matching how non-technical authors
// expect the Enter key to behave when typing short popup copy.
marked.setOptions({ gfm: true, breaks: true });

/**
 * Convert Markdown to an HTML string.
 *
 * NOTE: the output is NOT sanitised. It is safe to use only for the admin's own live
 * preview (the admin is a trusted, authenticated author) or as the input to the
 * server-side sanitiser in `$lib/server/markdown`. Never render this directly to the
 * public site without sanitising first.
 */
export function markdownToHtml(markdown: string | null | undefined): string {
	const src = (markdown ?? '').trim();
	if (!src) return '';
	return marked.parse(src) as string;
}
