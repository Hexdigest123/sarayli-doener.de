<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { cart } from '$lib/stores/cart.svelte';

	let { data } = $props();

	$effect(() => {
		cart.clear();
	});
</script>

<section class="bg-cream py-28 md:py-32">
	<div class="container mx-auto max-w-2xl px-4">
		<div class="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-md md:p-10">
			<div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-crimson">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</div>

			<h1 class="font-display text-3xl font-bold text-crimson md:text-4xl">
				{m.checkout_success_title()}
			</h1>
			<p class="mx-auto mt-3 max-w-xl font-body text-gray-700">{m.checkout_success_message()}</p>

			{#if data.orderNumber}
				<div class="mx-auto mt-6 max-w-sm rounded-xl border border-gray-100 bg-cream p-4">
					<p class="font-body text-sm text-gray-500">{m.order_status_your_order_id()}</p>
					<p class="mt-1 font-display text-2xl font-bold text-crimson">{data.orderNumber}</p>
				</div>

				<a
					href={localizeHref(`/order/status?id=${data.orderNumber}`)}
					class="mt-5 inline-flex rounded-lg border border-crimson/20 bg-white px-5 py-2.5 font-body text-sm font-semibold text-crimson transition-colors hover:bg-crimson hover:text-white"
				>
					{m.order_status_check_status()}
				</a>
			{/if}

			<div class="mt-4">
				<a
					href="/"
					class="inline-flex rounded-lg bg-crimson px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
				>
					{m.checkout_success_back()}
				</a>
			</div>
		</div>
	</div>
</section>
