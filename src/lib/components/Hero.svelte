<script>
	import * as m from '$lib/paraglide/messages';
	import { base } from '$app/paths';
</script>

<section
	id="hero"
	class="bg-cream-light relative flex min-h-[85vh] items-center overflow-hidden py-16 pt-24"
>
	<!-- Background Image with Overlay -->
	<div class="absolute inset-0 z-0">
		<img
			src="{base}/images/food/shop-front.webp"
			alt="Sarayli Döner Shop Front"
			class="h-full w-full object-cover object-center"
		/>
		<!-- Gradient Overlay: White/Cream to Transparent -->
		<div class="absolute inset-0 bg-gradient-to-r from-white/80 via-cream/50 to-transparent"></div>
		<div
			class="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 via-40% to-transparent to-75%"
		></div>
		<!-- Stronger overlay on mobile for text readability -->
		<div class="absolute inset-0 bg-white/40 md:hidden"></div>
	</div>

	<!-- Content Container -->
	<div class="relative z-10 container mx-auto grid h-full items-center gap-12 px-4 md:grid-cols-2">
		<div class="animate-fade-in-up flex max-w-2xl flex-col items-start space-y-8">
			<!-- Logo -->
			<div class="mb-4">
				<img
					src="{base}/images/logo.webp"
					alt="Sarayli Döner Logo"
					class="h-auto w-48 drop-shadow-sm md:w-64"
				/>
			</div>

			<!-- Text Content -->
			<div class="space-y-4">
				<h1
					class="font-display text-3xl leading-tight font-bold tracking-tight text-crimson md:text-5xl lg:text-7xl"
				>
					{m.hero_title()}
				</h1>
				<p class="max-w-lg text-lg leading-relaxed font-medium text-gray-700 md:text-xl">
					{m.hero_subtitle()}
				</p>
			</div>

			<!-- USP Badges -->
			<div class="flex flex-wrap gap-3">
				<!-- Badge 1: Homemade -->
				<div
					class="flex cursor-default items-center gap-2 rounded-xl border border-gold/40 bg-white/80 px-4 py-2 text-sm font-bold text-crimson-dark shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-gold-dark"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
						<path d="M7 2v20" />
						<path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
					</svg>
					<span>{m.usp_homemade()}</span>
				</div>

				<!-- Badge 2: Halal -->
				<div
					class="flex cursor-default items-center gap-2 rounded-xl border border-gold/40 bg-white/80 px-4 py-2 text-sm font-bold text-crimson-dark shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md"
				>
					<span class="font-serif text-lg leading-none text-gold-dark">حلال</span>
					<span>{m.usp_halal()}</span>
				</div>

				<!-- Badge 3: Experience -->
				<div
					class="flex cursor-default items-center gap-2 rounded-xl border border-gold/40 bg-white/80 px-4 py-2 text-sm font-bold text-crimson-dark shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-gold-dark"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<polyline points="12 6 12 12 16 14" />
					</svg>
					<span>{m.usp_experience()}</span>
				</div>
			</div>

			<!-- CTA Button -->
			<div class="pt-4">
				<a
					href="#menu"
					class="group inline-flex items-center gap-3 rounded-full bg-crimson px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-crimson-dark hover:shadow-crimson/30 active:translate-y-0"
				>
					<span>{m.hero_cta()}</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 transition-transform group-hover:translate-y-1"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 14l-7 7m0 0l-7-7m7 7V3"
						/>
					</svg>
				</a>
			</div>
		</div>
	</div>
</section>
