<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { cart } from '$lib/stores/cart.svelte';
	import { doenerExtras } from '$lib/config';

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

	const ASAP = 'asap';

	let orderType = $state<OrderType>('pickup');
	let pickupTime = $state(pickupTimes[0]);
	let arrivalTime = $state(ASAP);
	let customerName = $state('');
	let customerPhone = $state('');
	let customerEmail = $state('');
	let notes = $state('');
	let isSubmitting = $state(false);
	let submitError = $state('');
	let storeClosed = $state(false);
	let storeClosedMessage = $state('');

	const extrasLabelMap = new Map(doenerExtras.map((e) => [e.id, e.label]));

	$effect(() => {
		fetch('/api/store-status')
			.then((r) => r.json())
			.then((data: { open: boolean; closedMessage: string | null }) => {
				storeClosed = !data.open;
				storeClosedMessage = data.closedMessage ?? '';
			})
			.catch(() => {});
	});

	function getExtrasLabel(extras?: string[]): string {
		if (!extras || extras.length === 0) return '';
		return extras.map((id) => {
			const key = `extra_${id}`;
			if (msg[key]) return msg[key]();
			return extrasLabelMap.get(id) ?? id;
		}).join(', ');
	}

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
					pickupTime: orderType === 'pickup' ? pickupTime : (arrivalTime === ASAP ? null : arrivalTime),
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

		{#if storeClosed}
			<div class="mx-auto mb-6 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
				<p class="font-display text-lg font-bold text-red-700">
					{msg.store_closed_title?.() ?? 'Bestellungen sind derzeit nicht möglich'}
				</p>
				{#if storeClosedMessage}
					<p class="mt-2 font-body text-sm text-red-600">{storeClosedMessage}</p>
				{/if}
				<a
					href="/"
					class="mt-4 inline-flex rounded-lg bg-crimson px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
				>
					{msg.checkout_back?.() ?? 'Zurück zur Speisekarte'}
				</a>
			</div>
		{:else if cart.isEmpty}
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
					<div class="mb-4 flex items-center justify-between">
						<h2 class="font-display text-2xl font-bold text-crimson">
							{msg.cart_summary?.() ?? msg.checkout_order_summary?.() ?? 'Order summary'}
						</h2>
						<a
							href="/"
							class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
							{msg.checkout_back?.() ?? 'Zurück'}
						</a>
					</div>

					<div class="space-y-3">
						{#each cart.items as item, index}
							<div class="rounded-lg border border-gray-100 bg-cream p-3">
								<div class="flex items-start justify-between">
									<div class="min-w-0 flex-1">
										<p class="font-body text-sm font-semibold text-gray-900">
											{msg[item.nameKey]?.() ?? item.nameKey}
										</p>
										{#if item.sizeKey}
											<p class="font-body text-xs text-gray-500">{msg[item.sizeKey]?.() ?? item.sizeKey}</p>
										{/if}
										{#if item.extras && item.extras.length > 0}
											<p class="font-body text-xs text-gold">{getExtrasLabel(item.extras)}</p>
										{/if}
									</div>
									<p class="ml-3 font-body text-sm font-semibold text-crimson">
										{formatPrice(item.price * item.quantity)}
									</p>
								</div>
								<div class="mt-2 flex items-center justify-between">
									<div class="flex items-center gap-1">
										<button
											type="button"
											onclick={() => cart.updateQuantity(index, item.quantity - 1)}
											class="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
											aria-label="Decrease quantity"
										>
											<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
											</svg>
										</button>
										<span class="w-8 text-center font-body text-sm font-semibold text-gray-800">{item.quantity}</span>
										<button
											type="button"
											onclick={() => cart.updateQuantity(index, item.quantity + 1)}
											class="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
											aria-label="Increase quantity"
										>
											<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
											</svg>
										</button>
									</div>
									<button
										type="button"
										onclick={() => cart.removeItem(index)}
										class="font-body text-xs text-red-500 transition-colors hover:text-red-700"
									>
										{msg.cart_remove?.() ?? 'Entfernen'}
									</button>
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

					<div class="mb-4">
						<label for="timeSelect" class="mb-2 block font-body text-sm font-semibold text-gray-700">
							{orderType === 'pickup'
								? (msg.checkout_pickup_time?.() ?? 'Pickup time')
								: (msg.checkout_arrival_time?.() ?? 'Arrival time')}
						</label>
						{#if orderType === 'pickup'}
							<select
								id="timeSelect"
								bind:value={pickupTime}
								class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
							>
								{#each pickupTimes as time}
									<option value={time}>{time}</option>
								{/each}
							</select>
						{:else}
							<select
								id="timeSelect"
								bind:value={arrivalTime}
								class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
							>
								<option value={ASAP}>{msg.checkout_asap?.() ?? 'As soon as possible'}</option>
								{#each pickupTimes as time}
									<option value={time}>{time}</option>
								{/each}
							</select>
						{/if}
					</div>

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

				<p class="mb-3 font-body text-xs text-gray-500">
					{msg.checkout_cancel_policy?.() ?? 'Bestellungen können storniert werden, solange die Zubereitung noch nicht begonnen hat. Danach ist eine Stornierung nicht mehr möglich.'}
				</p>

				<button
					type="submit"
					disabled={isSubmitting || storeClosed}
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
