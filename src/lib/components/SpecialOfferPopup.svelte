<script lang="ts">
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';

	let visible = $state(false);
	let animateIn = $state(false);
	let dialogEl = $state<HTMLDivElement>();

	function getCookie(name: string): string | null {
		if (!browser) return null;
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return match ? match[2] : null;
	}

	function dismiss() {
		animateIn = false;
		setTimeout(() => {
			visible = false;
			document.cookie = `offer_popup_dismissed=true;path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
		}, 300);
	}

	function handleCta() {
		dismiss();
		setTimeout(() => {
			document.getElementById('special-offers')?.scrollIntoView({ behavior: 'smooth' });
		}, 350);
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

	function showPopup(delay: number) {
		const timer = setTimeout(() => {
			visible = true;
			requestAnimationFrame(() => {
				animateIn = true;
			});
		}, delay);
		return () => clearTimeout(timer);
	}

	$effect(() => {
		if (!browser || getCookie('offer_popup_dismissed')) return;

		// Returning visitor: cookie banner already resolved, show after 1.5s
		if (getCookie('tracking_consent')) {
			return showPopup(1500);
		}

		// First visit: wait for cookie banner to be dismissed first
		function onConsentResolved() {
			cleanup = showPopup(800);
		}

		let cleanup: (() => void) | undefined;
		window.addEventListener('cookie-consent-resolved', onConsentResolved, { once: true });

		return () => {
			window.removeEventListener('cookie-consent-resolved', onConsentResolved);
			cleanup?.();
		};
	});

	$effect(() => {
		if (visible && dialogEl) {
			const firstButton = dialogEl.querySelector<HTMLElement>('button');
			firstButton?.focus();
		}
	});
</script>

{#if visible}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-label={m.offer_popup_title()}
		onkeydown={handleKeydown}
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

			<div class="px-6 pt-5 pb-6 sm:px-8">
				<div class="mb-3 flex justify-center">
					<span
						class="offer-badge inline-flex items-center gap-1.5 rounded-full bg-crimson px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase shadow-lg shadow-crimson/20"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M9.153 5.408C10.42 3.136 11.053 2 12 2c.947 0 1.58 1.136 2.847 3.408l.328.588c.36.645.54.967.82 1.175.28.208.63.273 1.33.404l.636.12c2.451.462 3.677.693 3.97 1.636.292.944-.597 1.926-1.774 3.89l-.384.64c-.335.56-.502.84-.56 1.166-.058.327.003.664.125 1.339l.11.614c.49 2.748.735 4.122.056 4.762-.68.64-1.936.044-4.448-1.147l-.59-.28c-.627-.297-.94-.446-1.274-.446-.335 0-.648.149-1.274.446l-.59.28c-2.512 1.191-3.768 1.787-4.449 1.147-.679-.64-.433-2.014.057-4.762l.11-.614c.122-.675.183-1.012.125-1.34-.058-.325-.225-.604-.56-1.164l-.384-.64C4.596 10.37 3.706 9.388 3.999 8.444c.292-.943 1.518-1.174 3.97-1.636l.635-.12c.7-.131 1.05-.196 1.33-.404.28-.208.46-.53.82-1.175l.328-.588Z"
							/>
						</svg>
						{m.offer_popup_badge()}
					</span>
				</div>

				<h2 class="text-center font-display text-2xl font-bold text-crimson sm:text-3xl">
					{m.offer_popup_title()}
				</h2>
				<p class="mt-1 text-center font-body text-sm text-gray-500">
					{m.offer_popup_subtitle()}
				</p>

				<div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div
						class="group relative overflow-hidden rounded-xl border border-gold/20 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-gold/10"
					>
						<div
							class="absolute top-0 right-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-gold/5"
						></div>
						<h3 class="font-display text-base font-bold text-gray-900">
							{m.offer_popup_menu1_title()}
						</h3>
						<p class="mt-1.5 font-body text-xs leading-relaxed text-gray-500">
							{m.offer_popup_menu1_items()}
						</p>
						<div class="mt-3 flex items-baseline gap-1">
							<span class="font-display text-2xl font-bold text-crimson"
								>{m.offer_popup_menu1_price()}</span
							>
						</div>
					</div>

					<div
						class="group relative overflow-hidden rounded-xl border border-gold/20 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-gold/10"
					>
						<div
							class="absolute top-0 right-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-gold/5"
						></div>
						<h3 class="font-display text-base font-bold text-gray-900">
							{m.offer_popup_menu2_title()}
						</h3>
						<p class="mt-1.5 font-body text-xs leading-relaxed text-gray-500">
							{m.offer_popup_menu2_items()}
						</p>
						<div class="mt-3 flex items-baseline gap-1">
							<span class="font-display text-2xl font-bold text-crimson"
								>{m.offer_popup_menu2_price()}</span
							>
						</div>
					</div>
				</div>

				<div class="mt-5 flex flex-col items-center gap-2">
					<button
						onclick={handleCta}
						class="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-crimson px-8 py-3.5 font-body text-base font-bold text-white shadow-lg shadow-crimson/25 transition-all hover:-translate-y-0.5 hover:bg-crimson-dark hover:shadow-xl hover:shadow-crimson/30 focus:ring-2 focus:ring-crimson focus:ring-offset-2 focus:outline-none sm:w-auto"
					>
						<span>{m.offer_popup_cta()}</span>
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
					<button
						onclick={dismiss}
						class="font-body text-xs text-gray-400 underline-offset-2 transition-colors hover:text-gray-600 hover:underline focus:text-gray-600 focus:underline focus:outline-none"
					>
						{m.offer_popup_dismiss()}
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
