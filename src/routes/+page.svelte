<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import SpecialOfferPopup from '$lib/components/SpecialOfferPopup.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import Reviews from '$lib/components/Reviews.svelte';
	import Video from '$lib/components/Video.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<div>
	<Hero />
	<SpecialOfferPopup />
	<Menu />
	<Gallery />
	<Reviews />
	<Video />
</div>
<Footer />
