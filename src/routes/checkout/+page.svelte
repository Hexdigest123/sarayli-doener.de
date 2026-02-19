<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { cart } from '$lib/stores/cart.svelte';

	type OrderType = 'pickup' | 'dine_in';

	const msg: Record<string, () => string> = {};
	for (const [key, fn] of Object.entries(m)) {
		if (typeof fn === 'function') {
			msg[key] = fn as () => string;
		}
	}

	const pickupTimes = Array.from({ length: 22 }, (_, index) => {
		const totalMinutes = 11 * 60 + index * 30;
		const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
		const minute = String(totalMinutes % 60).padStart(2, '0');
		return `${hour}:${minute}`;
	});

	const formatPrice = (price: number) => `${price.toFixed(2).replace('.', ',')} €`;

	let orderType = $state<OrderType>('pickup');
	let pickupTime = $state(pickupTimes[0]);
	let customerName = $state('');
	let customerPhone = $state('');
	let customerEmail = $state('');
	let notes = $state('');
	let isSubmitting = $state(false);
	let submitError = $state('');

	async function handleCheckout(event: SubmitEvent) {
		event.preventDefault();

		if (cart.isEmpty || isSubmitting) return;

		submitError = '';
		isSubmitting = true;

		try {
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: cart.items,
					orderType,
					pickupTime: orderType === 'pickup' ? pickupTime : null,
					customerName,
					customerPhone,
					customerEmail: customerEmail || null,
					notes: notes || null
				})
			});

			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
				return;
			}

			submitError = msg.checkout_error?.() ?? 'Checkout could not be started. Please try again.';
		} catch {
			submitError = msg.checkout_error?.() ?? 'Checkout could not be started. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="bg-cream py-24 md:py-28">
	<div class="container mx-auto px-4">
		<h1 class="mb-8 text-center font-display text-3xl font-bold text-crimson md:mb-10 md:text-4xl">
			{msg.checkout_title?.() ?? 'Checkout'}
		</h1>

		{#if cart.isEmpty}
			<div class="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
				<p class="font-body text-gray-700">{msg.cart_empty?.() ?? 'Your cart is empty'}</p>
				<a
					href="/"
					class="mt-6 inline-flex rounded-lg bg-crimson px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
				>
					{msg.checkout_back_to_menu?.() ?? msg.checkout_cancel_back?.() ?? 'Back to menu'}
				</a>
			</div>
		{:else}
			<div class="grid gap-6 lg:grid-cols-2">
				<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-7">
					<h2 class="mb-4 font-display text-2xl font-bold text-crimson">
						{msg.cart_summary?.() ?? msg.checkout_order_summary?.() ?? 'Order summary'}
					</h2>

					<div class="space-y-3">
						{#each cart.items as item}
							<div class="flex items-center justify-between rounded-lg border border-gray-100 bg-cream p-3">
								<div>
									<p class="font-body text-sm font-semibold text-gray-900">
										{msg[item.nameKey]?.() ?? item.nameKey}
									</p>
									{#if item.sizeKey}
										<p class="font-body text-xs text-gray-500">{msg[item.sizeKey]?.() ?? item.sizeKey}</p>
									{/if}
								</div>
								<div class="text-right">
									<p class="font-body text-xs text-gray-500">x{item.quantity}</p>
									<p class="font-body text-sm font-semibold text-crimson">
										{formatPrice(item.price * item.quantity)}
									</p>
								</div>
							</div>
						{/each}
					</div>

					<div class="mt-5 border-t border-gray-100 pt-4">
						<div class="flex items-center justify-between">
							<span class="font-body text-sm text-gray-600">{msg.cart_total?.() ?? 'Total'}</span>
							<span class="font-display text-2xl font-bold text-crimson">{formatPrice(cart.totalPrice)}</span>
						</div>
					</div>
				</div>

				<form
					class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-7"
					onsubmit={handleCheckout}
				>
					<h2 class="mb-4 font-display text-2xl font-bold text-crimson">
						{msg.checkout_details_title?.() ?? 'Order details'}
					</h2>

					<fieldset class="mb-4">
						<legend class="mb-2 font-body text-sm font-semibold text-gray-700">
							{msg.checkout_order_type?.() ?? 'Order type'}
						</legend>
						<div class="grid grid-cols-2 gap-2">
							<button
								type="button"
								onclick={() => (orderType = 'pickup')}
								class={`rounded-lg border px-3 py-2 font-body text-sm font-semibold transition-colors ${orderType === 'pickup' ? 'border-crimson bg-crimson text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-crimson/40'}`}
							>
								{msg.checkout_pickup?.() ?? 'Pickup'}
							</button>
							<button
								type="button"
								onclick={() => (orderType = 'dine_in')}
								class={`rounded-lg border px-3 py-2 font-body text-sm font-semibold transition-colors ${orderType === 'dine_in' ? 'border-crimson bg-crimson text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-crimson/40'}`}
							>
								{msg.checkout_dinein?.() ?? 'Dine-in'}
							</button>
						</div>
					</fieldset>

					{#if orderType === 'pickup'}
						<div class="mb-4">
							<label for="pickupTime" class="mb-2 block font-body text-sm font-semibold text-gray-700">
								{msg.checkout_pickup_time?.() ?? 'Pickup time'}
							</label>
							<select
								id="pickupTime"
								bind:value={pickupTime}
								class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
							>
								{#each pickupTimes as time}
									<option value={time}>{time}</option>
								{/each}
							</select>
						</div>
					{/if}

					<div class="mb-4">
						<label for="name" class="mb-2 block font-body text-sm font-semibold text-gray-700">
							{msg.checkout_name?.() ?? 'Name'}
						</label>
						<input
							id="name"
							type="text"
							bind:value={customerName}
							required
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
						/>
					</div>

					<div class="mb-4">
						<label for="phone" class="mb-2 block font-body text-sm font-semibold text-gray-700">
							{msg.checkout_phone?.() ?? 'Phone'}
						</label>
						<input
							id="phone"
							type="tel"
							bind:value={customerPhone}
							required
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
						/>
					</div>

					<div class="mb-4">
						<label for="email" class="mb-2 block font-body text-sm font-semibold text-gray-700">
							{msg.checkout_email?.() ?? 'Email'}
						</label>
						<input
							id="email"
							type="email"
							bind:value={customerEmail}
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
						/>
					</div>

					<div class="mb-5">
						<label for="notes" class="mb-2 block font-body text-sm font-semibold text-gray-700">
							{msg.checkout_notes?.() ?? 'Notes'}
						</label>
						<textarea
							id="notes"
							bind:value={notes}
							rows="4"
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
						></textarea>
					</div>

					<div class="mb-4 flex items-center justify-between rounded-lg bg-cream px-3 py-2">
						<span class="font-body text-sm text-gray-600">{msg.cart_total?.() ?? 'Total'}</span>
						<span class="font-display text-xl font-bold text-crimson">{formatPrice(cart.totalPrice)}</span>
					</div>

					{#if submitError}
						<p class="mb-3 rounded-lg bg-red-50 px-3 py-2 font-body text-sm text-red-700">{submitError}</p>
					{/if}

					<button
						type="submit"
						disabled={isSubmitting}
						class="inline-flex w-full items-center justify-center rounded-lg bg-crimson px-4 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting
							? msg.checkout_processing?.() ?? 'Processing...'
							: msg.checkout_pay_now?.() ?? 'Pay now'}
					</button>
				</form>
			</div>
		{/if}
	</div>
</section>
