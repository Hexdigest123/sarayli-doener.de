<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { reviews, businessInfo } from '$lib/config';

	let activeIndex = $state(0);
	let paused = $state(false);

	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let touchDeltaX = $state(0);
	let isSwiping = $state(false);

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
				goTo((activeIndex + 1) % displayReviews.length);
			} else {
				goTo((activeIndex - 1 + displayReviews.length) % displayReviews.length);
			}
		}
		touchDeltaX = 0;
		isSwiping = false;
	}

	// Build a lookup of all message functions for dynamic key access
	const msg: Record<string, () => string> = {};
	for (const [key, fn] of Object.entries(m)) {
		if (typeof fn === 'function') {
			msg[key] = fn as () => string;
		}
	}

	const displayReviews = reviews.slice(0, 5);

	$effect(() => {
		if (paused) return;
		const interval = setInterval(() => {
			activeIndex = (activeIndex + 1) % displayReviews.length;
		}, 5000);
		return () => clearInterval(interval);
	});

	function goTo(index: number) {
		activeIndex = index;
		paused = true;
		setTimeout(() => {
			paused = false;
		}, 8000);
	}
</script>

<section id="reviews" class="overflow-hidden bg-gray-50 py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="mb-4 font-display text-3xl font-bold text-gray-900 md:text-4xl">
				{m.reviews_title()}
			</h2>
			<div class="mx-auto mb-6 h-1 w-24 bg-gold"></div>
			<p class="mx-auto max-w-2xl text-gray-600">
				{m.reviews_subtitle({
					rating: String(businessInfo.googleRating),
					count: String(businessInfo.googleReviewCount)
				})}
			</p>
		</div>

		<div class="mb-12 flex justify-center">
			<a
				href={businessInfo.googleMapsUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-md transition-shadow duration-300 hover:shadow-lg"
			>
				<div class="flex h-8 w-8 items-center justify-center">
					<svg viewBox="0 0 24 24" class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							fill="#4285F4"
						/>
						<path
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							fill="#34A853"
						/>
						<path
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							fill="#FBBC05"
						/>
						<path
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							fill="#EA4335"
						/>
					</svg>
				</div>
				<div class="flex flex-col">
					<div class="flex items-center gap-2">
						<span class="text-2xl font-bold text-gray-900">{businessInfo.googleRating}</span>
						<div class="flex text-gold">
							{#each Array(4) as _}
								<svg class="h-5 w-5 fill-current" viewBox="0 0 24 24">
									<path
										d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
									/>
								</svg>
							{/each}
							<svg class="h-5 w-5" viewBox="0 0 24 24">
								<defs>
									<linearGradient id="star-90">
										<stop offset="90%" stop-color="currentColor" />
										<stop offset="90%" stop-color="#E5E7EB" />
									</linearGradient>
								</defs>
								<path
									fill="url(#star-90)"
									d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
								/>
							</svg>
						</div>
					</div>
					<span class="text-xs text-gray-500"
						>{businessInfo.googleReviewCount} {m.reviews_count_label()}</span
					>
				</div>
			</a>
		</div>

		<div class="relative mx-auto max-w-xl">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="relative min-h-[280px] touch-pan-y overflow-hidden"
				ontouchstart={handleTouchStart}
				ontouchmove={handleTouchMove}
				ontouchend={handleTouchEnd}
			>
				{#each displayReviews as review, i}
					<div
						class="absolute inset-0 flex items-center justify-center {isSwiping
							? ''
							: 'transition-all duration-700 ease-in-out'}"
						class:opacity-100={i === activeIndex}
						class:opacity-0={i !== activeIndex}
						class:translate-x-0={i === activeIndex && !isSwiping}
						class:translate-x-8={i > activeIndex && !isSwiping}
						class:-translate-x-8={i < activeIndex && !isSwiping}
						style={i === activeIndex && isSwiping
							? `transform: translateX(${touchDeltaX}px); opacity: 1;`
							: ''}
						aria-hidden={i !== activeIndex}
					>
						<div class="w-full rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
							<div class="mb-5 flex items-center gap-3">
								<div
									class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-crimson text-base font-bold text-white"
								>
									{review.name.charAt(0)}
								</div>
								<div>
									<div class="font-medium text-gray-900">{review.name}</div>
									<div class="flex text-lg text-gold">
										{#each Array(5) as _}
											<span>★</span>
										{/each}
									</div>
								</div>
							</div>
							<blockquote class="mb-4 leading-relaxed text-gray-600 italic">
								"{msg[review.textKey]?.() ?? review.textKey}"
							</blockquote>
							<div class="flex items-center gap-1 text-xs text-gray-400">
								<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"
									><path
										d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.76-1.82 3.12-3.88 3.12-2.55 0-4.63-2.07-4.63-4.63s2.07-4.63 4.63-4.63c1.1 0 2.1.4 2.89 1.11l1.92-1.92C18.45 5.63 16.95 5 15.3 5 11.27 5 8 8.27 8 12.3s3.27 7.3 7.3 7.3c4.2 0 7-2.95 7-7.12 0-.53-.05-1.05-.15-1.53z"
									/></svg
								>
								Google Review
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-6 flex items-center justify-center">
				{#each displayReviews as _, i}
					<button
						onclick={() => goTo(i)}
						class="flex min-h-[44px] min-w-[44px] items-center justify-center focus:outline-none"
						aria-label="Go to review {i + 1}"
					>
						<span
							class="block h-2.5 rounded-full transition-all duration-300 {i === activeIndex
								? 'w-8 bg-crimson'
								: 'w-2.5 bg-gray-300 hover:bg-gray-400'}"
						></span>
					</button>
				{/each}
			</div>
		</div>

		<div class="mt-8 flex flex-col items-center gap-4">
			<a
				href={businessInfo.googleMapsUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson-dark hover:shadow-lg"
			>
				<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
					/>
				</svg>
				{m.reviews_write_cta()}
			</a>
			<a
				href={businessInfo.googleMapsUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm font-medium text-crimson underline decoration-2 underline-offset-4 transition-colors hover:text-crimson-dark"
			>
				{m.reviews_on_google()}
			</a>
		</div>
	</div>
</section>
