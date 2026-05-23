<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();

	const euro = (cents: number) => `${(cents / 100).toFixed(2).replace('.', ',')} €`;

	// ---- editor state ------------------------------------------------------
	let itemModalOpen = $state(false);
	let categoryModalOpen = $state(false);

	let itemDraft = $state({
		id: null as number | null,
		categoryId: 0,
		nameDe: '',
		nameEn: '',
		nameTr: '',
		descDe: '',
		descEn: '',
		descTr: '',
		sizeDe: '',
		sizeEn: '',
		sizeTr: '',
		price: '',
		supportsExtras: false,
		isAvailable: true
	});

	let categoryDraft = $state({
		id: null as number | null,
		nameDe: '',
		nameEn: '',
		nameTr: ''
	});

	function openNewItem(categoryId: number) {
		itemDraft = {
			id: null,
			categoryId,
			nameDe: '',
			nameEn: '',
			nameTr: '',
			descDe: '',
			descEn: '',
			descTr: '',
			sizeDe: '',
			sizeEn: '',
			sizeTr: '',
			price: '',
			supportsExtras: false,
			isAvailable: true
		};
		itemModalOpen = true;
	}

	type ItemRow = (typeof data.categories)[number]['items'][number];

	function openEditItem(item: ItemRow) {
		itemDraft = {
			id: item.id,
			categoryId: item.categoryId,
			nameDe: item.nameDe,
			nameEn: item.nameEn ?? '',
			nameTr: item.nameTr ?? '',
			descDe: item.descDe ?? '',
			descEn: item.descEn ?? '',
			descTr: item.descTr ?? '',
			sizeDe: item.sizeDe ?? '',
			sizeEn: item.sizeEn ?? '',
			sizeTr: item.sizeTr ?? '',
			price: (item.priceCents / 100).toFixed(2).replace('.', ','),
			supportsExtras: item.supportsExtras === 1,
			isAvailable: item.isAvailable === 1
		};
		itemModalOpen = true;
	}

	function openNewCategory() {
		categoryDraft = { id: null, nameDe: '', nameEn: '', nameTr: '' };
		categoryModalOpen = true;
	}

	function openEditCategory(cat: (typeof data.categories)[number]) {
		categoryDraft = { id: cat.id, nameDe: cat.nameDe, nameEn: cat.nameEn ?? '', nameTr: cat.nameTr ?? '' };
		categoryModalOpen = true;
	}

	// Shared enhance handler: optional confirm() gate, refresh data, run onDone on success.
	function submit(options: { confirm?: string; onSuccess?: () => void } = {}): SubmitFunction {
		return ({ cancel }) => {
			if (options.confirm && !window.confirm(options.confirm)) {
				cancel();
				return;
			}
			return async ({ result, update }) => {
				await update();
				if (result.type === 'success') options.onSuccess?.();
			};
		};
	}
</script>

<svelte:head>
	<title>Menu – Saraylı Döner</title>
</svelte:head>

<nav class="border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
		<h1 class="font-display text-xl text-crimson">
			Saraylı Döner <span class="font-body text-sm font-normal text-gray-400">— Menu</span>
		</h1>
		<div class="flex items-center gap-3">
			<a
				href="/"
				class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
			>
				&larr; Main Page
			</a>
			<form method="POST" action="/admin/logout" use:enhance>
				<button
					type="submit"
					class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
				>
					Logout
				</button>
			</form>
		</div>
	</div>
</nav>

