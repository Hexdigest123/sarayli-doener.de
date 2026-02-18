<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { fade, scale } from 'svelte/transition';
	import { onDestroy } from 'svelte';

	let lightboxOpen = $state(false);
	let activeImage = $state('');
	let activeAlt = $state('');

	// Carousel state
	let currentIndex = $state(0);
	let itemsPerPage = $state(3);
	let innerWidth = $state(0);
	let isHovering = $state(false);
	let autoplayInterval: ReturnType<typeof setInterval> | null = null;

	const images = [
		{
			src: '/images/food/shop-front.webp',
			alt: 'Saraylı Döner Laden'
		},
		{
			src: '/images/kebab-plate-large.webp',
			alt: 'Döner Teller'
		},
		{
			src: '/images/food/food-1.webp',
			alt: 'Getränke Auswahl'
		},
		{
			src: '/images/kebab-small.webp',
			alt: 'Döner Tasche'
		},
		{
			src: '/images/habil.webp',
			alt: 'Habil – Inhaber von Saraylı Döner'
		},
		{
			src: '/images/kebab-fries.webp',
			alt: 'Pom-Döner mit Pommes'
		},
		{
			src: '/images/food/food-2.webp',
			alt: 'Frisches Kalbfleisch'
		},
		{
			src: '/images/kebab-pike.webp',
			alt: 'Döner am Spieß'
		},
		{
			src: '/images/kebab-small-prep.webp',
			alt: 'Döner Zubereitung'
		}
	];

	// Derived state
	let maxIndex = $derived(Math.max(0, images.length - itemsPerPage));
	let progress = $derived((currentIndex / maxIndex) * 100);

	function updateItemsPerPage() {
		// Match md breakpoint (768px)
		itemsPerPage = innerWidth < 768 ? 1 : 3;
	}

	$effect(() => {
		updateItemsPerPage();
		// Clamp index if we resize and the current index is out of bounds
		if (currentIndex > maxIndex) {
			currentIndex = maxIndex;
		}
	});

	// Autoplay: slide every 3s, pause on hover or when lightbox is open
	function startAutoplay() {
		stopAutoplay();
		autoplayInterval = setInterval(() => {
			if (isHovering || lightboxOpen) return;
			if (currentIndex < maxIndex) {
				currentIndex += 1;
			} else {
				currentIndex = 0;
			}
		}, 3000);
	}

	function stopAutoplay() {
		if (autoplayInterval) {
			clearInterval(autoplayInterval);
			autoplayInterval = null;
		}
	}

	$effect(() => {
		startAutoplay();
		return () => stopAutoplay();
	});

	onDestroy(() => stopAutoplay());

	function nextSlide() {
		if (currentIndex < maxIndex) {
			currentIndex += 1;
		}
	}

	function prevSlide() {
		if (currentIndex > 0) {
			currentIndex -= 1;
		}
	}

	function goToSlide(index: number) {
		currentIndex = Math.min(Math.max(0, index), maxIndex);
	}

	function openLightbox(img: { src: string; alt: string }) {
		activeImage = img.src;
		activeAlt = img.alt;
		lightboxOpen = true;
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		lightboxOpen = false;
		document.body.style.overflow = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (lightboxOpen) {
			if (e.key === 'Escape') closeLightbox();
			return;
		}

		// Carousel navigation if lightbox is closed
		if (e.key === 'ArrowRight') nextSlide();
		if (e.key === 'ArrowLeft') prevSlide();
	}
</script>

<svelte:window onkeydown={handleKeydown} bind:innerWidth />

<section id="gallery" class="bg-white py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="text-center">
			<h2 class="font-display text-3xl font-bold text-crimson md:text-4xl">
				{m.gallery_title()}
			</h2>
			<div class="mx-auto mt-4 mb-8 h-1 w-24 rounded-full bg-gold"></div>
		</div>

		<!-- Carousel Container -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="group relative mx-auto mt-12 max-w-6xl overflow-x-clip"
			onmouseenter={() => (isHovering = true)}
			onmouseleave={() => (isHovering = false)}
		>
			<!-- Viewport -->
			<div class="-mx-2 overflow-hidden px-2 py-4">
				<div
					class="flex transition-transform duration-500 ease-out will-change-transform"
					style="transform: translateX(calc(-{currentIndex} * (100% / {itemsPerPage})))"
				>
					{#each images as img, i}
						<div
							class="flex-shrink-0 px-2 transition-all duration-500"
							style="width: calc(100% / {itemsPerPage})"
						>
							<button
								class="group/card relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-xl focus:ring-4 focus:ring-gold/50 focus:outline-none"
								onclick={() => openLightbox(img)}
								aria-label="View larger image"
								tabindex={i >= currentIndex && i < currentIndex + itemsPerPage ? 0 : -1}
							>
								<img
									src={img.src}
									alt={img.alt}
									loading="lazy"
									class="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
								/>
								<div
									class="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/card:bg-black/20"
								></div>
								<div
									class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
								>
									<div class="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="text-crimson"
										>
											<circle cx="11" cy="11" r="8"></circle>
											<path d="m21 21-4.3-4.3"></path>
										</svg>
									</div>
								</div>
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- Navigation Arrows -->
			{#if currentIndex > 0}
				<button
					class="absolute top-1/2 left-0 z-10 flex h-12 w-12 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-crimson shadow-lg backdrop-blur-sm transition-all hover:bg-crimson hover:text-white focus:ring-2 focus:ring-gold focus:outline-none md:-translate-x-12"
					onclick={prevSlide}
					aria-label="Previous images"
					transition:fade={{ duration: 200 }}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m15 18-6-6 6-6" />
					</svg>
				</button>
			{/if}

			{#if currentIndex < maxIndex}
				<button
					class="absolute top-1/2 right-0 z-10 flex h-12 w-12 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-crimson shadow-lg backdrop-blur-sm transition-all hover:bg-crimson hover:text-white focus:ring-2 focus:ring-gold focus:outline-none md:translate-x-12"
					onclick={nextSlide}
					aria-label="Next images"
					transition:fade={{ duration: 200 }}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m9 18 6-6-6-6" />
					</svg>
				</button>
			{/if}

			<!-- Dots Indicator -->
			<div class="mt-8 flex justify-center">
				{#each Array(maxIndex + 1) as _, i}
					<button
						class="flex min-h-[44px] min-w-[44px] items-center justify-center focus:outline-none"
						onclick={() => goToSlide(i)}
						aria-label="Go to slide {i + 1}"
					>
						<span
							class="block h-2 rounded-full transition-all duration-300 {i === currentIndex
								? 'w-8 bg-crimson'
								: 'w-2 bg-gray-300 hover:bg-crimson/50'}"
						></span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if lightboxOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
			transition:fade={{ duration: 200 }}
			onclick={closeLightbox}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<button
				class="absolute top-4 right-4 rounded-full bg-black/20 p-2 text-white transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white focus:outline-none"
				onclick={(e) => {
					e.stopPropagation();
					closeLightbox();
				}}
				aria-label="Close gallery"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>

			<!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
			<img
				src={activeImage}
				alt={activeAlt}
				class="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
				transition:scale={{ start: 0.9, duration: 300, opacity: 0 }}
				onclick={(e) => e.stopPropagation()}
			/>
		</div>
	{/if}
</section>
