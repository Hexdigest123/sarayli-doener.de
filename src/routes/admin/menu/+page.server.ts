import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import {
	ensureMenuSeeded,
	getAdminMenu,
	createCategory,
	updateCategory,
	deleteCategory,
	createItem,
	updateItem,
	deleteItem,
	setItemAvailability,
	moveItem,
	moveCategory,
	type CategoryInput,
	type ItemInput
} from '$lib/server/menu';

export const load: PageServerLoad = async () => {
	await ensureMenuSeeded();
	return { categories: await getAdminMenu() };
};

function str(value: FormDataEntryValue | null): string {
	return value == null ? '' : String(value).trim();
}

function nullable(value: FormDataEntryValue | null): string | null {
	const s = str(value);
	return s ? s : null;
}

function parseId(value: FormDataEntryValue | null): number | null {
	const n = Number.parseInt(str(value), 10);
	return Number.isInteger(n) && n > 0 ? n : null;
}

function parsePriceCents(value: FormDataEntryValue | null): number | null {
	const raw = str(value).replace(',', '.');
	if (!raw) return null;
	const n = Number(raw);
	if (!Number.isFinite(n) || n < 0) return null;
	return Math.round(n * 100);
}

function readCategoryInput(data: FormData): CategoryInput | null {
	const nameDe = str(data.get('nameDe'));
	if (!nameDe) return null;
	return { nameDe, nameEn: nullable(data.get('nameEn')), nameTr: nullable(data.get('nameTr')) };
}

function readItemInput(data: FormData): ItemInput | null {
	const categoryId = parseId(data.get('categoryId'));
	const nameDe = str(data.get('nameDe'));
	const priceCents = parsePriceCents(data.get('price'));
	if (!categoryId || !nameDe || priceCents === null) return null;
	return {
		categoryId,
		nameDe,
		nameEn: nullable(data.get('nameEn')),
		nameTr: nullable(data.get('nameTr')),
		descDe: nullable(data.get('descDe')),
		descEn: nullable(data.get('descEn')),
		descTr: nullable(data.get('descTr')),
		sizeDe: nullable(data.get('sizeDe')),
		sizeEn: nullable(data.get('sizeEn')),
		sizeTr: nullable(data.get('sizeTr')),
		priceCents,
		supportsExtras: str(data.get('supportsExtras')) !== '',
		isAvailable: str(data.get('isAvailable')) !== ''
	};
}

export const actions: Actions = {
	saveCategory: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const input = readCategoryInput(data);
		if (!input) return fail(400, { error: 'A German category name is required.' });

		const id = parseId(data.get('id'));
		if (id) {
			await updateCategory(id, input);
		} else {
			await createCategory(input);
		}
		return { success: true };
	},

	deleteCategory: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const id = parseId(data.get('id'));
		if (!id) return fail(400, { error: 'Invalid category.' });
		const result = await deleteCategory(id);
		if (!result.ok) {
			return fail(400, { error: 'Move or delete the meals in this category first.' });
		}
		return { success: true };
	},

	moveCategory: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const id = parseId(data.get('id'));
		const dir = str(data.get('dir'));
		if (id && (dir === 'up' || dir === 'down')) await moveCategory(id, dir);
		return { success: true };
	},

	saveItem: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const input = readItemInput(data);
		if (!input) {
			return fail(400, { error: 'A category, German name and valid price are required.' });
		}
		const id = parseId(data.get('id'));
		if (id) {
			await updateItem(id, input);
		} else {
			await createItem(input);
		}
		return { success: true };
	},

	deleteItem: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const id = parseId(data.get('id'));
		if (!id) return fail(400, { error: 'Invalid meal.' });
		await deleteItem(id);
		return { success: true };
	},

	toggleItem: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const id = parseId(data.get('id'));
		if (!id) return fail(400, { error: 'Invalid meal.' });
		await setItemAvailability(id, str(data.get('available')) === '1');
		return { success: true };
	},

	moveItem: async ({ request, locals }) => {
		requireAdmin(locals);
		const data = await request.formData();
		const id = parseId(data.get('id'));
		const dir = str(data.get('dir'));
		if (id && (dir === 'up' || dir === 'down')) await moveItem(id, dir);
		return { success: true };
	}
};
