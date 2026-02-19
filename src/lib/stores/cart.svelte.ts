import { browser } from '$app/environment';

export interface CartItem {
	menuItemId: number;
	nameKey: string;
	price: number;
	quantity: number;
	sizeKey?: string;
}

const STORAGE_KEY = 'sarayli_cart';

function loadCart(): CartItem[] {
	if (!browser) {
		return [];
	}

	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		return saved ? (JSON.parse(saved) as CartItem[]) : [];
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
		const existing = items.find((current) => current.menuItemId === item.menuItemId);

		if (existing) {
			items = items.map((current) =>
				current.menuItemId === item.menuItemId
					? { ...current, quantity: current.quantity + 1 }
					: current
			);
		} else {
			items = [...items, { ...item, quantity: 1 }];
		}

		saveCart(items);
	},

	removeItem(menuItemId: number) {
		items = items.filter((item) => item.menuItemId !== menuItemId);
		saveCart(items);
	},

	updateQuantity(menuItemId: number, quantity: number) {
		if (quantity <= 0) {
			items = items.filter((item) => item.menuItemId !== menuItemId);
		} else {
			items = items.map((item) =>
				item.menuItemId === menuItemId ? { ...item, quantity } : item
			);
		}

		saveCart(items);
	},

	clear() {
		items = [];
		saveCart(items);
	}
};
