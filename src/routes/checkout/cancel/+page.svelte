<script lang="ts">
	import * as m from '$lib/paraglide/messages';
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
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>

			<h1 class="font-display text-3xl font-bold text-crimson md:text-4xl">
				{m.checkout_cancel_title()}
			</h1>
			<p class="mx-auto mt-3 max-w-xl font-body text-gray-700">{m.checkout_cancel_message()}</p>

			<div class="mt-7 flex flex-wrap items-center justify-center gap-3">
				<a
					href="/checkout"
					class="inline-flex rounded-lg bg-crimson px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
				>
					{m.checkout_cancel_retry()}
				</a>
				<a
					href="/"
					class="inline-flex rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-body text-sm font-semibold text-gray-700 transition-colors hover:border-crimson/40 hover:text-crimson"
				>
					{m.checkout_cancel_back()}
				</a>
			</div>
		</div>
	</div>
</section>
