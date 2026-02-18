<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import SpecialOfferPopup from '$lib/components/SpecialOfferPopup.svelte';
	import FingerprintCollector from '$lib/components/FingerprintCollector.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	let { children } = $props();

	$effect(() => {
		if (!browser) return;

		function handleAnchorClick(e: MouseEvent) {
			const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
			if (!anchor) return;

			const id = anchor.getAttribute('href')?.slice(1);
			if (!id) return;

			const target = document.getElementById(id);
			if (!target) return;

			e.preventDefault();
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			history.replaceState(null, '', `#${id}`);
		}

		document.addEventListener('click', handleAnchorClick);
		return () => document.removeEventListener('click', handleAnchorClick);
	});

	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));
	const isLegalPage = $derived(
		page.url.pathname.startsWith('/impressum') || page.url.pathname.startsWith('/datenschutz')
	);
	const hideMainNav = $derived(isAdmin || isLegalPage);

	const SITE_URL = 'https://sarayli-doener.de';

	const locale = $derived(getLocale());

	// Map locale to full OG locale code
	const ogLocaleMap: Record<string, string> = {
		de: 'de_DE',
		en: 'en_US',
		tr: 'tr_TR'
	};
	const ogLocale = $derived(ogLocaleMap[locale] ?? 'de_DE');
	const ogAlternateLocales = $derived(Object.values(ogLocaleMap).filter((l) => l !== ogLocale));

	// Build canonical URL based on current locale
	const canonicalUrl = $derived(locale === 'de' ? SITE_URL : `${SITE_URL}/${locale}`);

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Restaurant',
		name: 'Saraylı Döner',
		image: `${SITE_URL}/images/food/shop-front.webp`,
		url: SITE_URL,
		telephone: '+492043376490',
		priceRange: '€',
		servesCuisine: ['Turkish', 'Kebab', 'Döner'],
		address: {
			'@type': 'PostalAddress',
			streetAddress: 'Horster Str. 372',
			addressLocality: 'Gladbeck',
			postalCode: '45968',
			addressCountry: 'DE'
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: 51.5697,
			longitude: 6.9861
		},
		openingHoursSpecification: {
			'@type': 'OpeningHoursSpecification',
			dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
			opens: '11:00',
			closes: '22:00'
		},
		aggregateRating: {
			'@type': 'AggregateRating',
			ratingValue: '4.9',
			reviewCount: '58',
			bestRating: '5'
		},
		sameAs: ['https://www.instagram.com/sarayli.doener', 'https://www.tiktok.com/@sarayli.doener'],
		menu: `${SITE_URL}/#menu`,
		hasMenu: {
			'@type': 'Menu',
			name: 'Speisekarte',
			url: `${SITE_URL}/#menu`
		},
		currenciesAccepted: 'EUR',
		paymentAccepted: 'Cash, Credit Card, Debit Card',
		foundingDate: '1992',
		founder: {
			'@type': 'Person',
			name: 'Habil'
		},
		review: [
			{
				'@type': 'Review',
				reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
				author: { '@type': 'Person', name: 'hossam Khalefa' }
			},
			{
				'@type': 'Review',
				reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
				author: { '@type': 'Person', name: 'Saliha' }
			},
			{
				'@type': 'Review',
				reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
				author: { '@type': 'Person', name: 'Betül Burulday' }
			},
			{
				'@type': 'Review',
				reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
				author: { '@type': 'Person', name: 'Elhame Kurteshi' }
			},
			{
				'@type': 'Review',
				reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
				author: { '@type': 'Person', name: 'Ammar' }
			}
		]
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href="/images/logo.webp" />
	<link rel="manifest" href="/site.webmanifest" />
	<link rel="canonical" href={canonicalUrl} />

	<link rel="alternate" hreflang="de" href={SITE_URL} />
	<link rel="alternate" hreflang="en" href={`${SITE_URL}/en`} />
	<link rel="alternate" hreflang="tr" href={`${SITE_URL}/tr`} />
	<link rel="alternate" hreflang="x-default" href={SITE_URL} />

	<title>{m.seo_title()}</title>
	<meta name="description" content={m.seo_description()} />
	<meta
		name="keywords"
		content="Döner, Kebab, Gladbeck, Halal, Kalbfleisch, türkisch, Restaurant, Imbiss, Saraylı"
	/>
	<meta name="author" content="Saraylı Döner" />
	<meta name="theme-color" content="#8B1A1A" />
	<meta name="color-scheme" content="light" />

	<meta name="geo.region" content="DE-NW" />
	<meta name="geo.placename" content="Gladbeck" />
	<meta name="geo.position" content="51.5697;6.9861" />
	<meta name="ICBM" content="51.5697, 6.9861" />

	<meta property="og:title" content={m.seo_og_title()} />
	<meta property="og:description" content={m.seo_og_description()} />
	<meta property="og:image" content={`${SITE_URL}/images/food/shop-front.webp`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:type" content="restaurant" />
	<meta property="og:locale" content={ogLocale} />
	{#each ogAlternateLocales as altLocale}
		<meta property="og:locale:alternate" content={altLocale} />
	{/each}
	<meta property="og:site_name" content="Saraylı Döner" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={m.seo_og_title()} />
	<meta name="twitter:description" content={m.seo_twitter_description()} />
	<meta name="twitter:image" content={`${SITE_URL}/images/food/shop-front.webp`} />

	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<a
	href="#menu"
	class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-crimson focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
>
	Skip to content
</a>

{#if !hideMainNav}
	<Header />
{/if}
<main id="main">
	{@render children()}
</main>
{#if !isAdmin}
	<CookieBanner />
	<SpecialOfferPopup />
	<FingerprintCollector />
{/if}
