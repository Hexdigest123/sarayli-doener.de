<script>
	import * as m from '$lib/paraglide/messages';
	import { businessInfo } from '$lib/config';

	const currentYear = new Date().getFullYear();

	function isOpen() {
		const now = new Date();
		const h = now.getHours();
		return h >= 11 && h < 22;
	}

	let open = $state(isOpen());

	$effect(() => {
		const interval = setInterval(() => {
			open = isOpen();
		}, 60_000);
		return () => clearInterval(interval);
	});
</script>

<footer id="contact" class="relative overflow-hidden bg-crimson text-white">
	<div class="mx-auto max-w-6xl px-4 py-16 md:py-24">
		<div class="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-24">
			<div class="flex flex-col gap-8">
				<h2 class="font-display text-3xl font-bold text-white md:text-4xl">
					{m.footer_find_us()}
				</h2>

				<a
					href={businessInfo.googleMapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="group relative block cursor-pointer overflow-hidden rounded-xl border border-white/20 bg-white/10 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl"
				>
					<div class="flex flex-col items-center justify-center gap-6 py-4 text-center">
						<div
							class="rounded-full border border-white/10 bg-white/10 p-4 transition-transform duration-300 group-hover:scale-110"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-10 w-10 text-gold"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
								<circle cx="12" cy="10" r="3"></circle>
							</svg>
						</div>

						<div class="space-y-2">
							<p class="mx-auto max-w-[250px] text-xl leading-relaxed font-medium text-white">
								{businessInfo.address}
							</p>
							<p
								class="mt-4 text-xs font-medium tracking-wide text-white/50 uppercase transition-colors group-hover:text-gold"
							>
								{m.footer_maps_hint()}
							</p>
						</div>
					</div>
				</a>
			</div>

			<div class="flex flex-col gap-10 md:pt-4">
				<div class="hidden space-y-2 md:block">
					<h3 class="text-sm font-semibold tracking-wider text-gold uppercase">
						{m.footer_address()}
					</h3>
					<p class="text-xl leading-relaxed font-light text-white opacity-90">
						{businessInfo.address}
					</p>
				</div>

				<div class="space-y-2">
					<h3 class="text-sm font-semibold tracking-wider text-gold uppercase">
						{m.footer_phone()}
					</h3>
					<a
						href="tel:+492043376490"
						class="block w-fit text-xl font-light text-white transition-colors hover:text-gold"
					>
						{businessInfo.phone}
					</a>
				</div>

				<div class="space-y-2">
					<h3 class="text-sm font-semibold tracking-wider text-gold uppercase">
						{m.footer_hours()}
					</h3>
					<div class="flex items-center gap-3">
						<span class="relative flex h-2.5 w-2.5">
							{#if open}
								<span
									class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
								></span>
								<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
							{:else}
								<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
							{/if}
						</span>
						<p class="text-xl font-light text-white opacity-90">
							{m.footer_hours_value()}
						</p>
					</div>
				</div>

				<div class="flex flex-col gap-3 pt-2">
					<a
						href={businessInfo.instagramUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="group inline-flex w-fit items-center gap-3 text-white transition-colors hover:text-gold"
					>
						<div class="rounded-lg bg-white/10 p-2 transition-colors group-hover:bg-white/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path
									d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
								/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
							</svg>
						</div>
						<span class="text-lg font-medium">{businessInfo.instagramHandle}</span>
					</a>
					<a
						href={businessInfo.tiktokUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="group inline-flex w-fit items-center gap-3 text-white transition-colors hover:text-gold"
					>
						<div class="rounded-lg bg-white/10 p-2 transition-colors group-hover:bg-white/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.27 8.27 0 0 0 4.76 1.5V6.74a4.83 4.83 0 0 1-1-.05z"
								/>
							</svg>
						</div>
						<span class="text-lg font-medium">{businessInfo.tiktokHandle}</span>
					</a>
				</div>
			</div>
		</div>
	</div>

	<div class="border-t border-white/10 bg-black/10 backdrop-blur-sm">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row"
		>
			<p class="text-sm font-light text-white/50">
				{m.footer_copyright({ year: String(currentYear) })}
			</p>

			<div class="flex items-center gap-4">
				<a
					href="/impressum"
					aria-label={m.footer_impressum()}
					class="py-3 text-sm font-light text-white/50 transition-colors hover:text-gold"
				>
					{m.footer_impressum()}
				</a>
				<a
					href="/datenschutz"
					aria-label={m.footer_datenschutz()}
					class="py-3 text-sm font-light text-white/50 transition-colors hover:text-gold"
				>
					{m.footer_datenschutz()}
				</a>
				<span class="text-white/20">|</span>
				<a
					href={businessInfo.instagramUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="p-3 text-white/40 transition-colors hover:text-gold"
					aria-label="Instagram"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path
							d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
						/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
					</svg>
				</a>
				<a
					href={businessInfo.tiktokUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="p-3 text-white/40 transition-colors hover:text-gold"
					aria-label="TikTok"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.27 8.27 0 0 0 4.76 1.5V6.74a4.83 4.83 0 0 1-1-.05z"
						/>
					</svg>
				</a>
			</div>
		</div>
	</div>
</footer>
