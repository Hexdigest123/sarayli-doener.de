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
	<div class="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
		<div class="mb-6 flex items-center gap-3">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-xl {data.shopEnabled
					? 'bg-emerald-100'
					: 'bg-gray-100'}"
			>
				{#if data.shopEnabled}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-emerald-600"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-gray-400"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
						/>
					</svg>
				{/if}
			</div>
			<div>
				<h2
					class="font-display text-2xl font-bold {data.shopEnabled
						? 'text-emerald-700'
						: 'text-gray-500'}"
				>
					{data.shopEnabled ? 'Web Shop Enabled' : 'Web Shop Disabled'}
				</h2>
				<p class="font-body text-sm text-gray-500">
					{data.shopEnabled
						? 'Customers can add items to cart and place orders online.'
						: 'Online ordering is disabled. Menu is still visible.'}
				</p>
			</div>
		</div>

		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<p class="mb-3 font-body text-sm font-medium text-gray-700">Online Ordering</p>
			<div class="grid grid-cols-2 gap-2">
				<form method="POST" action="?/enableShop" use:enhance>
					<button
						type="submit"
						class="w-full rounded-lg border px-4 py-2.5 font-body text-sm font-semibold transition-colors {data.shopEnabled
							? 'border-emerald-600 bg-emerald-600 text-white'
							: 'border-gray-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'}"
					>
						Enabled
					</button>
				</form>
				<form method="POST" action="?/disableShop" use:enhance>
					<button
						type="submit"
						class="w-full rounded-lg border px-4 py-2.5 font-body text-sm font-semibold transition-colors {!data.shopEnabled
							? 'border-gray-600 bg-gray-600 text-white'
							: 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'}"
					>
						Disabled
					</button>
				</form>
			</div>
			{#if !data.shopEnabled}
				<p class="mt-3 font-body text-xs text-gray-500">
					Cart icon, add-to-cart buttons, and checkout are hidden from customers.
				</p>
			{/if}
		</div>
	</div>

	<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
		<div class="mb-6 flex items-center gap-3">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-xl {data.storeOpen
					? 'bg-emerald-100'
					: 'bg-red-100'}"
			>
				{#if data.storeOpen}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-emerald-600"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-red-600"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
			</div>
			<div>
				<h2
					class="font-display text-2xl font-bold {data.storeOpen
						? 'text-emerald-700'
						: 'text-red-700'}"
				>
					{data.storeOpen ? 'Store is Open' : 'Store is Closed'}
				</h2>
				<p class="font-body text-sm text-gray-500">
					{#if data.mode === 'auto'}
						Auto schedule: {data.schedule.openHour}:00 – {data.schedule.closeHour}:00
					{:else}
						Manual override active
					{/if}
				</p>
			</div>
		</div>

		<div class="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
			<p class="mb-3 font-body text-sm font-medium text-gray-700">Mode</p>
			<div class="grid grid-cols-2 gap-2">
				<form method="POST" action="?/setAuto" use:enhance>
					<button
						type="submit"
						class="w-full rounded-lg border px-4 py-2.5 font-body text-sm font-semibold transition-colors {data.mode ===
						'auto'
							? 'border-crimson bg-crimson text-white'
							: 'border-gray-200 bg-white text-gray-700 hover:border-crimson/40'}"
					>
						Auto ({data.schedule.openHour}:00 – {data.schedule.closeHour}:00)
					</button>
				</form>
				{#if data.storeOpen}
					<form method="POST" action="?/manualClose" use:enhance>
						<input type="hidden" name="closedMessage" value={closedMessage} />
						<button
							type="submit"
							class="w-full rounded-lg border px-4 py-2.5 font-body text-sm font-semibold transition-colors {data.mode ===
								'manual' && !data.storeOpen
								? 'border-red-600 bg-red-600 text-white'
								: 'border-gray-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50'}"
						>
							Close Manually
						</button>
					</form>
				{:else}
					<form method="POST" action="?/manualOpen" use:enhance>
						<button
							type="submit"
							class="w-full rounded-lg border px-4 py-2.5 font-body text-sm font-semibold transition-colors {data.mode ===
								'manual' && data.storeOpen
								? 'border-emerald-600 bg-emerald-600 text-white'
								: 'border-gray-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'}"
						>
							Open Manually
						</button>
					</form>
				{/if}
			</div>
		</div>

		{#if data.mode === 'manual' && !data.storeOpen}
			<div class="mb-6">
				<label for="closedMsg" class="mb-1.5 block font-body text-sm font-medium text-gray-600">
					Closed Message (shown to customers)
				</label>
				<form method="POST" action="?/manualClose" use:enhance class="flex gap-2">
					<input
						id="closedMsg"
						type="text"
						name="closedMessage"
						bind:value={closedMessage}
						placeholder="z.B. Wir haben heute geschlossen"
						class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
					/>
					<button
						type="submit"
						class="rounded-lg bg-crimson px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
					>
						Save
					</button>
				</form>
			</div>
		{/if}
	</div>
</div>
