<script>
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Saraylı Döner',
				item: 'https://sarayli-doener.de'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: m.impressum_title(),
				item: 'https://sarayli-doener.de/impressum'
			}
		]
	};
</script>

<svelte:head>
	<title>{m.impressum_title()} – Saraylı Döner</title>
	<meta
		name="description"
		content={m.impressum_title() + ' – Saraylı Döner, Horster Str. 372, 45968 Gladbeck.'}
	/>
	<meta name="robots" content="noindex, nofollow" />
	<link rel="canonical" href="https://sarayli-doener.de/impressum" />
	{@html '<script type="application/ld+json">' + JSON.stringify(breadcrumbSchema) + '</script>'}
</svelte:head>

<div class="min-h-screen bg-cream px-4 py-12 font-body text-gray-900" lang={getLocale()}>
	<article class="mx-auto max-w-3xl" aria-labelledby="impressum-heading">
		<nav aria-label="Breadcrumb">
			<a
				href="/"
				class="mb-8 inline-flex items-center gap-1 font-display text-crimson hover:underline"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
						clip-rule="evenodd"
					/>
				</svg>
				{m.legal_back()}
			</a>
		</nav>

		<h1 id="impressum-heading" class="mb-10 font-display text-4xl text-crimson">
			{m.impressum_title()}
		</h1>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.impressum_legal_basis()}</h2>
			<p class="leading-relaxed">
				{@html m.impressum_legal_body().replace(/\n/g, '<br />')}
			</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.impressum_contact_title()}</h2>
			<p class="leading-relaxed">
				{@html m.impressum_contact_body().replace(/\n/g, '<br />')}
			</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.impressum_vat_title()}</h2>
			<p class="leading-relaxed">
				{@html m.impressum_vat_body().replace(/\n/g, '<br />')}
			</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.impressum_responsible_title()}</h2>
			<p class="leading-relaxed">
				{@html m.impressum_responsible_body().replace(/\n/g, '<br />')}
			</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.impressum_dispute_title()}</h2>
			<p class="mb-3 leading-relaxed">{m.impressum_dispute_body()}</p>
			<p class="mb-3">
				<a
					href="https://ec.europa.eu/consumers/odr/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-crimson underline hover:text-crimson-dark"
				>
					https://ec.europa.eu/consumers/odr/
				</a>
			</p>
			<p class="leading-relaxed">{m.impressum_dispute_note()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.impressum_consumer_title()}</h2>
			<p class="leading-relaxed">{m.impressum_consumer_body()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">
				{m.impressum_liability_content_title()}
			</h2>
			<p class="mb-3 leading-relaxed">{m.impressum_liability_content_body_1()}</p>
			<p class="leading-relaxed">{m.impressum_liability_content_body_2()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.impressum_liability_links_title()}</h2>
			<p class="mb-3 leading-relaxed">{m.impressum_liability_links_body_1()}</p>
			<p class="leading-relaxed">{m.impressum_liability_links_body_2()}</p>
		</section>

		<section>
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.impressum_copyright_title()}</h2>
			<p class="mb-3 leading-relaxed">{m.impressum_copyright_body_1()}</p>
			<p class="leading-relaxed">{m.impressum_copyright_body_2()}</p>
		</section>
	</article>
</div>
