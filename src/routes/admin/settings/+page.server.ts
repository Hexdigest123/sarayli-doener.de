import type { Actions, PageServerLoad } from './$types';
import { getStoreSettings, setStoreMode } from '$lib/server/store-status';

export const load: PageServerLoad = async () => {
	const settings = await getStoreSettings();
	return {
		storeOpen: settings.isOpen,
		mode: settings.mode,
		closedMessage: settings.closedMessage,
		schedule: settings.schedule
	};
};

export const actions: Actions = {
	setAuto: async () => {
		await setStoreMode('auto');
		return { success: true };
	},
	manualOpen: async () => {
		await setStoreMode('manual', true);
		return { success: true };
	},
	manualClose: async ({ request }) => {
		const data = await request.formData();
		const closedMessage = String(data.get('closedMessage') || '') || null;
		await setStoreMode('manual', false, closedMessage);
		return { success: true };
	}
};
