import type { Actions, PageServerLoad } from './$types';
import { getStoreSettings, setStoreMode, setShopEnabled } from '$lib/server/store-status';
import { requireAdmin } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	const settings = await getStoreSettings();
	return {
		storeOpen: settings.isOpen,
		mode: settings.mode,
		closedMessage: settings.closedMessage,
		shopEnabled: settings.shopEnabled,
		shopEnabledByAdmin: settings.shopEnabledByAdmin,
		stripeConfigured: settings.stripeConfigured,
		stripeMissingKeys: settings.stripeMissingKeys,
		schedule: settings.schedule
	};
};

export const actions: Actions = {
	setAuto: async ({ locals }) => {
		requireAdmin(locals);
		await setStoreMode('auto');
		return { success: true };
	},
	manualOpen: async ({ locals }) => {
		requireAdmin(locals);
		await setStoreMode('manual', true);
		return { success: true };
	},
	manualClose: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const closedMessage = String(data.get('closedMessage') || '') || null;
		await setStoreMode('manual', false, closedMessage);
		return { success: true };
	},
	enableShop: async ({ locals }) => {
		requireAdmin(locals);
		await setShopEnabled(true);
		return { success: true };
	},
	disableShop: async ({ locals }) => {
		requireAdmin(locals);
		await setShopEnabled(false);
		return { success: true };
	}
};
