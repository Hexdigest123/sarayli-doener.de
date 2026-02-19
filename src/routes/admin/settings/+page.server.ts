import type { Actions, PageServerLoad } from './$types';
import { getStoreSettings, setStoreOpen } from '$lib/server/store-status';

export const load: PageServerLoad = async () => {
	const settings = await getStoreSettings();
	return { storeOpen: settings.isOpen, closedMessage: settings.closedMessage };
};

export const actions: Actions = {
	toggle: async ({ request }) => {
		const data = await request.formData();
		const open = data.get('open') === '1';
		const closedMessage = String(data.get('closedMessage') || '') || null;
		await setStoreOpen(open, closedMessage);
		return { success: true };
	}
};
