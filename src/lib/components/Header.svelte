<script>
	import * as m from '$lib/paraglide/messages';
	import { locales, localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { page } from '$app/state';

	let isMobileMenuOpen = $state(false);
	let isLangMenuOpen = $state(false);
	let isScrolled = $state(false);

	$effect(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 10;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}

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

	const navLinks = [
		{ href: '#menu', label: m.nav_menu },
		{ href: '#gallery', label: m.nav_gallery },
		{ href: '#reviews', label: m.nav_reviews },
		{ href: '#video', label: m.nav_video },
		{ href: '#contact', label: m.nav_contact }
	];
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
					href={link.href}
					class="font-body text-sm font-medium tracking-wide text-gray-700 transition-colors hover:text-crimson"
				>
					{link.label()}
				</a>
			{/each}
		</nav>

		<div class="flex items-center gap-4">
			<div class="relative hidden md:block">
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

			<button
				class="text-gray-700 hover:text-crimson focus:outline-none md:hidden"
				onclick={toggleMobileMenu}
				aria-label="Toggle menu"
			>
				{#if isMobileMenuOpen}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	{#if isMobileMenuOpen}
		<div
			class="fixed inset-0 z-40 bg-black/50 md:hidden"
			onclick={closeMobileMenu}
			aria-hidden="true"
		></div>

		<div
			class="fixed top-0 right-0 bottom-0 z-50 flex w-64 transform flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden"
		>
			<div class="flex justify-end border-b border-gray-100 p-4">
				<button
					onclick={closeMobileMenu}
					class="text-gray-500 hover:text-crimson"
					aria-label="Close menu"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="flex-1 overflow-y-auto py-4">
				<nav class="flex flex-col space-y-4 px-4">
					{#each navLinks as link}
						<a
							href={link.href}
							onclick={closeMobileMenu}
							class="border-b border-gray-50 pb-2 font-display text-lg font-medium text-gray-800 hover:text-crimson"
						>
							{link.label()}
						</a>
					{/each}
				</nav>

				<div class="mt-8 px-4">
					<h3 class="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
						Language
					</h3>
					<div class="flex flex-col space-y-2">
						{#each locales as loc}
							<a
								href={localizeHref(page.url.pathname, { locale: loc })}
								data-sveltekit-reload
								class={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
									getLocale() === loc ? 'bg-crimson text-white' : 'text-gray-700 hover:bg-gray-100'
								}`}
								onclick={closeMobileMenu}
							>
								{getLangLabel(loc)}
							</a>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</header>
