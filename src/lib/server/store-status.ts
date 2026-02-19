import { db } from '$lib/server/db';
import { storeSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const SETTINGS_ROW_ID = 1;

export async function isStoreOpen(): Promise<boolean> {
	const [row] = await db.select().from(storeSettings).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	if (!row) return true;
	return row.isOpen === 1;
}

export async function getStoreSettings() {
	const [row] = await db.select().from(storeSettings).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	if (!row) return { isOpen: true, closedMessage: null };
	return { isOpen: row.isOpen === 1, closedMessage: row.closedMessage };
}

export async function setStoreOpen(open: boolean, closedMessage?: string | null) {
	const [existing] = await db.select().from(storeSettings).where(eq(storeSettings.id, SETTINGS_ROW_ID));

	if (existing) {
		await db
			.update(storeSettings)
			.set({
				isOpen: open ? 1 : 0,
				closedMessage: open ? null : (closedMessage ?? existing.closedMessage),
				updatedAt: new Date()
			})
			.where(eq(storeSettings.id, SETTINGS_ROW_ID));
	} else {
		await db.insert(storeSettings).values({
			id: SETTINGS_ROW_ID,
			isOpen: open ? 1 : 0,
			closedMessage: open ? null : (closedMessage ?? null),
			updatedAt: new Date()
		});
	}
}
