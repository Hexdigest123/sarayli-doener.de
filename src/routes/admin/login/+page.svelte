<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
		<div class="mb-8 text-center">
			<p class="font-body text-sm tracking-[0.2em] text-gold">SARAYLI DONER</p>
			<h1 class="mt-2 font-display text-2xl text-crimson">Admin Access</h1>
		</div>

		<form method="POST" use:enhance class="space-y-4">
			<div>
				<label for="password" class="mb-1 block font-body text-sm font-medium text-gray-700"
					>Password</label
				>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
					class="block w-full rounded-lg border-gray-300 font-body focus:border-crimson focus:ring-crimson"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-lg bg-crimson px-6 py-3 font-body font-semibold text-white transition-colors hover:bg-crimson-dark"
			>
				Sign in
			</button>

			{#if page.form?.error}
				<p class="mt-2 text-sm text-red-600">{page.form.error}</p>
			{/if}
		</form>
	</div>
</div>
