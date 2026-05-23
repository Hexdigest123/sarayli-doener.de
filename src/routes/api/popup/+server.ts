import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getActivePopup } from '$lib/server/popup';

export const GET: RequestHandler = async () => {
	const popup = await getActivePopup();
	// Must not be cached: the admin can publish or remove the popup at any time and
	// the change should reach visitors on their next page load.
	return json({ popup }, { headers: { 'cache-control': 'no-store' } });
};
