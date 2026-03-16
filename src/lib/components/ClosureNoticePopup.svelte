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
			document.cookie = `closure_notice_203_dismissed=true;path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
		}, 300);
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
		if (!browser || getCookie('closure_notice_203_dismissed')) return;

		// Show popup after a short delay on mobile
		const isMobile = window.innerWidth < 768;
		if (isMobile) {
			return showPopup(2000);
		}
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
		class="fixed inset-0 z-[70] flex items-center justify-center p-4 md:hidden"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-label="Geschlossen am 20.3."
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
			class="relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-amber-300/50 bg-gradient-to-br from-amber-50 via-white to-amber-50 shadow-2xl transition-all duration-300 {animateIn
				? 'scale-100 opacity-100'
				: 'scale-90 opacity-0'}"
		>
			<div class="h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"></div>

			<button
				onclick={dismiss}
				class="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm transition-all hover:bg-crimson hover:text-white hover:shadow-md focus:ring-2 focus:ring-crimson focus:ring-offset-2 focus:outline-none"
				aria-label="Schließen"
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

			<div class="px-6 pt-6 pb-6">
				<div class="mb-4 flex justify-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-8 w-8 text-amber-600"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
				</div>

				<h2 class="text-center font-display text-xl font-bold text-gray-900">Wichtiger Hinweis</h2>

				<div class="mt-4 rounded-xl bg-amber-100/50 p-4">
					<p class="text-center font-body text-base font-semibold text-amber-900">
						20.3. aufgrund von Zuckerfest geschlossen
					</p>
				</div>

				<p class="mt-4 text-center font-body text-sm text-gray-600">
					Wir sind am 20. März geschlossen. Am 21. März sind wir wieder für Sie da!
				</p>

				<button
					onclick={dismiss}
					class="mt-6 w-full rounded-xl bg-crimson px-6 py-3 font-body text-base font-bold text-white shadow-lg shadow-crimson/25 transition-all hover:-translate-y-0.5 hover:bg-crimson-dark hover:shadow-xl hover:shadow-crimson/30 focus:ring-2 focus:ring-crimson focus:ring-offset-2 focus:outline-none"
				>
					Verstanden
				</button>
			</div>
		</div>
	</div>
{/if}
