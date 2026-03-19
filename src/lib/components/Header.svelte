<script>
	import * as m from '$lib/paraglide/messages';
	import { locales, localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import CartButton from '$lib/components/CartButton.svelte';
	import CartDrawer from '$lib/components/CartDrawer.svelte';

	let isLangMenuOpen = $state(false);
	let isScrolled = $state(false);
	let isCartOpen = $state(false);
	let storeOpen = $state(true);
	let shopEnabled = $state(true);

	$effect(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 10;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	$effect(() => {
		fetch('/api/store-status')
			.then((r) => r.json())
			.then((data) => {
				storeOpen = data.open;
				shopEnabled = data.shopEnabled;
			})
			.catch(() => {});
	});

	function toggleLangMenu() {
		isLangMenuOpen = !isLangMenuOpen;
	}

	function closeLangMenu() {
		isLangMenuOpen = false;
	}

	/** @param {string} loc */
	function getLangLabel(loc) {
		if (loc === 'de') return m.lang_de();
		if (loc === 'en') return m.lang_en();
		if (loc === 'tr') return m.lang_tr();
		return loc.toUpperCase();
	}

	const allNavLinks = [
		{ href: '/#menu', label: m.nav_menu, shopOnly: false },
		{ href: '/#gallery', label: m.nav_gallery, shopOnly: false },
		{ href: '/#reviews', label: m.nav_reviews, shopOnly: false },
		{ href: '/#video', label: m.nav_video, shopOnly: false },
		{ href: '/#contact', label: m.nav_contact, shopOnly: false },
		{ href: '/order/status', label: m.nav_order_status, shopOnly: true }
	];

	let navLinks = $derived(allNavLinks.filter((link) => !link.shopOnly || shopEnabled));
</script>

<header
	class={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
		isScrolled ? 'bg-white/95 py-2 shadow-md backdrop-blur-sm' : 'bg-white/90 py-4 backdrop-blur-sm'
	}`}
>
	<div class="container mx-auto flex items-center justify-between px-4">
		<nav class="hidden items-center gap-8 md:flex">
			{#each navLinks as link}
				<a
					href={link.href.startsWith('/#') ? link.href : localizeHref(link.href)}
					class="font-body text-sm font-medium tracking-wide text-gray-700 transition-colors hover:text-crimson"
				>
					{link.label()}
				</a>
			{/each}
		</nav>

		<a href="/#hero" class="font-display text-lg font-bold text-crimson md:hidden">Saraylı Döner</a>

		<div class="flex items-center gap-2">
			<span
				class="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-body text-xs font-medium sm:inline-flex {storeOpen
					? 'border-emerald-200 bg-emerald-50 text-emerald-700'
					: 'border-red-200 bg-red-50 text-red-700'}"
			>
				<span class="h-1.5 w-1.5 rounded-full {storeOpen ? 'bg-emerald-500' : 'bg-red-500'}"></span>
				{storeOpen ? m.open_now() : m.closed_now()}
			</span>
			{#if shopEnabled}
				<CartButton onclick={() => (isCartOpen = true)} />
			{/if}

			<div class="relative">
				<button
					onclick={toggleLangMenu}
					class="flex items-center gap-1 text-sm font-medium text-gray-700 uppercase transition-colors hover:text-crimson"
				>
					{getLocale()}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class={`h-4 w-4 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{#if isLangMenuOpen}
					<div
						class="fixed inset-0 z-10 cursor-default"
						onclick={closeLangMenu}
						aria-hidden="true"
					></div>

					<div
						class="ring-opacity-5 absolute right-0 z-20 mt-2 w-32 rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none"
					>
						{#each locales as loc}
							<a
								href={localizeHref(page.url.pathname, { locale: loc })}
								data-sveltekit-reload
								class={`block px-4 py-2 text-sm ${
									getLocale() === loc
										? 'bg-cream/20 font-bold text-crimson'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
								onclick={closeLangMenu}
							>
								{getLangLabel(loc)}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>

{#if shopEnabled}
	<CartDrawer open={isCartOpen} onclose={() => (isCartOpen = false)} />
{/if}
