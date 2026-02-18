<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { menuCategories } from '$lib/config';

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
</script>

<section id="menu" class="bg-white py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="text-center">
			<h2 class="font-display text-3xl font-bold text-crimson md:text-4xl">
				{m.menu_title()}
			</h2>
			<div class="mx-auto mt-4 mb-8 h-1 w-24 rounded-full bg-gold"></div>
		</div>

		<div
			class="scrollbar-hide flex gap-2 overflow-x-auto pb-2 md:justify-center"
			style="-webkit-overflow-scrolling: touch;"
		>
			{#each menuCategories as category}
				<button
					class="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all {activeCategory ===
					category.id
						? 'bg-crimson text-white'
						: 'border border-gray-200 bg-white text-gray-700 hover:bg-cream-dark'}"
					onclick={() => (activeCategory = category.id)}
				>
					{getCategoryName(category.id)}
				</button>
			{/each}
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
						<span class="font-bold whitespace-nowrap text-crimson">
							{item.price.toFixed(2).replace('.', ',')} €
						</span>
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
