import { browser } from '$app/environment';
import type { LocalizedText } from '$lib/menu-types';

export interface CartItem {
	menuItemId: number;
	/** Localized meal name snapshot, resolved per locale at render time. */
	name: LocalizedText;
	price: number;
	quantity: number;
	size?: LocalizedText | null;
	extras?: string[];
}

const STORAGE_KEY = 'sarayli_cart';

function isValidItem(item: unknown): item is CartItem {
	return (
		typeof item === 'object' &&
		item !== null &&
		typeof (item as CartItem).menuItemId === 'number' &&
		typeof (item as CartItem).name === 'object' &&
		(item as CartItem).name !== null &&
		typeof (item as CartItem).price === 'number'
	);
}

function loadCart(): CartItem[] {
	if (!browser) {
		return [];
	}

	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) return [];
		const parsed = JSON.parse(saved);
		// Drop legacy carts saved before the menu moved to the DB (they used `nameKey`
		// translation keys instead of localized text snapshots).
		return Array.isArray(parsed) ? parsed.filter(isValidItem) : [];
	} catch {
		return [];
	}
}

function saveCart(items: CartItem[]): void {
	if (!browser) {
		return;
	}

	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function extrasMatch(a?: string[], b?: string[]): boolean {
	const sa = [...(a ?? [])].sort();
	const sb = [...(b ?? [])].sort();
	if (sa.length !== sb.length) return false;
	return sa.every((v, i) => v === sb[i]);
}

let items = $state<CartItem[]>(loadCart());

export const cart = {
	get items() {
		return items;
	},
	get totalItems() {
		return items.reduce((sum, item) => sum + item.quantity, 0);
	},
	get totalPrice() {
		return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	},
	get isEmpty() {
		return items.length === 0;
	},

	addItem(item: Omit<CartItem, 'quantity'>) {
		const existingIndex = items.findIndex(
			(current) =>
				current.menuItemId === item.menuItemId && extrasMatch(current.extras, item.extras)
		);

		if (existingIndex >= 0) {
			items = items.map((current, i) =>
				i === existingIndex ? { ...current, quantity: current.quantity + 1 } : current
			);
		} else {
			items = [...items, { ...item, quantity: 1 }];
		}

		saveCart(items);
	},

	removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
		saveCart(items);
	},

	updateQuantity(index: number, quantity: number) {
		if (quantity <= 0) {
			items = items.filter((_, i) => i !== index);
		} else {
			items = items.map((item, i) => (i === index ? { ...item, quantity } : item));
		}

		saveCart(items);
	},

	clear() {
		items = [];
		saveCart(items);
	}
};
