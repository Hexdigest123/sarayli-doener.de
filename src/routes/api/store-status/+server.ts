import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStoreSettings } from '$lib/server/store-status';

export const GET: RequestHandler = async () => {
	const settings = await getStoreSettings();
	return json({
		open: settings.isOpen,
		closedMessage: settings.closedMessage,
		mode: settings.mode,
		schedule: settings.schedule,
		shopEnabled: settings.shopEnabled
	});
};
