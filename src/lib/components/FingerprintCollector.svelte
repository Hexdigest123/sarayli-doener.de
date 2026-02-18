<script lang="ts">
	import { browser } from '$app/environment';

	const COOKIE_NAME = '_vfp';
	const MAX_AGE = 60 * 60 * 24 * 365;

	function getCookie(name: string): string | null {
		if (!browser) return null;
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return match ? match[2] : null;
	}

	function collectAndStore() {
		if (getCookie(COOKIE_NAME)) return;
		if (getCookie('tracking_consent') !== 'granted') return;

		const signals = {
			sw: screen.width,
			sh: screen.height,
			tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
			pl: navigator.platform,
			lang: navigator.language,
			cd: screen.colorDepth,
			dpr: window.devicePixelRatio,
			tp: navigator.maxTouchPoints,
			hc: navigator.hardwareConcurrency
		};

		document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(signals))};path=/;max-age=${MAX_AGE};SameSite=Lax`;
	}

	$effect(() => {
		if (!browser) return;

		collectAndStore();

		function onConsentResolved() {
			collectAndStore();
		}

		window.addEventListener('cookie-consent-resolved', onConsentResolved);
		return () => window.removeEventListener('cookie-consent-resolved', onConsentResolved);
	});
</script>
