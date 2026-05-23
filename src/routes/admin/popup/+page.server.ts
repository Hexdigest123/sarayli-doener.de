import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/auth';
import { getPopup, savePopup, saveDraft, removePopup, validatePopupInput } from '$lib/server/popup';

export const load: PageServerLoad = async () => {
	const popup = await getPopup();
	return {
		popup: popup
			? {
					active: popup.active === 1,
					title: popup.title,
					body: popup.body,
					imageUrl: popup.imageUrl,
					badge: popup.badge,
					ctaLabel: popup.ctaLabel,
					ctaUrl: popup.ctaUrl,
					updatedAt: popup.updatedAt.toISOString()
				}
			: null
	};
};

async function readInput(request: Request) {
	const data = await request.formData();
	return {
		title: data.get('title'),
		body: data.get('body'),
		imageUrl: data.get('imageUrl'),
		badge: data.get('badge'),
		ctaLabel: data.get('ctaLabel'),
		ctaUrl: data.get('ctaUrl')
	};
}

export const actions: Actions = {
	publish: async ({ request, locals }) => {
		requireAdmin(locals);
		const result = validatePopupInput(await readInput(request));
		if (!result.ok) return fail(400, { error: result.error });
		await savePopup(result.value);
		return { success: true, published: true };
	},
	saveDraft: async ({ request, locals }) => {
		requireAdmin(locals);
		const result = validatePopupInput(await readInput(request));
		if (!result.ok) return fail(400, { error: result.error });
		await saveDraft(result.value);
		return { success: true, published: false };
	},
	remove: async ({ locals }) => {
		requireAdmin(locals);
		await removePopup();
		return { success: true, removed: true };
	}
};
