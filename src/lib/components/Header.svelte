<script>
	import * as m from '$lib/paraglide/messages';
	import { locales, localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { page } from '$app/state';

	let isLangMenuOpen = $state(false);
	let isScrolled = $state(false);

	$effect(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 10;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
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

		<a href="#hero" class="font-display text-lg font-bold text-crimson md:hidden">Saraylı Döner</a>

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
</header>
