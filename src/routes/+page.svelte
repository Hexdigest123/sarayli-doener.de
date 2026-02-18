<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import Reviews from '$lib/components/Reviews.svelte';
	import Video from '$lib/components/Video.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import SpecialOfferSection from '$lib/components/SpecialOfferSection.svelte';
</script>

<div>
	<Hero />
	<Menu />
	<SpecialOfferSection />
	<Gallery />
	<Reviews />
	<Video />
</div>
<Footer />
