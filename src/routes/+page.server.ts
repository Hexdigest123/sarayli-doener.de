import type { PageServerLoad } from './$types';
import { ensureMenuSeeded, getPublicMenu } from '$lib/server/menu';

export const load: PageServerLoad = async () => {
	// Seed the menu from config.ts on first launch, then serve it from the DB.
	await ensureMenuSeeded();
	return { menu: await getPublicMenu() };
};
