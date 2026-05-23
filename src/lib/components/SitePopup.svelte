<script lang="ts">
	import { browser } from '$app/environment';

	type Popup = {
		title: string;
		bodyHtml: string | null;
		imageUrl: string | null;
		badge: string | null;
		ctaLabel: string | null;
		ctaUrl: string | null;
	};

	let popup = $state<Popup | null>(null);
	let visible = $state(false);
	let animateIn = $state(false);
	let dialogEl = $state<HTMLDivElement>();

	function getCookie(name: string): string | null {
		if (!browser) return null;
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return match ? match[2] : null;
	}

	// The popup is shown on every visit, so closing it only hides it for the current page
	// load — there is no persisted "already seen" flag.
	function dismiss() {
		animateIn = false;
		setTimeout(() => {
			visible = false;
		}, 300);
	}

	function isInternalAnchor(url: string): boolean {
		return url.startsWith('#');
	}

	function handleCta() {
		const url = popup?.ctaUrl;
		if (!url) {
			dismiss();
			return;
		}
		if (isInternalAnchor(url)) {
			dismiss();
			setTimeout(() => {
				document.getElementById(url.slice(1))?.scrollIntoView({ behavior: 'smooth' });
			}, 350);
			return;
		}
		// Same-tab navigation for paths and absolute URLs.
		window.location.href = url;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			dismiss();
			return;
		}
		if (e.key !== 'Tab' || !dialogEl) return;

		const focusable = dialogEl.querySelectorAll<HTMLElement>(
			'button, a[href], [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function show() {
		visible = true;
		requestAnimationFrame(() => {
			animateIn = true;
		});
	}

	async function loadPopup() {
		try {
			const res = await fetch('/api/popup');
			if (!res.ok) return;
			const data = (await res.json()) as { popup: Popup | null };
			const next = data.popup;
			if (!next || !next.title?.trim()) return;
			popup = next;

			// Don't stack on top of the cookie banner. On a first visit, wait for the
			// consent decision; for returning visitors, show after a short delay.
			if (getCookie('tracking_consent')) {
				setTimeout(show, 1200);
			} else {
				window.addEventListener('cookie-consent-resolved', () => setTimeout(show, 600), {
					once: true
				});
			}
		} catch {
			// Network/parse failure — no popup this load.
		}
	}

	$effect(() => {
		if (!browser) return;
		loadPopup();
	});

	$effect(() => {
		if (visible && dialogEl) {
			dialogEl.querySelector<HTMLElement>('button')?.focus();
		}
	});
</script>

{#if visible && popup}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-label={popup.title}
		onkeydown={handleKeydown}
		data-testid="site-popup"
	>
		<div
			class="absolute inset-0 transition-opacity duration-300 {animateIn
				? 'bg-black/60 backdrop-blur-sm'
				: 'bg-black/0'}"
			aria-hidden="true"
			onclick={dismiss}
		></div>

		<div
			bind:this={dialogEl}
			class="popup-card relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-gold/30 bg-gradient-to-br from-cream via-white to-cream shadow-2xl transition-all duration-300 {animateIn
				? 'scale-100 opacity-100'
				: 'scale-90 opacity-0'}"
		>
			<div class="h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light"></div>

			<button
				onclick={dismiss}
				class="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm transition-all hover:bg-crimson hover:text-white hover:shadow-md focus:ring-2 focus:ring-crimson focus:ring-offset-2 focus:outline-none"
				aria-label="Close"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>

			{#if popup.imageUrl}
				<img src={popup.imageUrl} alt="" class="h-44 w-full object-cover sm:h-52" />
			{/if}

			<div class="px-6 pt-5 pb-6 sm:px-8">
				{#if popup.badge}
					<div class="mb-3 flex justify-center">
						<span
							class="offer-badge inline-flex items-center rounded-full bg-crimson px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase shadow-lg shadow-crimson/20"
						>
							{popup.badge}
						</span>
					</div>
				{/if}

				<h2 class="text-center font-display text-2xl font-bold text-crimson sm:text-3xl">
					{popup.title}
				</h2>

				{#if popup.bodyHtml}
					<div
						class="popup-prose prose prose-sm mt-3 max-w-none text-center font-body leading-relaxed text-gray-600 prose-headings:font-display prose-headings:text-crimson prose-a:text-crimson prose-ol:list-inside prose-ol:pl-0 prose-ul:list-inside prose-ul:pl-0"
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitised server-side in $lib/server/markdown -->
						{@html popup.bodyHtml}
					</div>
				{/if}

				<div class="mt-6 flex flex-col items-center gap-2">
					{#if popup.ctaUrl}
						<button
							onclick={handleCta}
							class="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-crimson px-8 py-3.5 font-body text-base font-bold text-white shadow-lg shadow-crimson/25 transition-all hover:-translate-y-0.5 hover:bg-crimson-dark hover:shadow-xl hover:shadow-crimson/30 focus:ring-2 focus:ring-crimson focus:ring-offset-2 focus:outline-none sm:w-auto"
						>
							<span>{popup.ctaLabel || 'Mehr erfahren'}</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2.5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</button>
					{/if}
					<button
						onclick={dismiss}
						class="font-body text-xs text-gray-400 underline-offset-2 transition-colors hover:text-gray-600 hover:underline focus:text-gray-600 focus:underline focus:outline-none"
					>
						Schließen
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.offer-badge {
		animation: badgePulse 2s ease-in-out infinite;
	}

	/* Keep the rendered Markdown tight inside the popup: drop the outer margins the
	   typography plugin adds to the first/last block so spacing stays controlled. */
	.popup-prose :global(> :first-child) {
		margin-top: 0;
	}
	.popup-prose :global(> :last-child) {
		margin-bottom: 0;
	}

	@keyframes badgePulse {
		0%,
		100% {
			box-shadow: 0 4px 14px -1px rgba(139, 26, 26, 0.2);
		}
		50% {
			box-shadow: 0 4px 20px -1px rgba(139, 26, 26, 0.4);
		}
	}
</style>
