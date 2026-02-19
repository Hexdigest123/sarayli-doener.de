<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';

	let { onclick }: { onclick: () => void } = $props();
</script>

<button
	{onclick}
	class="relative flex items-center justify-center rounded-lg p-2 text-gray-700 transition-colors hover:text-crimson"
	aria-label="Cart"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="h-6 w-6"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		stroke-width="1.5"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="M12 4a7.5 7.5 0 00-7.5 7.5h15A7.5 7.5 0 0012 4z" />
		<path stroke-linecap="round" stroke-linejoin="round" d="M3 13h18v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1z" />
		<path stroke-linecap="round" stroke-linejoin="round" d="M8 16v2m8-2v2" />
		<path stroke-linecap="round" stroke-linejoin="round" d="M6 20h12" />
		<line x1="12" y1="1.5" x2="12" y2="4" stroke-linecap="round" />
	</svg>

	{#if cart.totalItems > 0}
		<span
			class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-crimson text-[10px] font-bold text-white"
		>
			{cart.totalItems > 99 ? '99+' : cart.totalItems}
		</span>
	{/if}
</button>
