<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import Reviews from '$lib/components/Reviews.svelte';
	import Video from '$lib/components/Video.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Saraylı Döner – 100% Selbstgemachter Döner | Gladbeck</title>
</svelte:head>

<div>
	<Hero />
	<Menu />
	<Gallery />
	<Reviews />
	<Video />
</div>
<Footer />
