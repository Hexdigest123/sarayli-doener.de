<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let closedMessage = $state(data.closedMessage ?? '');
</script>

<nav class="border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
		<h1 class="font-display text-xl text-crimson">
			Saraylı Döner <span class="font-body text-sm font-normal text-gray-400">— Settings</span>
		</h1>
		<div class="flex items-center gap-3">
			<a
				href="/"
				class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
			>
				&larr; Main Page
			</a>
			<form method="POST" action="/admin/logout" use:enhance>
				<button
					type="submit"
					class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
				>
					Logout
				</button>
			</form>
		</div>
	</div>
</nav>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
	<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
		<div class="mb-6 flex items-center gap-3">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl {data.storeOpen ? 'bg-emerald-100' : 'bg-red-100'}">
				<span class="text-2xl">{data.storeOpen ? '🟢' : '🔴'}</span>
			</div>
			<div>
				<h2 class="font-display text-2xl font-bold {data.storeOpen ? 'text-emerald-700' : 'text-red-700'}">
					{data.storeOpen ? 'Store is Open' : 'Store is Closed'}
				</h2>
				<p class="font-body text-sm text-gray-500">
					{data.storeOpen ? 'Customers can place orders' : 'No new orders are accepted'}
				</p>
			</div>
		</div>

		{#if !data.storeOpen}
			<div class="mb-6">
				<label for="closedMsg" class="mb-1.5 block font-body text-sm font-medium text-gray-600">
					Closed Message (shown to customers)
				</label>
				<input
					id="closedMsg"
					type="text"
					bind:value={closedMessage}
					placeholder="z.B. Wir haben heute geschlossen"
					class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
				/>
			</div>
		{/if}

		<form method="POST" action="?/toggle" use:enhance>
			<input type="hidden" name="open" value={data.storeOpen ? '0' : '1'} />
			<input type="hidden" name="closedMessage" value={closedMessage} />
			<button
				type="submit"
				class="w-full rounded-lg px-6 py-3 font-body text-sm font-semibold text-white transition-colors {data.storeOpen
					? 'bg-red-600 hover:bg-red-700'
					: 'bg-emerald-600 hover:bg-emerald-700'}"
			>
				{data.storeOpen ? 'Close Store for Today' : 'Re-open Store'}
			</button>
		</form>
	</div>
</div>
