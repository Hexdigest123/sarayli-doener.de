<script lang="ts">
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';

	let visible = $state(false);
	let showSettings = $state(false);
	let analyticsEnabled = $state(true);
	let dialogEl = $state<HTMLDivElement>();

	function getCookie(name: string): string | null {
		if (!browser) return null;
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return match ? match[2] : null;
	}

	function setConsent(value: 'granted' | 'denied') {
		document.cookie = `tracking_consent=${value};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
		visible = false;
		window.dispatchEvent(new CustomEvent('cookie-consent-resolved'));
	}

	function acceptAll() {
		setConsent('granted');
	}

	function saveSelection() {
		setConsent(analyticsEnabled ? 'granted' : 'denied');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showSettings = false;
			return;
		}

		if (e.key !== 'Tab' || !dialogEl) return;

		const focusable = dialogEl.querySelectorAll<HTMLElement>(
			'button, a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

	$effect(() => {
		if (browser && !getCookie('tracking_consent')) {
			visible = true;
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
		class="fixed inset-0 z-50"
		role="dialog"
		aria-modal="true"
		aria-label={m.cookie_settings_title()}
		onkeydown={handleKeydown}
	>
		<div class="absolute inset-0 bg-black/60" aria-hidden="true"></div>

		<div
			bind:this={dialogEl}
			class="absolute right-0 bottom-0 left-0 animate-[slideUp_0.4s_ease-out] rounded-t-2xl bg-white px-6 py-8 shadow-2xl sm:px-10"
		>
			{#if !showSettings}
				<div class="mx-auto max-w-2xl">
					<h2 class="mb-2 font-display text-lg text-gray-900">{m.cookie_title()}</h2>
					<p class="mb-5 font-body text-sm leading-relaxed text-gray-600">
						{m.cookie_text()}
						<a href="/datenschutz" class="text-crimson underline hover:text-crimson-dark">
							{m.cookie_learn_more()}
						</a>
					</p>
					<div class="flex items-center gap-6">
						<button
							onclick={acceptAll}
							class="rounded-xl bg-crimson px-8 py-3 font-body text-base font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-crimson-dark hover:shadow-lg focus:ring-2 focus:ring-crimson focus:ring-offset-2 focus:outline-none"
						>
							{m.cookie_accept()}
						</button>
						<button
							onclick={() => (showSettings = true)}
							class="font-body text-xs text-gray-400 underline-offset-2 hover:underline focus:text-gray-600 focus:underline focus:outline-none"
						>
							{m.cookie_settings()}
						</button>
					</div>
				</div>
			{:else}
				<div class="mx-auto max-w-2xl">
					<h2 class="mb-5 font-display text-lg text-gray-900">{m.cookie_settings_title()}</h2>

					<fieldset class="mb-6 space-y-4">
						<legend class="sr-only">{m.cookie_settings_title()}</legend>

						<div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
							<div>
								<p class="font-body text-sm font-medium text-gray-900" id="label-necessary">
									{m.cookie_necessary_title()}
								</p>
								<p class="font-body text-xs text-gray-400">
									{m.cookie_necessary_desc()}
								</p>
							</div>
							<div
								class="relative h-5 w-9 shrink-0"
								role="switch"
								aria-checked="true"
								aria-labelledby="label-necessary"
							>
								<input
									type="checkbox"
									checked
									disabled
									class="peer sr-only"
									aria-labelledby="label-necessary"
								/>
								<div class="h-5 w-9 cursor-not-allowed rounded-full bg-crimson/50 opacity-60"></div>
								<div
									class="absolute top-0.5 left-[18px] h-4 w-4 rounded-full bg-white shadow-sm"
								></div>
							</div>
						</div>

						<div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
							<div>
								<p class="font-body text-sm font-medium text-gray-900" id="label-analytics">
									{m.cookie_analytics_title()}
								</p>
								<p class="font-body text-xs text-gray-400">
									{m.cookie_analytics_desc()}
								</p>
							</div>
							<label
								class="relative h-5 w-9 shrink-0 cursor-pointer"
								role="switch"
								aria-checked={analyticsEnabled}
								aria-labelledby="label-analytics"
							>
								<input type="checkbox" bind:checked={analyticsEnabled} class="peer sr-only" />
								<div
									class="h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-crimson"
								></div>
								<div
									class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"
								></div>
							</label>
						</div>
					</fieldset>

					<div class="flex items-center gap-4">
						<button
							onclick={acceptAll}
							class="rounded-xl bg-crimson px-8 py-3 font-body text-base font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-crimson-dark hover:shadow-lg focus:ring-2 focus:ring-crimson focus:ring-offset-2 focus:outline-none"
						>
							{m.cookie_accept()}
						</button>
						<button
							onclick={saveSelection}
							class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
						>
							{m.cookie_save()}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
