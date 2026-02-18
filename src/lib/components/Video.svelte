<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { businessInfo } from '$lib/config';
	import { base } from '$app/paths';

	const reels = [
		{ src: `${base}/videos/reel.mp4` },
		{ src: `${base}/videos/kebab-spike-turning.mp4` }
	];

	let videoEls = $state<(HTMLVideoElement | undefined)[]>([]);
	let playingStates = $state<boolean[]>([false, false]);
	let interactedStates = $state<boolean[]>([false, false]);

	function handleHover(index: number) {
		if (!videoEls[index] || interactedStates[index]) return;
		// First hover: switch from 'none' to 'auto' so the browser starts buffering
		videoEls[index]!.preload = 'auto';
		interactedStates[index] = true;
	}

	function togglePlay(index: number) {
		if (!videoEls[index]) return;
		if (!interactedStates[index]) {
			videoEls[index]!.preload = 'auto';
			interactedStates[index] = true;
		}
		if (videoEls[index]!.paused) {
			videoEls[index]!.play();
			playingStates[index] = true;
		} else {
			videoEls[index]!.pause();
			playingStates[index] = false;
		}
	}

	function handleEnded(index: number) {
		playingStates[index] = false;
	}
</script>

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

		<div class="flex flex-col gap-6 md:flex-row md:justify-center">
			{#each reels as reel, i}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="group relative max-w-sm cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-2xl"
					onmouseenter={() => handleHover(i)}
					role="button"
					tabindex="0"
					onclick={() => togglePlay(i)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							togglePlay(i);
						}
					}}
					aria-label={playingStates[i] ? 'Pause video' : 'Play video'}
				>
					<video
						bind:this={videoEls[i]}
						src={reel.src}
						preload="metadata"
						playsinline
						onended={() => handleEnded(i)}
						class="aspect-[9/16] w-full object-cover"
					>
						<track kind="captions" />
					</video>

					{#if !playingStates[i]}
						<div
							class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300"
						>
							<div
								class="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
							>
								<svg class="ml-1 h-7 w-7 text-crimson" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z" />
								</svg>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="mt-8 text-center">
			<a
				href="https://www.instagram.com/{businessInfo.instagramHandle.replace('@', '')}/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm font-medium text-crimson transition-colors hover:text-crimson-dark"
			>
				{businessInfo.instagramHandle} on Instagram →
			</a>
		</div>
	</div>
</section>
