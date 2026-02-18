<script lang="ts">
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
				name: m.datenschutz_title(),
				item: 'https://sarayli-doener.de/datenschutz'
			}
		]
	};
</script>

<svelte:head>
	<title>{m.datenschutz_title()} – Saraylı Döner</title>
	<meta name="description" content={m.datenschutz_title() + ' – Saraylı Döner'} />
	<meta name="robots" content="noindex, nofollow" />
	<link rel="canonical" href="https://sarayli-doener.de/datenschutz" />
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<div class="min-h-screen bg-cream px-4 py-12 font-body text-gray-900" lang={getLocale()}>
	<article class="mx-auto max-w-3xl" aria-labelledby="datenschutz-heading">
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

		<h1 id="datenschutz-heading" class="mb-8 font-display text-4xl text-crimson">
			{m.datenschutz_title()}
		</h1>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.datenschutz_s1_title()}</h2>
			<p class="mb-2">
				{m.datenschutz_s1_intro()}
			</p>
			<p class="mb-2">{@html m.datenschutz_s1_address().replace(/\n/g, '<br />')}</p>
			<p class="mb-2">{m.datenschutz_s1_phone()}</p>
			<p>{m.datenschutz_s1_email()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.datenschutz_s2_title()}</h2>
			<p class="mb-4">{m.datenschutz_s2_body_1()}</p>
			<p>{m.datenschutz_s2_body_2()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.datenschutz_s3_title()}</h2>
			<p class="mb-4">{m.datenschutz_s3_body_1()}</p>
			<ul class="mb-4 list-disc space-y-1 pl-6">
				<li>{m.datenschutz_s3_list_ip()}</li>
				<li>{m.datenschutz_s3_list_browser()}</li>
				<li>{m.datenschutz_s3_list_os()}</li>
				<li>{m.datenschutz_s3_list_referrer()}</li>
				<li>{m.datenschutz_s3_list_timestamp()}</li>
			</ul>
			<p>{m.datenschutz_s3_body_2()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.datenschutz_s4_title()}</h2>
			<p class="mb-4">{m.datenschutz_s4_body_1()}</p>
			<p class="mb-4">{m.datenschutz_s4_body_2()}</p>
			<p>{m.datenschutz_s4_body_3()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.datenschutz_s5_title()}</h2>
			<p class="mb-4">{m.datenschutz_s5_body_1()}</p>
			<ul class="mb-4 list-disc space-y-1 pl-6">
				<li>{m.datenschutz_s5_list_ip()}</li>
				<li>{m.datenschutz_s5_list_ua()}</li>
				<li>{m.datenschutz_s5_list_referrer()}</li>
				<li>{m.datenschutz_s5_list_page()}</li>
				<li>{m.datenschutz_s5_list_utm()}</li>
				<li>{m.datenschutz_s5_list_locale()}</li>
				<li>{m.datenschutz_s5_list_accept_lang()}</li>
				<li>{m.datenschutz_s5_list_screen()}</li>
				<li>{m.datenschutz_s5_list_timezone()}</li>
				<li>{m.datenschutz_s5_list_platform()}</li>
				<li>{m.datenschutz_s5_list_colordepth()}</li>
				<li>{m.datenschutz_s5_list_dpr()}</li>
				<li>{m.datenschutz_s5_list_touch()}</li>
				<li>{m.datenschutz_s5_list_cores()}</li>
				<li>{m.datenschutz_s5_list_timestamp()}</li>
			</ul>
			<p class="mb-4">{m.datenschutz_s5_body_fingerprint()}</p>
			<p class="mb-4">{m.datenschutz_s5_body_2()}</p>
			<p class="mb-4">{m.datenschutz_s5_body_3()}</p>
			<p>{m.datenschutz_s5_body_4()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.datenschutz_s6_title()}</h2>
			<p>{m.datenschutz_s6_body()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.datenschutz_s7_title()}</h2>
			<p>{m.datenschutz_s7_body()}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.datenschutz_s8_title()}</h2>
			<p class="mb-4">{m.datenschutz_s8_intro()}</p>

			<h3 class="mb-2 font-display text-xl text-crimson">{m.datenschutz_s8_access_title()}</h3>
			<p class="mb-4">{m.datenschutz_s8_access_body()}</p>

			<h3 class="mb-2 font-display text-xl text-crimson">
				{m.datenschutz_s8_rectification_title()}
			</h3>
			<p class="mb-4">{m.datenschutz_s8_rectification_body()}</p>

			<h3 class="mb-2 font-display text-xl text-crimson">{m.datenschutz_s8_erasure_title()}</h3>
			<p class="mb-4">{m.datenschutz_s8_erasure_body()}</p>

			<h3 class="mb-2 font-display text-xl text-crimson">{m.datenschutz_s8_restriction_title()}</h3>
			<p class="mb-4">{m.datenschutz_s8_restriction_body()}</p>

			<h3 class="mb-2 font-display text-xl text-crimson">{m.datenschutz_s8_portability_title()}</h3>
			<p class="mb-4">{m.datenschutz_s8_portability_body()}</p>

			<h3 class="mb-2 font-display text-xl text-crimson">{m.datenschutz_s8_objection_title()}</h3>
			<p class="mb-4">{m.datenschutz_s8_objection_body()}</p>

			<h3 class="mb-2 font-display text-xl text-crimson">{m.datenschutz_s8_withdrawal_title()}</h3>
			<p class="mb-4">{m.datenschutz_s8_withdrawal_body()}</p>

			<h3 class="mb-2 font-display text-xl text-crimson">{m.datenschutz_s8_complaint_title()}</h3>
			<p class="mb-2">{m.datenschutz_s8_complaint_body()}</p>
			<p>{@html m.datenschutz_s8_complaint_authority().replace(/\n/g, '<br />')}</p>
		</section>

		<section class="mb-10">
			<h2 class="mb-4 font-display text-2xl text-crimson">{m.datenschutz_s9_title()}</h2>
			<p>{m.datenschutz_s9_body()}</p>
		</section>
	</article>
</div>
