<script lang="ts">
	import { enhance } from '$app/forms';
	import { doenerExtras } from '$lib/config';
	import * as m from '$lib/paraglide/messages';

	const extrasLabelMap = new Map(doenerExtras.map((e) => [e.id, e.label]));

	let { data } = $props();

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatPrice(amountCents: number): string {
		return `${(amountCents / 100).toFixed(2).replace('.', ',')} €`;
	}

	function statusClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-amber-100 text-amber-700';
			case 'paid':
				return 'bg-blue-100 text-blue-700';
			case 'in_process':
				return 'bg-purple-100 text-purple-700';
			case 'fulfilled':
				return 'bg-emerald-100 text-emerald-700';
			case 'cancelled':
				return 'bg-gray-100 text-gray-700';
			case 'refunded':
				return 'bg-red-100 text-red-700';
			case 'cancellation_requested':
				return 'bg-orange-100 text-orange-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}
</script>

<nav class="border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
		<div class="flex items-center gap-3">
			<a
				href="/admin/orders"
				class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
			>
				&larr; Orders
			</a>
			<h1 class="font-display text-xl text-crimson">Order {data.order.orderNumber}</h1>
		</div>
		<span class="rounded-full px-3 py-1 text-sm font-medium {statusClass(data.order.status)}">
			{data.order.status}
		</span>
	</div>
</nav>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
			<p class="font-body text-sm text-gray-500">Created</p>
			<p class="mt-1 font-body text-lg font-medium text-gray-800">{formatDate(data.order.createdAt)}</p>
		</div>
		<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
			<p class="font-body text-sm text-gray-500">Customer</p>
			<p class="mt-1 font-body text-lg font-medium text-gray-800">{data.order.customerName}</p>
			<p class="text-sm text-gray-500">{data.order.customerPhone}</p>
		</div>
		<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
			<p class="font-body text-sm text-gray-500">Order Type</p>
			<p class="mt-1 font-body text-lg font-medium text-gray-800">
				{data.order.orderType === 'pickup' ? m.order_pickup() : m.order_dine_in()}
			</p>
			{#if data.order.pickupTime}
				<p class="text-sm text-gray-500">{data.order.pickupTime}</p>
			{/if}
		</div>
		<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
			<p class="font-body text-sm text-gray-500">Total</p>
			<p class="mt-1 font-display text-3xl font-bold text-crimson">
				{formatPrice(data.order.totalAmount)}
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
				<div class="border-b border-gray-100 px-6 py-4">
					<h2 class="font-display text-lg text-crimson">Items</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-left font-body text-sm">
						<thead>
							<tr class="border-b border-gray-100 bg-gray-50">
								<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Item</th>
								<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Qty</th>
								<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Unit</th>
								<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Subtotal</th>
							</tr>
						</thead>
						<tbody>
						{#each data.items as item}
							<tr class="border-b border-gray-50 last:border-0">
								<td class="px-4 py-3">
									<span class="font-medium text-gray-800">{item.itemName}</span>
									{#if item.extras}
										{@const parsedExtras = (() => { try { return JSON.parse(item.extras) as string[]; } catch { return []; } })()}
										{#if parsedExtras.length > 0}
											<p class="mt-0.5 text-xs text-amber-600">{parsedExtras.map((id) => extrasLabelMap.get(id) ?? id).join(', ')}</p>
										{/if}
									{/if}
								</td>
								<td class="px-4 py-3 text-gray-600">{item.quantity}</td>
								<td class="px-4 py-3 text-gray-600">{formatPrice(item.unitPrice)}</td>
								<td class="px-4 py-3 font-medium text-gray-800">{formatPrice(item.unitPrice * item.quantity)}</td>
							</tr>
						{/each}
						</tbody>
					</table>
				</div>
			</div>

			{#if data.order.notes}
				<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
					<h2 class="mb-2 font-display text-lg text-crimson">Notes</h2>
					<p class="font-body text-gray-700">{data.order.notes}</p>
				</div>
			{/if}
		</div>

		<div class="space-y-6">
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<h2 class="mb-4 font-display text-lg text-crimson">Actions</h2>
				<div class="space-y-3">
					{#if data.order.status === 'refunded'}
						<div>
							<p class="mb-1.5 font-body text-sm font-medium text-gray-600">Status</p>
							<div class="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 font-body text-sm font-medium text-red-700">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
								</svg>
								Refunded (final)
							</div>
						</div>
					{:else}
						<form method="POST" action="?/updateStatus" use:enhance>
							<input type="hidden" name="orderId" value={data.order.id} />
							<label for="orderStatus" class="mb-1.5 block font-body text-sm font-medium text-gray-600">Status</label>
							<select
								id="orderStatus"
								name="status"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 font-body text-sm focus:border-crimson focus:ring-crimson"
								value={data.order.status}
								onchange={(e) => e.currentTarget.form?.requestSubmit()}
							>
								{#each ['pending', 'paid', 'in_process', 'fulfilled', 'cancelled', 'cancellation_requested'] as s}
									<option value={s} selected={s === data.order.status}>{s}</option>
								{/each}
							</select>
						</form>

						{#if (data.order.status === 'paid' || data.order.status === 'pending' || data.order.status === 'cancellation_requested') && data.order.stripePaymentIntentId}
							<form method="POST" action="?/refund" use:enhance>
								<button
									type="submit"
									class="w-full rounded-lg border border-red-300 px-4 py-2 font-body text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
								>
									Refund
								</button>
							</form>
						{/if}
					{/if}
				</div>
			</div>

			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<h2 class="mb-4 font-display text-lg text-crimson">Timeline</h2>
				<div class="space-y-3 font-body text-sm text-gray-700">
					<div>
						<span class="font-medium">Created:</span> {formatDate(data.order.createdAt)}
					</div>
					{#if data.order.paidAt}
						<div>
							<span class="font-medium">Paid:</span> {formatDate(data.order.paidAt)}
						</div>
					{/if}
					{#if data.order.fulfilledAt}
						<div>
							<span class="font-medium">Fulfilled:</span> {formatDate(data.order.fulfilledAt)}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
