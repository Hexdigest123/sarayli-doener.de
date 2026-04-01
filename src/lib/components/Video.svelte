<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { businessInfo } from '$lib/config';
	import { base } from '$app/paths';
	import { onDestroy } from 'svelte';

	const SITE_URL = 'https://sarayli-doener.de';

	const reels = [
		{ src: `${base}/videos/reel.mp4`, name: 'Saraylı Döner – Frische Döner-Zubereitung' },
		{ src: `${base}/videos/kebab-spike-turning.mp4`, name: 'Saraylı Döner – Döner am Spieß' },
		{ src: `${base}/videos/spiess-video.mp4`, name: 'Saraylı Döner – Frischer Döner-Spieß' },
		{ src: `${base}/videos/spiess-video-2.mp4`, name: 'Saraylı Döner – Döner-Spieß Nahaufnahme' }
	];

	const videoSchema = reels.map((reel, i) => ({
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name: reel.name,
		description: `${businessInfo.name} – 100% selbstgemachter Döner aus reinem Halal-Kalbfleisch in Gladbeck`,
		contentUrl: `${SITE_URL}${reel.src.replace(base, '')}`,
		thumbnailUrl: `${SITE_URL}/images/food/shop-front.webp`,
		uploadDate: '2026-02-18'
	}));

	let videoEls = $state<(HTMLVideoElement | undefined)[]>([]);
	let playingStates = $state<boolean[]>(reels.map(() => false));
	let interactedStates = $state<boolean[]>(reels.map(() => false));
	let currentIndex = $state(0);
	let itemsPerPage = $state(2);
	let innerWidth = $state(0);

	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let touchDeltaX = $state(0);
	let isSwiping = $state(false);

	let maxIndex = $derived(Math.max(0, reels.length - itemsPerPage));

	function updateItemsPerPage() {
		itemsPerPage = innerWidth < 768 ? 1 : 2;
	}

	$effect(() => {
		updateItemsPerPage();
		if (currentIndex > maxIndex) {
			currentIndex = maxIndex;
		}
	});

	function pauseAllVideos(exceptIndex?: number) {
		videoEls.forEach((videoEl, index) => {
			if (!videoEl || index === exceptIndex) return;
			videoEl.pause();
			playingStates[index] = false;
		});
	}

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		touchDeltaX = 0;
		isSwiping = false;
	}

	function handleTouchMove(e: TouchEvent) {
		const dx = e.touches[0].clientX - touchStartX;
		const dy = e.touches[0].clientY - touchStartY;

		if (!isSwiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
			isSwiping = true;
		}

		if (isSwiping) {
			e.preventDefault();
			touchDeltaX = dx;
		}
	}

	function handleTouchEnd() {
		if (Math.abs(touchDeltaX) > 50) {
			if (touchDeltaX < 0) {
				nextSlide();
			} else {
				prevSlide();
			}
		}
		touchDeltaX = 0;
		isSwiping = false;
	}

	function nextSlide() {
		pauseAllVideos();
		currentIndex = (currentIndex + 1) % (maxIndex + 1);
	}

	function prevSlide() {
		pauseAllVideos();
		currentIndex = (currentIndex - 1 + maxIndex + 1) % (maxIndex + 1);
	}

	function goToSlide(index: number) {
		pauseAllVideos();
		currentIndex = Math.min(Math.max(0, index), maxIndex);
	}

	function handleHover(index: number) {
		if (!videoEls[index] || interactedStates[index]) return;
		// Start buffering on first real interaction, not for the whole strip.
		videoEls[index]!.preload = 'auto';
		interactedStates[index] = true;
	}

	async function togglePlay(index: number) {
		if (!videoEls[index]) return;
		if (!interactedStates[index]) {
			videoEls[index]!.preload = 'auto';
			interactedStates[index] = true;
		}
		if (videoEls[index]!.paused) {
			pauseAllVideos(index);
			try {
				await videoEls[index]!.play();
				playingStates[index] = true;
			} catch {
				playingStates[index] = false;
			}
		} else {
			videoEls[index]!.pause();
			playingStates[index] = false;
		}
	}

	function handleEnded(index: number) {
		playingStates[index] = false;
	}

	function handlePlay(index: number) {
		pauseAllVideos(index);
		playingStates[index] = true;
	}

	function handlePause(index: number) {
		playingStates[index] = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') nextSlide();
		if (e.key === 'ArrowLeft') prevSlide();
	}

	onDestroy(() => pauseAllVideos());
