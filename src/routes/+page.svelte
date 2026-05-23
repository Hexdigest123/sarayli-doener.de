<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import Reviews from '$lib/components/Reviews.svelte';
	import Video from '$lib/components/Video.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div>
	<Hero />
	<Menu categories={data?.menu ?? []} />
	<Gallery />
	<Reviews />
	<Video />
</div>
<Footer />