<div class="mx-auto max-w-5xl px-4 py-6 sm:px-6">
	<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="font-display text-2xl font-bold text-gray-800">Menu management</h2>
			<p class="font-body text-sm text-gray-500">
				Add, edit, reorder and hide the meals shown on the public menu.
			</p>
		</div>
		<div class="flex gap-2">
			<button
				type="button"
				onclick={openNewCategory}
				class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm font-semibold text-gray-700 transition-colors hover:border-crimson hover:text-crimson"
			>
				+ Category
			</button>
			<button
				type="button"
				onclick={() => openNewItem(data.categories[0]?.id ?? 0)}
				disabled={data.categories.length === 0}
				class="rounded-lg bg-crimson px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark disabled:cursor-not-allowed disabled:opacity-50"
			>
				+ Meal
			</button>
		</div>
	</div>

	{#if form?.error}
		<div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
			{form.error}
		</div>
	{/if}

	{#if data.categories.length === 0}
		<div class="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
			<p class="font-body text-sm text-gray-500">No categories yet. Add one to get started.</p>
		</div>
	{/if}

	<div class="space-y-5">
		{#each data.categories as category, ci (category.id)}
			<section class="rounded-xl border border-gray-100 bg-white shadow-sm">
				<header class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-5">
					<div class="min-w-0">
						<h3 class="truncate font-display text-lg font-bold text-gray-800">{category.nameDe}</h3>
						{#if category.nameEn || category.nameTr}
							<p class="truncate font-body text-xs text-gray-400">
								{[category.nameEn, category.nameTr].filter(Boolean).join(' · ')}
							</p>
						{/if}
					</div>
					<div class="flex items-center gap-1">
						<span class="mr-1 rounded-full bg-gray-100 px-2 py-0.5 font-body text-xs text-gray-500">
							{category.items.length}
						</span>
						<form method="POST" action="?/moveCategory" use:enhance={submit()}>
							<input type="hidden" name="id" value={category.id} />
							<input type="hidden" name="dir" value="up" />
							<button
								type="submit"
								disabled={ci === 0}
								class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
								title="Move up"
								aria-label="Move category up"
							>
								<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 01.7.3l5 5a1 1 0 01-1.4 1.4L10 7.4l-4.3 4.3a1 1 0 01-1.4-1.4l5-5A1 1 0 0110 5z" clip-rule="evenodd" /></svg>
							</button>
						</form>
						<form method="POST" action="?/moveCategory" use:enhance={submit()}>
							<input type="hidden" name="id" value={category.id} />
							<input type="hidden" name="dir" value="down" />
							<button
								type="submit"
								disabled={ci === data.categories.length - 1}
								class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
								title="Move down"
								aria-label="Move category down"
							>
								<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 15a1 1 0 01-.7-.3l-5-5a1 1 0 011.4-1.4L10 12.6l4.3-4.3a1 1 0 011.4 1.4l-5 5A1 1 0 0110 15z" clip-rule="evenodd" /></svg>
							</button>
						</form>
						<button
							type="button"
							onclick={() => openEditCategory(category)}
							class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-crimson"
							title="Edit category"
							aria-label="Edit category"
						>
							<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.6 2.9a2 2 0 012.8 0l.7.7a2 2 0 010 2.8l-8.3 8.3-3.9 1.1 1.1-3.9 8.3-8.3z" /></svg>
						</button>
						<form method="POST" action="?/deleteCategory" use:enhance={submit({ confirm: `Delete category “${category.nameDe}”?` })}>
							<input type="hidden" name="id" value={category.id} />
							<button
								type="submit"
								class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
								title="Delete category"
								aria-label="Delete category"
							>
								<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.9.6L7.6 4H4a1 1 0 000 2h12a1 1 0 100-2h-3.6l-.5-1.4A1 1 0 0011 2H9zM5 8a1 1 0 011 1v6a1 1 0 102 0V9a1 1 0 112 0v6a1 1 0 102 0V9a1 1 0 112 0v6a3 3 0 01-3 3H8a3 3 0 01-3-3V8z" clip-rule="evenodd" /></svg>
							</button>
						</form>
					</div>
				</header>

				<ul class="divide-y divide-gray-50">
					{#each category.items as item, ii (item.id)}
						<li class="flex items-center gap-3 px-4 py-3 sm:px-5 {item.isAvailable === 0 ? 'opacity-55' : ''}">
							<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream-dark">
								<svg class="h-5 w-5 text-crimson" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M5 3v7a2 2 0 0 0 4 0V3" /><path d="M7 10v11" /><path d="M17 3c-1.66 0-3 2.24-3 5s1.34 4 3 4m0-9v18" />
								</svg>
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="font-body text-xs font-bold text-gold">{String(item.id).padStart(2, '0')}</span>
									<span class="truncate font-body text-sm font-semibold text-gray-900">{item.nameDe}</span>
									{#if item.supportsExtras === 1}
										<span class="rounded-full bg-amber-100 px-1.5 py-0.5 font-body text-[10px] font-semibold text-amber-700">Extras</span>
									{/if}
									{#if item.isAvailable === 0}
										<span class="rounded-full bg-gray-200 px-1.5 py-0.5 font-body text-[10px] font-semibold text-gray-600">Hidden</span>
									{/if}
								</div>
								{#if item.nameEn || item.nameTr}
									<p class="truncate font-body text-xs text-gray-400">{[item.nameEn, item.nameTr].filter(Boolean).join(' · ')}</p>
								{/if}
								{#if item.descDe || item.sizeDe}
									<p class="truncate font-body text-xs text-gray-500">{[item.descDe, item.sizeDe].filter(Boolean).join(' · ')}</p>
								{/if}
							</div>
							<span class="shrink-0 font-body text-sm font-bold whitespace-nowrap text-crimson">{euro(item.priceCents)}</span>
							<div class="flex shrink-0 items-center gap-0.5">
								<form method="POST" action="?/moveItem" use:enhance={submit()}>
									<input type="hidden" name="id" value={item.id} />
									<input type="hidden" name="dir" value="up" />
									<button type="submit" disabled={ii === 0} class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30" title="Move up" aria-label="Move meal up">
										<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 01.7.3l5 5a1 1 0 01-1.4 1.4L10 7.4l-4.3 4.3a1 1 0 01-1.4-1.4l5-5A1 1 0 0110 5z" clip-rule="evenodd" /></svg>
									</button>
								</form>
								<form method="POST" action="?/moveItem" use:enhance={submit()}>
									<input type="hidden" name="id" value={item.id} />
									<input type="hidden" name="dir" value="down" />
									<button type="submit" disabled={ii === category.items.length - 1} class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30" title="Move down" aria-label="Move meal down">
										<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 15a1 1 0 01-.7-.3l-5-5a1 1 0 011.4-1.4L10 12.6l4.3-4.3a1 1 0 011.4 1.4l-5 5A1 1 0 0110 15z" clip-rule="evenodd" /></svg>
									</button>
								</form>
								<form method="POST" action="?/toggleItem" use:enhance={submit()}>
									<input type="hidden" name="id" value={item.id} />
									<input type="hidden" name="available" value={item.isAvailable === 1 ? '0' : '1'} />
									<button type="submit" class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" title={item.isAvailable === 1 ? 'Hide from menu' : 'Show on menu'} aria-label="Toggle availability">
										{#if item.isAvailable === 1}
											<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 4C5.5 4 1.7 6.9.5 10c1.2 3.1 5 6 9.5 6s8.3-2.9 9.5-6c-1.2-3.1-5-6-9.5-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z" /></svg>
										{:else}
											<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3.7 2.3L2.3 3.7l2.5 2.5C3 7.4 1.4 8.9.5 10c1.2 3.1 5 6 9.5 6 1.6 0 3.2-.4 4.5-1l2.3 2.3 1.4-1.4L3.7 2.3zM10 14a4 4 0 01-3.7-5.6l1.5 1.5a2 2 0 002.3 2.3l1.5 1.5c-.5.2-1 .3-1.6.3zm0-8c4.5 0 8.3 2.9 9.5 6-.5 1.2-1.3 2.3-2.4 3.2l-1.5-1.5A4 4 0 0010 6c-.3 0-.6 0-.9.1L7.7 4.5C8.4 4.2 9.2 4 10 4z" /></svg>
										{/if}
									</button>
								</form>
								<button type="button" onclick={() => openEditItem(item)} class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-crimson" title="Edit meal" aria-label="Edit meal">
									<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.6 2.9a2 2 0 012.8 0l.7.7a2 2 0 010 2.8l-8.3 8.3-3.9 1.1 1.1-3.9 8.3-8.3z" /></svg>
								</button>
								<form method="POST" action="?/deleteItem" use:enhance={submit({ confirm: `Delete “${item.nameDe}”?` })}>
									<input type="hidden" name="id" value={item.id} />
									<button type="submit" class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" title="Delete meal" aria-label="Delete meal">
										<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.9.6L7.6 4H4a1 1 0 000 2h12a1 1 0 100-2h-3.6l-.5-1.4A1 1 0 0011 2H9zM5 8a1 1 0 011 1v6a1 1 0 102 0V9a1 1 0 112 0v6a1 1 0 102 0V9a1 1 0 112 0v6a3 3 0 01-3 3H8a3 3 0 01-3-3V8z" clip-rule="evenodd" /></svg>
									</button>
								</form>
							</div>
						</li>
					{/each}
					{#if category.items.length === 0}
						<li class="px-4 py-4 sm:px-5"><p class="font-body text-sm text-gray-400">No meals in this category yet.</p></li>
					{/if}
				</ul>

				<div class="border-t border-gray-100 px-4 py-2.5 sm:px-5">
					<button type="button" onclick={() => openNewItem(category.id)} class="font-body text-sm font-semibold text-crimson transition-colors hover:text-crimson-dark">
						+ Add meal to {category.nameDe}
					</button>
				</div>
			</section>
		{/each}
	</div>
</div>

<!-- ---- meal editor modal -------------------------------------------------- -->
{#if itemModalOpen}
	<div class="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto py-8" role="dialog" aria-modal="true" aria-label="Meal editor">
		<button class="fixed inset-0 bg-black/45 backdrop-blur-[1px]" onclick={() => (itemModalOpen = false)} aria-label="Close"></button>
		<form
			method="POST"
			action="?/saveItem"
			use:enhance={submit({ onSuccess: () => (itemModalOpen = false) })}
			class="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
		>
			<input type="hidden" name="id" value={itemDraft.id ?? ''} />
			<h3 class="mb-4 font-display text-xl font-bold text-crimson">{itemDraft.id ? 'Edit meal' : 'New meal'}</h3>

			<label class="mb-3 block">
				<span class="mb-1 block font-body text-sm font-medium text-gray-600">Category</span>
				<select name="categoryId" bind:value={itemDraft.categoryId} class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0">
					{#each data.categories as cat}
						<option value={cat.id}>{cat.nameDe}</option>
					{/each}
				</select>
			</label>

			<div class="mb-3">
				<span class="mb-1 block font-body text-sm font-medium text-gray-600">Name</span>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
					<input name="nameDe" bind:value={itemDraft.nameDe} placeholder="Deutsch *" required class="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
					<input name="nameEn" bind:value={itemDraft.nameEn} placeholder="English" class="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
					<input name="nameTr" bind:value={itemDraft.nameTr} placeholder="Türkçe" class="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
				</div>
			</div>

			<div class="mb-3">
				<span class="mb-1 block font-body text-sm font-medium text-gray-600">Description <span class="text-gray-400">(optional)</span></span>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
					<input name="descDe" bind:value={itemDraft.descDe} placeholder="Deutsch" class="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
					<input name="descEn" bind:value={itemDraft.descEn} placeholder="English" class="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
					<input name="descTr" bind:value={itemDraft.descTr} placeholder="Türkçe" class="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
				</div>
			</div>

			<div class="mb-3">
				<span class="mb-1 block font-body text-sm font-medium text-gray-600">Size <span class="text-gray-400">(optional, e.g. 0,33l)</span></span>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
					<input name="sizeDe" bind:value={itemDraft.sizeDe} placeholder="Deutsch" class="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
					<input name="sizeEn" bind:value={itemDraft.sizeEn} placeholder="English" class="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
					<input name="sizeTr" bind:value={itemDraft.sizeTr} placeholder="Türkçe" class="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
				</div>
			</div>

			<div class="mb-4 flex flex-wrap items-end gap-4">
				<label class="block">
					<span class="mb-1 block font-body text-sm font-medium text-gray-600">Price (€)</span>
					<input name="price" bind:value={itemDraft.price} inputmode="decimal" placeholder="8,00" required class="w-32 rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
				</label>
				<label class="flex items-center gap-2 pb-2">
					<input type="checkbox" name="supportsExtras" bind:checked={itemDraft.supportsExtras} class="h-4 w-4 rounded border-gray-300 text-crimson focus:ring-crimson" />
					<span class="font-body text-sm text-gray-700">Offer Extras picker</span>
				</label>
				<label class="flex items-center gap-2 pb-2">
					<input type="checkbox" name="isAvailable" bind:checked={itemDraft.isAvailable} class="h-4 w-4 rounded border-gray-300 text-crimson focus:ring-crimson" />
					<span class="font-body text-sm text-gray-700">Visible on menu</span>
				</label>
			</div>

			<div class="flex justify-end gap-2">
				<button type="button" onclick={() => (itemModalOpen = false)} class="rounded-lg border border-gray-200 px-4 py-2 font-body text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">Cancel</button>
				<button type="submit" class="rounded-lg bg-crimson px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark">Save</button>
			</div>
		</form>
	</div>
{/if}

<!-- ---- category editor modal --------------------------------------------- -->
{#if categoryModalOpen}
	<div class="fixed inset-0 z-[80] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Category editor">
		<button class="fixed inset-0 bg-black/45 backdrop-blur-[1px]" onclick={() => (categoryModalOpen = false)} aria-label="Close"></button>
		<form
			method="POST"
			action="?/saveCategory"
			use:enhance={submit({ onSuccess: () => (categoryModalOpen = false) })}
			class="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
		>
			<input type="hidden" name="id" value={categoryDraft.id ?? ''} />
			<h3 class="mb-4 font-display text-xl font-bold text-crimson">{categoryDraft.id ? 'Edit category' : 'New category'}</h3>

			<label class="mb-3 block">
				<span class="mb-1 block font-body text-sm font-medium text-gray-600">Name (Deutsch *)</span>
				<input name="nameDe" bind:value={categoryDraft.nameDe} required class="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
			</label>
			<label class="mb-3 block">
				<span class="mb-1 block font-body text-sm font-medium text-gray-600">Name (English)</span>
				<input name="nameEn" bind:value={categoryDraft.nameEn} class="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
			</label>
			<label class="mb-4 block">
				<span class="mb-1 block font-body text-sm font-medium text-gray-600">Name (Türkçe)</span>
				<input name="nameTr" bind:value={categoryDraft.nameTr} class="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0" />
			</label>

			<div class="flex justify-end gap-2">
				<button type="button" onclick={() => (categoryModalOpen = false)} class="rounded-lg border border-gray-200 px-4 py-2 font-body text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">Cancel</button>
				<button type="submit" class="rounded-lg bg-crimson px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark">Save</button>
			</div>
		</form>
	</div>
{/if}
