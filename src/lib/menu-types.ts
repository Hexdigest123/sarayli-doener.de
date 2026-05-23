// Shared, client-safe menu types and locale helper. Imported by both the public
// components and the server menu module. Keep this free of server-only imports.

export interface LocalizedText {
	de: string;
	en?: string | null;
	tr?: string | null;
}

export interface PublicMenuItem {
	id: number;
	name: LocalizedText;
	desc?: LocalizedText | null;
	size?: LocalizedText | null;
	/** Price in euros (e.g. 8.5), already converted from the stored cents. */
	price: number;
	supportsExtras: boolean;
}

export interface PublicMenuCategory {
	id: number;
	name: LocalizedText;
	items: PublicMenuItem[];
}

/**
 * Resolve a localized string for the active locale, falling back to German
 * (the base locale) whenever the requested translation is missing or empty.
 */
export function pickText(locale: string, text: LocalizedText | null | undefined): string {
	if (!text) return '';
	if (locale === 'en' && text.en) return text.en;
	if (locale === 'tr' && text.tr) return text.tr;
	return text.de;
}
