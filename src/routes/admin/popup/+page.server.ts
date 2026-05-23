import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/auth';
import {
	listPopups,
	upsertPopup,
	publishPopup,
	takeDownPopup,
	deletePopup,
	validatePopupInput
} from '$lib/server/popup';

export const load: PageServerLoad = async () => {
	const rows = await listPopups();
	return {
		popups: rows.map((p) => ({
			id: p.id,
			active: p.active === 1,
			title: p.title,
			body: p.body,
			imageUrl: p.imageUrl,
			badge: p.badge,
			ctaLabel: p.ctaLabel,
			ctaUrl: p.ctaUrl,
			updatedAt: p.updatedAt.toISOString()
		}))
	};
};

function readInput(data: FormData) {
	return {
		title: data.get('title'),
		body: data.get('body'),
		imageUrl: data.get('imageUrl'),
		badge: data.get('badge'),
		ctaLabel: data.get('ctaLabel'),
		ctaUrl: data.get('ctaUrl')
	};
}

function readId(data: FormData): number | null {
	const raw = data.get('id');
	if (typeof raw !== 'string' || raw.trim() === '') return null;
	const n = Number(raw);
	return Number.isInteger(n) && n > 0 ? n : null;
}

export const actions: Actions = {
	// Editor: create a new draft or update an existing popup's content (active flag
	// untouched — a draft stays a draft, the live popup stays live with a fresh version).
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const result = validatePopupInput(readInput(data));
		if (!result.ok) return fail(400, { error: result.error });
		const id = await upsertPopup(readId(data), result.value);
		return { success: true, savedId: id, action: 'saved' as const };
	},
	// Editor: save the current content and make this popup the single live one.
	publish: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const result = validatePopupInput(readInput(data));
		if (!result.ok) return fail(400, { error: result.error });
		const id = await upsertPopup(readId(data), result.value);
		await publishPopup(id);
		return { success: true, savedId: id, action: 'published' as const };
	},
	// List: make an already-saved popup the live one without re-editing it.
	activate: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const id = readId(data);
		if (id == null) return fail(400, { error: 'Missing popup id.' });
		await publishPopup(id);
		return { success: true, action: 'published' as const };
	},
	// Take the live popup down (kept as a draft).
	takeDown: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const id = readId(data);
		if (id == null) return fail(400, { error: 'Missing popup id.' });
		await takeDownPopup(id);
		return { success: true, action: 'takenDown' as const };
	},
	// Permanently delete a saved popup.
	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const id = readId(data);
		if (id == null) return fail(400, { error: 'Missing popup id.' });
		await deletePopup(id);
		return { success: true, action: 'deleted' as const };
	}
};
