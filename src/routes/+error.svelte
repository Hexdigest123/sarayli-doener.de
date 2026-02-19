<script lang="ts">
	import { page } from '$app/state';
</script>

<section class="flex min-h-[60vh] items-center justify-center bg-cream px-4">
	<div class="max-w-md text-center">
		<p class="font-display text-7xl font-bold text-crimson">{page.status}</p>
		<h1 class="mt-4 font-display text-2xl font-bold text-gray-900">
			{#if page.status === 404}
				Seite nicht gefunden
			{:else}
				Ein Fehler ist aufgetreten
			{/if}
		</h1>
		<p class="mt-2 font-body text-gray-600">
			{#if page.status === 404}
				Die angeforderte Seite existiert nicht.
			{:else}
				Bitte versuche es erneut.
			{/if}
		</p>
		<a
			href="/"
			class="mt-6 inline-flex rounded-lg bg-crimson px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
		>
			Zur Startseite
		</a>
	</div>
</section>
