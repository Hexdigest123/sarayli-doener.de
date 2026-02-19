<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const isLoginPage = $derived(page.url.pathname === '/admin/login');

	const tabs = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/orders', label: 'Orders' },
		{ href: '/admin/stats', label: 'Stats' }
	];
</script>

<svelte:head>
	<title>Admin – Saraylı Döner</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-gray-50 font-body">
	{#if !isLoginPage}
		<div class="border-b border-gray-200 bg-white">
			<div class="mx-auto max-w-7xl px-4 sm:px-6">
				<div class="flex gap-4 overflow-x-auto">
					{#each tabs as tab}
						<a
							href={tab.href}
							class="border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors {(tab.href === '/admin'
								? page.url.pathname === '/admin'
								: page.url.pathname.startsWith(tab.href))
								? 'border-crimson text-crimson'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						>
							{tab.label}
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	{@render children()}
</div>
