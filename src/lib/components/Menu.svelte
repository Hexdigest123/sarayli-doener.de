<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { menuCategories, doenerExtras, DOENER_ITEM_IDS, type MenuItem } from '$lib/config';
	import { cart } from '$lib/stores/cart.svelte';

	let activeCategory = $state('doener');

	// Build a lookup of all message functions for dynamic key access
	const msg: Record<string, () => string> = {};
	for (const [key, fn] of Object.entries(m)) {
		if (typeof fn === 'function') {
			msg[key] = fn as () => string;
		}
	}

	const getCategoryName = (id: string) => {
		const map: Record<string, () => string> = {
			menues: m.cat_menues,
			doener: m.cat_doener,
			teig: m.cat_teig,
			imbiss: m.cat_imbiss,
			suppen: m.cat_suppen,
			salat: m.cat_salat,
			extras: m.cat_extras,
			getraenke: m.cat_getraenke
		};
		return map[id]?.() ?? id;
	};

	let activeItems = $derived(menuCategories.find((c) => c.id === activeCategory)?.items ?? []);
	let justAdded = $state<Record<number, boolean>>({});

	// Extras picker state
	let extrasModalItem = $state<MenuItem | null>(null);
	let selectedExtras = $state<Set<string>>(new Set());

	function handleAddClick(item: MenuItem) {
		if (DOENER_ITEM_IDS.has(item.id)) {
			extrasModalItem = item;
			selectedExtras = new Set();
		} else {
			addToCart(item);
		}
	}

	function toggleExtra(id: string) {
		const next = new Set(selectedExtras);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedExtras = next;
	}

	function confirmExtras() {
		if (!extrasModalItem) return;
		cart.addItem({
			menuItemId: extrasModalItem.id,
			nameKey: extrasModalItem.nameKey,
			price: extrasModalItem.price,
			sizeKey: extrasModalItem.sizeKey,
			extras: [...selectedExtras]
		});

		justAdded = { ...justAdded, [extrasModalItem.id]: true };
		const itemId = extrasModalItem.id;
		setTimeout(() => {
			const nextState = { ...justAdded };
			delete nextState[itemId];
			justAdded = nextState;
		}, 500);

		extrasModalItem = null;
		selectedExtras = new Set();
	}

	function closeExtrasModal() {
		extrasModalItem = null;
		selectedExtras = new Set();
	}

	function addToCart(item: MenuItem) {
		cart.addItem({
			menuItemId: item.id,
			nameKey: item.nameKey,
			price: item.price,
			sizeKey: item.sizeKey
		});

		justAdded = { ...justAdded, [item.id]: true };
		setTimeout(() => {
			const nextState = { ...justAdded };
			delete nextState[item.id];
			justAdded = nextState;
		}, 500);
	}
</script>

<section id="menu" class="bg-white py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="text-center">
			<h2 class="font-display text-3xl font-bold text-crimson md:text-4xl">
				{m.menu_title()}
			</h2>
			<div class="mx-auto mt-4 mb-8 h-1 w-24 rounded-full bg-gold"></div>
		</div>

		<div class="scroll-fade-right relative md:contents">
			<div
				class="scrollbar-hide flex gap-2 overflow-x-auto pb-2 md:justify-center"
				style="-webkit-overflow-scrolling: touch;"
			>
				{#each menuCategories as category}
					<button
						class="rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all {activeCategory ===
						category.id
							? 'bg-crimson text-white'
							: 'border border-gray-200 bg-white text-gray-700 hover:bg-cream-dark'}"
						onclick={() => (activeCategory = category.id)}
					>
						{getCategoryName(category.id)}
					</button>
				{/each}
			</div>
		</div>

		<div class="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
			{#each activeItems as item}
				<div
					class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="flex min-w-0 items-start justify-between">
						<div>
							<span class="mr-2 font-bold text-gold">{String(item.id).padStart(2, '0')}</span>
							<span class="font-medium text-gray-900">{msg[item.nameKey]?.() ?? item.nameKey}</span>
						</div>
						<div class="flex items-center gap-2 pl-3">
							<span class="font-bold whitespace-nowrap text-crimson">
								{item.price.toFixed(2).replace('.', ',')} €
							</span>
						<button
							onclick={() => handleAddClick(item)}
							class={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white transition-colors ${justAdded[item.id] ? 'bg-gold' : 'bg-crimson hover:bg-crimson-dark active:bg-gold'}`}
							title={m.cart_add()}
							aria-label={m.cart_add()}
						>
							+
						</button>
						</div>
					</div>
					{#if item.descKey || item.sizeKey}
						<p class="mt-1 pl-8 text-sm text-gray-500">
							{item.descKey ? (msg[item.descKey]?.() ?? '') : ''}{item.sizeKey
								? ` · ${msg[item.sizeKey]?.() ?? ''}`
								: ''}
						</p>
					{/if}
				</div>
			{/each}
		</div>

		{#if extrasModalItem}
			<div
				class="fixed inset-0 z-[80] flex items-center justify-center"
				role="dialog"
				aria-modal="true"
				aria-label={msg.extras_title?.() ?? 'Extras auswählen'}
			>
				<button
					class="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
					onclick={closeExtrasModal}
					aria-label={msg.cart_close?.() ?? 'Close'}
				></button>
				<div class="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
					<h3 class="mb-1 font-display text-xl font-bold text-crimson">
						{msg.extras_title?.() ?? 'Extras auswählen'}
					</h3>
					<p class="mb-4 font-body text-sm text-gray-600">
						{msg[extrasModalItem.nameKey]?.() ?? extrasModalItem.nameKey}
					</p>

					<div class="mb-5 grid grid-cols-2 gap-2">
						{#each doenerExtras as extra}
							<button
								type="button"
								onclick={() => toggleExtra(extra.id)}
								class={`rounded-lg border px-3 py-2 text-left font-body text-sm transition-colors ${selectedExtras.has(extra.id) ? 'border-crimson bg-crimson/10 font-semibold text-crimson' : 'border-gray-200 text-gray-700 hover:border-crimson/40'}`}
							>
								{extra.label}
							</button>
						{/each}
					</div>

					<div class="flex gap-2">
						<button
							onclick={() => { selectedExtras = new Set(); confirmExtras(); }}
							class="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 font-body text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
						>
							{msg.extras_skip?.() ?? 'Ohne Extras'}
						</button>
						<button
							onclick={confirmExtras}
							class="flex-1 rounded-lg bg-crimson px-3 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
						>
							{msg.extras_confirm?.() ?? 'In den Warenkorb'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<div class="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
			<img
				src="/images/menu-1.webp"
				alt="Speisekarte Seite 1"
				class="w-full rounded-xl shadow-md"
				loading="lazy"
			/>
			<img
				src="/images/menu-2.webp"
				alt="Speisekarte Seite 2"
				class="w-full rounded-xl shadow-md"
				loading="lazy"
			/>
		</div>
	</div>
</section>
