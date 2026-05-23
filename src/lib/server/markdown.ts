// The popup Markdown renderer/sanitiser lives in a non-server module so the admin
// editor's live preview can reuse it. Re-exported here so existing server imports
// (`$lib/server/markdown`) keep working unchanged.
export { renderPopupBody } from '$lib/popup-markdown';
