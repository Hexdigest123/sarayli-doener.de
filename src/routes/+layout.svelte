<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import { getLocale } from '$lib/paraglide/runtime';

	let { children } = $props();

	const SITE_URL = 'https://sarayli-doener.de';

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Restaurant',
		name: 'Saraylı Döner',
		image: `${SITE_URL}/images/food/shop-front.jpg`,
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
		sameAs: ['https://www.instagram.com/sarayli.doener', 'https://www.tiktok.com/@sarayli.doener']
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="canonical" href={SITE_URL} />

	<title>Saraylı Döner – 100% Selbstgemachter Döner in Gladbeck</title>
	<meta
		name="description"
		content="Saraylı Döner – Seit 33 Jahren 100% selbstgemachter Döner aus reinem Halal-Kalbfleisch in Gladbeck. Horster Str. 372, täglich 11–22 Uhr."
	/>
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

	<meta property="og:title" content="Saraylı Döner – 100% Selbstgemacht" />
	<meta
		property="og:description"
		content="33 Jahre Erfahrung. 100% Halal-Kalbfleisch. Horster Str. 372, 45968 Gladbeck."
	/>
	<meta property="og:image" content="{SITE_URL}/images/food/shop-front.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:type" content="restaurant" />
	<meta property="og:locale" content={getLocale()} />
	<meta property="og:locale:alternate" content="de" />
	<meta property="og:locale:alternate" content="en" />
	<meta property="og:locale:alternate" content="tr" />
	<meta property="og:site_name" content="Saraylı Döner" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Saraylı Döner – 100% Selbstgemacht" />
	<meta
		name="twitter:description"
		content="33 Jahre Erfahrung. 100% Halal-Kalbfleisch. Gladbeck."
	/>
	<meta name="twitter:image" content="{SITE_URL}/images/food/shop-front.jpg" />

	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

<a
	href="#menu"
	class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-crimson focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
>
	Skip to content
</a>

<Header />
<main id="main">
	{@render children()}
</main>
