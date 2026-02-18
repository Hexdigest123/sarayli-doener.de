<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>Admin – Saraylı Döner</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-gray-50 font-body">
	{@render children()}
</div>
