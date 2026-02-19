import { db } from '$lib/server/db';
import { storeSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

const REQUIRED_STRIPE_KEYS = [
	'STRIPE_SECRET_KEY',
	'STRIPE_PUBLISHABLE_KEY',
	'STRIPE_WEBHOOK_SECRET'
] as const;

export function getStripeConfigStatus(): { configured: boolean; missingKeys: string[] } {
	const missing = REQUIRED_STRIPE_KEYS.filter((key) => !env[key]);
	return { configured: missing.length === 0, missingKeys: missing };
}

const SETTINGS_ROW_ID = 1;
const OPEN_HOUR = 11;
const CLOSE_HOUR = 22;
const TIMEZONE = 'Europe/Berlin';

function isWithinSchedule(): boolean {
	const now = new Date();
	const berlinTime = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
	const hour = berlinTime.getHours();
	return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

async function getRow() {
	const [row] = await db.select().from(storeSettings).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	return row ?? null;
}

export async function isStoreOpen(): Promise<boolean> {
	const row = await getRow();
	if (!row) return isWithinSchedule();
	if (row.mode === 'manual') return row.isOpen === 1;
	return isWithinSchedule();
}

export async function isShopEnabled(): Promise<boolean> {
	const { configured } = getStripeConfigStatus();
	if (!configured) return false;
	const row = await getRow();
	return row?.shopEnabled !== 0;
}

export async function getStoreSettings() {
	const row = await getRow();
	const mode = row?.mode ?? 'auto';
	const open = mode === 'manual' ? row?.isOpen === 1 : isWithinSchedule();
	const stripe = getStripeConfigStatus();

	return {
		isOpen: open,
		mode,
		closedMessage: row?.closedMessage ?? null,
		shopEnabled: stripe.configured && row?.shopEnabled !== 0,
		shopEnabledByAdmin: row?.shopEnabled !== 0,
		stripeConfigured: stripe.configured,
		stripeMissingKeys: stripe.missingKeys,
		schedule: { openHour: OPEN_HOUR, closeHour: CLOSE_HOUR }
	};
}

export async function setStoreMode(
	mode: 'auto' | 'manual',
	open?: boolean,
	closedMessage?: string | null
) {
	const existing = await getRow();

	const values = {
		mode,
		isOpen: mode === 'manual' ? (open ? 1 : 0) : (existing?.isOpen ?? 1),
		closedMessage:
			mode === 'manual' && !open ? (closedMessage ?? existing?.closedMessage ?? null) : null,
		updatedAt: new Date()
	};

	if (existing) {
		await db.update(storeSettings).set(values).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	} else {
		await db.insert(storeSettings).values({ id: SETTINGS_ROW_ID, ...values });
	}
}

export async function setShopEnabled(enabled: boolean) {
	const existing = await getRow();

	const values = {
		shopEnabled: enabled ? 1 : 0,
		updatedAt: new Date()
	};

	if (existing) {
		await db.update(storeSettings).set(values).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	} else {
		await db.insert(storeSettings).values({ id: SETTINGS_ROW_ID, ...values });
	}
}
