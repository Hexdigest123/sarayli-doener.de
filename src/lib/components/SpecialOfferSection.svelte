<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<section
	id="special-offers"
	class="relative overflow-hidden bg-gradient-to-br from-crimson via-crimson-dark to-crimson py-16 md:py-24 3xl:py-32 4xl:py-48"
>
	<div class="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true">
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 32px 32px;"
		></div>
	</div>

	<div
		class="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/10 3xl:h-96 3xl:w-96 4xl:h-[32rem] 4xl:w-[32rem]"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gold/5 3xl:h-72 3xl:w-72 4xl:h-96 4xl:w-96"
		aria-hidden="true"
	></div>

	<div class="relative container mx-auto px-4 3xl:max-w-[1600px] 4xl:max-w-[2400px]">
		<div class="text-center">
			<span
				class="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-light uppercase backdrop-blur-sm 3xl:gap-2 3xl:px-6 3xl:py-2 3xl:text-sm 4xl:gap-3 4xl:px-8 4xl:py-3 4xl:text-base"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-3.5 w-3.5 3xl:h-4 3xl:w-4 4xl:h-5 4xl:w-5"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						d="M9.153 5.408C10.42 3.136 11.053 2 12 2c.947 0 1.58 1.136 2.847 3.408l.328.588c.36.645.54.967.82 1.175.28.208.63.273 1.33.404l.636.12c2.451.462 3.677.693 3.97 1.636.292.944-.597 1.926-1.774 3.89l-.384.64c-.335.56-.502.84-.56 1.166-.058.327.003.664.125 1.339l.11.614c.49 2.748.735 4.122.056 4.762-.68.64-1.936.044-4.448-1.147l-.59-.28c-.627-.297-.94-.446-1.274-.446-.335 0-.648.149-1.274.446l-.59.28c-2.512 1.191-3.768 1.787-4.449 1.147-.679-.64-.433-2.014.057-4.762l.11-.614c.122-.675.183-1.012.125-1.34-.058-.325-.225-.604-.56-1.164l-.384-.64C4.596 10.37 3.706 9.388 3.999 8.444c.292-.943 1.518-1.174 3.97-1.636l.635-.12c.7-.131 1.05-.196 1.33-.404.28-.208.46-.53.82-1.175l.328-.588Z"
					/>
				</svg>
				{m.offer_section_badge()}
			</span>
			<h2
				class="mt-4 font-display text-3xl font-bold text-white md:text-4xl 3xl:mt-6 3xl:text-5xl 4xl:mt-8 4xl:text-6xl"
			>
				{m.offer_section_title()}
			</h2>
			<div
				class="mx-auto mt-3 h-1 w-24 rounded-full bg-gold 3xl:mt-4 3xl:h-1.5 3xl:w-32 4xl:mt-6 4xl:h-2 4xl:w-40"
			></div>
			<p
				class="mx-auto mt-4 max-w-lg font-body text-base text-white/70 3xl:mt-6 3xl:max-w-xl 3xl:text-lg 4xl:mt-8 4xl:max-w-2xl 4xl:text-xl"
			>
				{m.offer_section_subtitle()}
			</p>
		</div>

		<div
			class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 3xl:mt-14 3xl:gap-10 4xl:mt-20 4xl:gap-14"
		>
			<div
				class="group relative overflow-hidden rounded-2xl border border-gold/20 bg-white/[0.07] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl hover:shadow-black/10 sm:p-8 3xl:rounded-3xl 3xl:p-10 4xl:p-14"
			>
				<div
					class="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-gold/10 transition-transform duration-300 group-hover:scale-150 3xl:h-28 3xl:w-28 4xl:h-36 4xl:w-36"
					aria-hidden="true"
				></div>

				<h3 class="font-display text-xl font-bold text-white sm:text-2xl 3xl:text-3xl 4xl:text-4xl">
					{m.offer_section_menu1_name()}
				</h3>

				<div class="mt-6 3xl:mt-8 4xl:mt-10">
					<div class="mb-4 flex items-center gap-3 opacity-80 3xl:mb-6 4xl:mb-8">
						<div class="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30"></div>
						<p
							class="text-[10px] font-bold tracking-[0.2em] text-gold-light uppercase 3xl:text-xs 4xl:text-sm"
						>
							{m.offer_section_includes()}
						</p>
						<div class="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30"></div>
					</div>

					<div class="grid grid-cols-2 gap-3 3xl:gap-4 4xl:gap-6">
						<!-- Soup -->
						<div
							class="group/item flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold/5 3xl:gap-3 3xl:rounded-2xl 3xl:p-5 4xl:gap-4 4xl:p-7"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-inner shadow-gold/10 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:text-gold-light 3xl:h-14 3xl:w-14 4xl:h-18 4xl:w-18"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 3xl:h-7 3xl:w-7 4xl:h-9 4xl:w-9"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 8v2m-5-4H4m16 0h-3"
									/>
									<path stroke-linecap="round" d="M4 14c0 0 2 4 8 4s8-4 8-4" />
								</svg>
							</div>
							<span
								class="font-body text-sm font-medium text-white/90 transition-colors group-hover/item:text-white 3xl:text-base 4xl:text-lg"
								>{m.offer_item_soup()}</span
							>
						</div>

						<!-- Main Dish (Dönerteller) -->
						<div
							class="group/item flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold/5 3xl:gap-3 3xl:rounded-2xl 3xl:p-5 4xl:gap-4 4xl:p-7"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-inner shadow-gold/10 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:text-gold-light 3xl:h-14 3xl:w-14 4xl:h-18 4xl:w-18"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 3xl:h-7 3xl:w-7 4xl:h-9 4xl:w-9"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
									<path d="M7 2v20" />
									<path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
								</svg>
							</div>
							<span
								class="font-body text-sm font-medium text-white/90 transition-colors group-hover/item:text-white 3xl:text-base 4xl:text-lg"
								>{m.offer_item_doener_plate()}</span
							>
						</div>

						<!-- Drink -->
						<div
							class="group/item flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold/5 3xl:gap-3 3xl:rounded-2xl 3xl:p-5 4xl:gap-4 4xl:p-7"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-inner shadow-gold/10 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:text-gold-light 3xl:h-14 3xl:w-14 4xl:h-18 4xl:w-18"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 3xl:h-7 3xl:w-7 4xl:h-9 4xl:w-9"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M17 8h1a4 4 0 1 1 0 8h-1" />
									<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
								</svg>
							</div>
							<span
								class="font-body text-sm font-medium text-white/90 transition-colors group-hover/item:text-white 3xl:text-base 4xl:text-lg"
								>{m.offer_item_drink()}</span
							>
						</div>

						<!-- Dessert -->
						<div
							class="group/item flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold/5 3xl:gap-3 3xl:rounded-2xl 3xl:p-5 4xl:gap-4 4xl:p-7"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-inner shadow-gold/10 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:text-gold-light 3xl:h-14 3xl:w-14 4xl:h-18 4xl:w-18"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 3xl:h-7 3xl:w-7 4xl:h-9 4xl:w-9"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M12 2L8.5 9.5 2 12l6.5 2.5L12 22l3.5-7.5L22 12l-6.5-2.5L12 2Z" />
								</svg>
							</div>
							<span
								class="font-body text-sm font-medium text-white/90 transition-colors group-hover/item:text-white 3xl:text-base 4xl:text-lg"
								>{m.offer_item_baklava()}</span
							>
						</div>
					</div>
				</div>

				<div
					class="mt-6 flex items-baseline gap-2 border-t border-white/10 pt-5 3xl:mt-8 3xl:gap-3 3xl:pt-7 4xl:mt-10 4xl:pt-9"
				>
					<span class="font-display text-4xl font-bold text-gold 3xl:text-5xl 4xl:text-6xl"
						>22,00</span
					>
					<span class="font-display text-lg font-bold text-gold/70 3xl:text-xl 4xl:text-2xl">€</span
					>
				</div>
			</div>

			<div
				class="group relative overflow-hidden rounded-2xl border border-gold/20 bg-white/[0.07] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl hover:shadow-black/10 sm:p-8 3xl:rounded-3xl 3xl:p-10 4xl:p-14"
			>
				<div
					class="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-gold/10 transition-transform duration-300 group-hover:scale-150 3xl:h-28 3xl:w-28 4xl:h-36 4xl:w-36"
					aria-hidden="true"
				></div>

				<h3 class="font-display text-xl font-bold text-white sm:text-2xl 3xl:text-3xl 4xl:text-4xl">
					{m.offer_section_menu2_name()}
				</h3>

				<div class="mt-6 3xl:mt-8 4xl:mt-10">
					<div class="mb-4 flex items-center gap-3 opacity-80 3xl:mb-6 4xl:mb-8">
						<div class="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30"></div>
						<p
							class="text-[10px] font-bold tracking-[0.2em] text-gold-light uppercase 3xl:text-xs 4xl:text-sm"
						>
							{m.offer_section_includes()}
						</p>
						<div class="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30"></div>
					</div>

					<div class="grid grid-cols-2 gap-3 3xl:gap-4 4xl:gap-6">
						<div
							class="group/item flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold/5 3xl:gap-3 3xl:rounded-2xl 3xl:p-5 4xl:gap-4 4xl:p-7"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-inner shadow-gold/10 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:text-gold-light 3xl:h-14 3xl:w-14 4xl:h-18 4xl:w-18"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 3xl:h-7 3xl:w-7 4xl:h-9 4xl:w-9"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 8v2m-5-4H4m16 0h-3"
									/>
									<path stroke-linecap="round" d="M4 14c0 0 2 4 8 4s8-4 8-4" />
								</svg>
							</div>
							<span
								class="font-body text-sm font-medium text-white/90 transition-colors group-hover/item:text-white 3xl:text-base 4xl:text-lg"
								>{m.offer_item_soup()}</span
							>
						</div>

						<div
							class="group/item flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold/5 3xl:gap-3 3xl:rounded-2xl 3xl:p-5 4xl:gap-4 4xl:p-7"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-inner shadow-gold/10 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:text-gold-light 3xl:h-14 3xl:w-14 4xl:h-18 4xl:w-18"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 3xl:h-7 3xl:w-7 4xl:h-9 4xl:w-9"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
									<path d="M7 2v20" />
									<path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
								</svg>
							</div>
							<span
								class="font-body text-sm font-medium text-white/90 transition-colors group-hover/item:text-white 3xl:text-base 4xl:text-lg"
								>{m.offer_item_doener()}</span
							>
						</div>

						<div
							class="group/item flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold/5 3xl:gap-3 3xl:rounded-2xl 3xl:p-5 4xl:gap-4 4xl:p-7"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-inner shadow-gold/10 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:text-gold-light 3xl:h-14 3xl:w-14 4xl:h-18 4xl:w-18"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 3xl:h-7 3xl:w-7 4xl:h-9 4xl:w-9"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M17 8h1a4 4 0 1 1 0 8h-1" />
									<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
								</svg>
							</div>
							<span
								class="font-body text-sm font-medium text-white/90 transition-colors group-hover/item:text-white 3xl:text-base 4xl:text-lg"
								>{m.offer_item_drink()}</span
							>
						</div>

						<div
							class="group/item flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold/5 3xl:gap-3 3xl:rounded-2xl 3xl:p-5 4xl:gap-4 4xl:p-7"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-inner shadow-gold/10 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:text-gold-light 3xl:h-14 3xl:w-14 4xl:h-18 4xl:w-18"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 3xl:h-7 3xl:w-7 4xl:h-9 4xl:w-9"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M12 2L8.5 9.5 2 12l6.5 2.5L12 22l3.5-7.5L22 12l-6.5-2.5L12 2Z" />
								</svg>
							</div>
							<span
								class="font-body text-sm font-medium text-white/90 transition-colors group-hover/item:text-white 3xl:text-base 4xl:text-lg"
								>{m.offer_item_baklava()}</span
							>
						</div>
					</div>
				</div>

				<div
					class="mt-6 flex items-baseline gap-2 border-t border-white/10 pt-5 3xl:mt-8 3xl:gap-3 3xl:pt-7 4xl:mt-10 4xl:pt-9"
				>
					<span class="font-display text-4xl font-bold text-gold 3xl:text-5xl 4xl:text-6xl"
						>16,00</span
					>
					<span class="font-display text-lg font-bold text-gold/70 3xl:text-xl 4xl:text-2xl">€</span
					>
				</div>
			</div>
		</div>

		<p
			class="mt-10 text-center font-display text-lg font-semibold text-white/60 italic 3xl:mt-14 3xl:text-xl 4xl:mt-20 4xl:text-2xl"
		>
			{m.offer_section_cta()}
		</p>
	</div>
</section>
