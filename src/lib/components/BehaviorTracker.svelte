<script lang="ts">
	import { browser } from '$app/environment';

	type BehaviorEvent = {
		type: 'scroll_depth' | 'click';
		page: string;
		metadata: Record<string, unknown>;
	};

	const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;

	let consentGranted = $state(false);
	let queue: Array<BehaviorEvent> = [];
	let flushTimer: ReturnType<typeof setTimeout> | null = null;
	let maxPercent = 0;
	let firedThresholds = new Set<number>();
	let scrollRafId: number | null = null;
	let trackingActive = false;

	function hasTrackingConsent() {
		if (!browser) return false;
		return document.cookie.match(new RegExp('(^| )tracking_consent=([^;]+)'))?.[2] === 'granted';
	}

	function clearFlushTimer() {
		if (!flushTimer) return;
		clearTimeout(flushTimer);
		flushTimer = null;
	}

	function scheduleFlush() {
		if (flushTimer || queue.length === 0) return;
		flushTimer = setTimeout(() => {
			void flushWithFetch();
		}, 5000);
	}

	async function flushWithFetch() {
		if (!browser || !consentGranted || queue.length === 0) return;
		const events = queue.splice(0, queue.length);
		clearFlushTimer();

		try {
			await fetch('/api/events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ events }),
				keepalive: true
			});
		} catch {}
	}

	function flushWithBeacon() {
		if (!browser || !consentGranted || queue.length === 0) return;
		const events = queue.splice(0, queue.length);
		clearFlushTimer();

		navigator.sendBeacon(
			'/api/events',
			new Blob([JSON.stringify({ events })], { type: 'application/json' })
		);
	}

	function enqueueEvent(event: BehaviorEvent) {
		if (!consentGranted) return;
		queue.push(event);

		if (queue.length >= 5) {
			void flushWithFetch();
			return;
		}

		scheduleFlush();
	}

	function trackScrollDepth() {
		const percent = Math.round(
			((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
		);
		if (!Number.isFinite(percent)) return;

		maxPercent = Math.max(maxPercent, percent);

		for (const threshold of SCROLL_THRESHOLDS) {
			if (maxPercent < threshold || firedThresholds.has(threshold)) continue;

			firedThresholds.add(threshold);
			enqueueEvent({
				type: 'scroll_depth',
				page: window.location.pathname,
				metadata: { threshold, maxPercent }
			});
		}
	}

	function onScroll() {
		if (scrollRafId !== null) return;
		scrollRafId = requestAnimationFrame(() => {
			scrollRafId = null;
			trackScrollDepth();
		});
	}

	function onDocumentClick(event: MouseEvent) {
		const origin = event.target;
		if (!(origin instanceof Element)) return;

		const element = origin.closest('a[href], button, [role="button"]');
		if (!(element instanceof HTMLElement)) return;

		const text = element.textContent?.trim().slice(0, 100) ?? '';
		const href = element.getAttribute('href');
		if (!text && !href) return;

		enqueueEvent({
			type: 'click',
			page: window.location.pathname,
			metadata: {
				tag: element.tagName,
				text,
				href,
				x: event.clientX,
				y: event.clientY
			}
		});
	}

	function onVisibilityChange() {
		if (document.visibilityState !== 'hidden') return;
		flushWithBeacon();
	}

	function startTracking() {
		if (trackingActive) return;
		trackingActive = true;

		document.addEventListener('click', onDocumentClick);
		window.addEventListener('scroll', onScroll, { passive: true });
		document.addEventListener('visibilitychange', onVisibilityChange);
		trackScrollDepth();
	}

	function stopTracking() {
		if (!trackingActive) return;
		trackingActive = false;

		document.removeEventListener('click', onDocumentClick);
		window.removeEventListener('scroll', onScroll);
		document.removeEventListener('visibilitychange', onVisibilityChange);

		if (scrollRafId !== null) {
			cancelAnimationFrame(scrollRafId);
			scrollRafId = null;
		}

		clearFlushTimer();
	}

	$effect(() => {
		if (!browser) return;

		consentGranted = hasTrackingConsent();

		function onConsentResolved() {
			consentGranted = hasTrackingConsent();
		}

		window.addEventListener('cookie-consent-resolved', onConsentResolved);

		return () => {
			window.removeEventListener('cookie-consent-resolved', onConsentResolved);
		};
	});

	$effect(() => {
		if (!browser || !consentGranted) {
			stopTracking();
			return;
		}

		startTracking();

		return () => {
			stopTracking();
		};
	});
</script>