</script>

<svelte:window bind:innerWidth onkeydown={handleKeydown} />

<svelte:head>
	{#each videoSchema as schema}
		{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
	{/each}
</svelte:head>

<section id="video" class="bg-white py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="font-display text-3xl font-bold text-gray-900 md:text-4xl">
				{m.video_title()}
			</h2>
			<div
				class="mx-auto mt-4 h-1 w-16 bg-gradient-to-r from-transparent via-gold to-transparent"
			></div>
		</div>

		<div class="mx-auto max-w-5xl">
			<div class="group relative">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="-mx-2 touch-pan-y overflow-hidden px-2 py-4"
					ontouchstart={handleTouchStart}
					ontouchmove={handleTouchMove}
					ontouchend={handleTouchEnd}
				>
					<div
						class="flex will-change-transform {isSwiping
							? ''
							: 'transition-transform duration-500 ease-out'}"
						style="transform: translateX(calc(-{currentIndex} * (100% / {itemsPerPage}) + {touchDeltaX}px))"
					>
						{#each reels as reel, i}
							<div class="flex-shrink-0 px-2" style="width: calc(100% / {itemsPerPage})">
								<button
									type="button"
									class="group/card block w-full rounded-2xl text-left focus:ring-4 focus:ring-gold/40 focus:outline-none"
									onmouseenter={() => handleHover(i)}
									onclick={() => togglePlay(i)}
									aria-label={playingStates[i]
										? `Pause video: ${reel.name}`
										: `Play video: ${reel.name}`}
								>
									<div
										class="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-lg transition-all duration-300 group-hover/card:shadow-2xl"
									>
										<video
											bind:this={videoEls[i]}
											src="{reel.src}#t=0.001"
											preload="metadata"
											playsinline
											muted
											onended={() => handleEnded(i)}
											onplay={() => handlePlay(i)}
											onpause={() => handlePause(i)}
											class="absolute inset-0 h-full w-full object-cover"
										>
											<track kind="captions" />
										</video>

										{#if !playingStates[i]}
											<div
												class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300"
											>
												<div
													class="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover/card:scale-110"
												>
													<svg
														class="ml-0.5 h-7 w-7 text-crimson"
														fill="currentColor"
														viewBox="0 0 24 24"
													>
														<path d="M8 5v14l11-7z" />
													</svg>
												</div>
											</div>
										{/if}
									</div>
								</button>
							</div>
						{/each}
					</div>
				</div>

				{#if reels.length > itemsPerPage}
					<button
						class="absolute top-1/2 left-0 z-10 hidden h-12 w-12 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-crimson shadow-lg backdrop-blur-sm transition-all hover:bg-crimson hover:text-white focus:ring-2 focus:ring-gold focus:outline-none md:flex md:-translate-x-6"
						onclick={prevSlide}
						aria-label="Previous videos"
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

					<button
						class="absolute top-1/2 right-0 z-10 hidden h-12 w-12 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-crimson shadow-lg backdrop-blur-sm transition-all hover:bg-crimson hover:text-white focus:ring-2 focus:ring-gold focus:outline-none md:flex md:translate-x-6"
						onclick={nextSlide}
						aria-label="Next videos"
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

					<div class="mt-6 flex justify-center">
						{#each Array(maxIndex + 1) as _, i}
							<button
								class="flex min-h-[44px] min-w-[44px] items-center justify-center focus:outline-none"
								onclick={() => goToSlide(i)}
								aria-label="Go to video slide {i + 1}"
							>
								<span
									class="block h-2 rounded-full transition-all duration-300 {i === currentIndex
										? 'w-8 bg-crimson'
										: 'w-2 bg-gray-300 hover:bg-crimson/50'}"
								></span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="mt-8 flex flex-col items-center gap-2">
			<a
				href="https://www.instagram.com/{businessInfo.instagramHandle.replace('@', '')}/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm font-medium text-crimson transition-colors hover:text-crimson-dark"
			>
				{businessInfo.instagramHandle} on Instagram →
			</a>
			<a
				href={businessInfo.tiktokUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm font-medium text-crimson transition-colors hover:text-crimson-dark"
			>
				{businessInfo.tiktokHandle} on TikTok →
			</a>
		</div>
	</div>
</section>
