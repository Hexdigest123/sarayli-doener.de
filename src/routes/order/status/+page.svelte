<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { menuCategories, doenerExtras } from '$lib/config';

	const msg: Record<string, () => string> = {};
	for (const [key, fn] of Object.entries(m)) {
		if (typeof fn === 'function') {
			msg[key] = fn as () => string;
		}
	}

	const menuItemNameMap = new Map<number, string>();
	for (const category of menuCategories) {
		for (const item of category.items) {
			menuItemNameMap.set(item.id, item.nameKey);
		}
	}

	function getTranslatedItemName(menuItemId: number, fallback: string): string {
		const nameKey = menuItemNameMap.get(menuItemId);
		if (nameKey && msg[nameKey]) return msg[nameKey]();
		return fallback;
	}

	function getTranslatedExtra(id: string): string {
		const key = `extra_${id}`;
		if (msg[key]) return msg[key]();
		const extra = doenerExtras.find((e) => e.id === id);
		return extra?.label ?? id;
	}

	let { data } = $props();

	let orderIdInput = $state(page.url.searchParams.get('id') ?? '');
	let showCancelModal = $state(false);

	function lookupOrder(e: SubmitEvent) {
		e.preventDefault();
		const trimmed = orderIdInput.trim().replace('#', '');
		if (trimmed) {
			goto(localizeHref(`/order/status?id=${trimmed}`), { keepFocus: false });
		}
	}

	function parseExtras(extrasJson: string | null): string[] {
		if (!extrasJson) return [];
		try {
			return JSON.parse(extrasJson) as string[];
		} catch {
			return [];
		}
	}

	function formatPrice(amountCents: number): string {
		return `${(amountCents / 100).toFixed(2).replace('.', ',')} \u20AC`;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function statusLabel(status: string): string {
		const map: Record<string, () => string> = {
			pending: () => m.order_status_pending(),
			paid: () => m.order_status_paid(),
			in_process: () => m.order_status_in_process(),
			fulfilled: () => m.order_status_fulfilled(),
			cancelled: () => m.order_status_cancelled(),
			refunded: () => m.order_status_refunded(),
			cancellation_requested: () => m.order_status_cancellation_requested()
		};
		return map[status]?.() ?? status;
	}

	function statusClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-amber-100 text-amber-700 border-amber-200';
			case 'paid':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'in_process':
				return 'bg-purple-100 text-purple-700 border-purple-200';
			case 'fulfilled':
				return 'bg-emerald-100 text-emerald-700 border-emerald-200';
			case 'cancelled':
				return 'bg-gray-100 text-gray-700 border-gray-200';
			case 'refunded':
				return 'bg-red-100 text-red-700 border-red-200';
			case 'cancellation_requested':
				return 'bg-orange-100 text-orange-700 border-orange-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	}

	const canRequestCancellation = $derived(
		data.order && ['paid', 'pending'].includes(data.order.status)
	);

	const hasSearched = $derived(page.url.searchParams.has('id'));
</script>

<section class="bg-cream py-24 md:py-28">
	<div class="container mx-auto max-w-2xl px-4">
		<h1 class="mb-8 text-center font-display text-3xl font-bold text-crimson md:text-4xl">
			{m.order_status_title()}
		</h1>

		<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
			<form onsubmit={lookupOrder} class="flex gap-3">
				<input
					type="text"
					bind:value={orderIdInput}
					placeholder={m.order_status_placeholder()}
					required
					class="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
				/>
				<button
					type="submit"
					class="rounded-lg bg-crimson px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
				>
					{m.order_status_lookup()}
				</button>
			</form>
		</div>

		{#if hasSearched && !data.order}
			<div class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
				<p class="font-display text-lg font-bold text-red-700">{m.order_status_not_found()}</p>
				<p class="mt-1 font-body text-sm text-red-600">{m.order_status_not_found_hint()}</p>
			</div>
		{/if}

		{#if data.order}
			<div class="mt-6 space-y-4">
				<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
					<div class="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p class="font-body text-sm text-gray-500">{m.order_status_order()}</p>
							<p class="font-display text-2xl font-bold text-crimson">{data.order.orderNumber}</p>
						</div>
						<div class="text-right">
							<span class="inline-block rounded-full border px-3 py-1 text-sm font-medium {statusClass(data.order.status)}">
								{statusLabel(data.order.status)}
							</span>
						</div>
					</div>

					<div class="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">
						<div>
							<p class="font-body text-xs text-gray-500">{m.order_status_type()}</p>
							<p class="mt-0.5 font-body text-sm font-medium text-gray-800">
								{data.order.orderType === 'pickup' ? m.order_pickup() : m.order_dine_in()}
							</p>
						</div>
						{#if data.order.pickupTime}
							<div>
								<p class="font-body text-xs text-gray-500">{m.order_status_pickup_time()}</p>
								<p class="mt-0.5 font-body text-sm font-medium text-gray-800">{data.order.pickupTime}</p>
							</div>
						{/if}
						<div>
							<p class="font-body text-xs text-gray-500">{m.order_status_placed_at()}</p>
							<p class="mt-0.5 font-body text-sm font-medium text-gray-800">{formatDate(data.order.createdAt)}</p>
						</div>
						<div>
							<p class="font-body text-xs text-gray-500">{m.cart_total()}</p>
							<p class="mt-0.5 font-display text-lg font-bold text-crimson">{formatPrice(data.order.totalAmount)}</p>
						</div>
					</div>
				</div>

				{#if data.items.length > 0}
					<div class="rounded-2xl border border-gray-100 bg-white shadow-sm">
						<div class="border-b border-gray-100 px-6 py-4">
							<h2 class="font-display text-lg text-crimson">{m.order_status_items()}</h2>
						</div>
						<div class="divide-y divide-gray-50">
							{#each data.items as item}
								<div class="flex items-center justify-between px-6 py-3">
									<div>
										<p class="font-body text-sm font-medium text-gray-800">{getTranslatedItemName(item.menuItemId, item.itemName)}</p>
							{#if item.extras}
										{@const extras = parseExtras(item.extras)}
										{#if extras.length > 0}
											<p class="font-body text-xs text-amber-600">{extras.map((id) => getTranslatedExtra(id)).join(', ')}</p>
										{/if}
									{/if}
								</div>
								<div class="shrink-0 text-right">
									<p class="font-body text-xs text-gray-500">{item.quantity}x</p>
									<p class="whitespace-nowrap font-body text-sm font-medium text-gray-800">{formatPrice(item.unitPrice * item.quantity)}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if data.order.status === 'cancellation_requested'}
					<div class="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center">
						<p class="font-body text-sm font-medium text-orange-700">
							{m.order_status_cancellation_pending()}
						</p>
					</div>
				{/if}

				{#if canRequestCancellation}
					<div class="text-center">
						<button
							type="button"
							onclick={() => (showCancelModal = true)}
							class="rounded-lg border border-red-300 px-5 py-2.5 font-body text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
						>
							{m.order_status_request_cancellation()}
						</button>
					</div>
				{/if}
			</div>
		{/if}

		<div class="mt-8 text-center">
			<a
				href="/"
				class="font-body text-sm text-gray-500 transition-colors hover:text-crimson"
			>
				{m.checkout_success_back()}
			</a>
		</div>
	</div>
</section>

{#if showCancelModal && data.order}
	<div
		class="fixed inset-0 z-[80] flex items-center justify-center"
		role="dialog"
		aria-modal="true"
		aria-label="Confirm cancellation request"
	>
		<button
			class="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
			onclick={() => (showCancelModal = false)}
			aria-label="Close"
		></button>
		<div class="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
			</div>
			<h3 class="mb-1 font-display text-lg font-bold text-gray-900">{m.order_status_cancel_confirm_title()}</h3>
			<p class="mb-4 font-body text-sm text-gray-600">
				{m.order_status_cancel_confirm_message()}
			</p>
			<div class="flex gap-2">
				<button
					onclick={() => (showCancelModal = false)}
					class="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 font-body text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
				>
					{m.order_status_cancel_go_back()}
				</button>
				<form method="POST" action="?/requestCancellation" use:enhance={() => {
					return async ({ update }) => {
						await update();
						showCancelModal = false;
					};
				}} class="flex-1">
					<input type="hidden" name="orderId" value={data.order.id} />
					<button
						type="submit"
						class="w-full rounded-lg bg-red-600 px-3 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-red-700"
					>
						{m.order_status_cancel_confirm()}
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
