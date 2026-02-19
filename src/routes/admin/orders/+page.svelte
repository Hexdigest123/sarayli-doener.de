<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data } = $props();

	let filterStatus = $state(data.filters.status);
	let filterDateFrom = $state(data.filters.dateFrom);
	let filterDateTo = $state(data.filters.dateTo);
	let expandedOrders = $state<Set<number>>(new Set());
	let refundOrderId = $state<number | null>(null);
	let refundOrderName = $state('');
	let refundOrderTotal = $state(0);

	$effect(() => {
		filterStatus = data.filters.status;
		filterDateFrom = data.filters.dateFrom;
		filterDateTo = data.filters.dateTo;
	});

	const statuses = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];

	function toggleExpanded(orderId: number) {
		const next = new Set(expandedOrders);
		if (next.has(orderId)) {
			next.delete(orderId);
		} else {
			next.add(orderId);
		}
		expandedOrders = next;
	}

	function parseExtras(extrasJson: string | null): string[] {
		if (!extrasJson) return [];
		try {
			return JSON.parse(extrasJson) as string[];
		} catch {
			return [];
		}
	}

	function updateParams(params: Record<string, string>) {
		const url = new URL(page.url);
		for (const [key, value] of Object.entries(params)) {
			if (value) {
				url.searchParams.set(key, value);
			} else {
				url.searchParams.delete(key);
			}
		}
		goto(url.toString(), { keepFocus: true, noScroll: true });
	}

	function applyFilters() {
		updateParams({
			status: filterStatus,
			dateFrom: filterDateFrom,
			dateTo: filterDateTo,
			page: '1'
		});
	}

	function resetFilters() {
		filterStatus = '';
		filterDateFrom = '';
		filterDateTo = '';
		updateParams({ status: '', dateFrom: '', dateTo: '', page: '1' });
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

	function formatPrice(amountCents: number): string {
		return `${(amountCents / 100).toFixed(2).replace('.', ',')} €`;
	}

	function statusClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-amber-100 text-amber-700';
			case 'paid':
				return 'bg-blue-100 text-blue-700';
			case 'fulfilled':
				return 'bg-emerald-100 text-emerald-700';
			case 'cancelled':
				return 'bg-gray-100 text-gray-700';
			case 'refunded':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	function statusSelectClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'border-amber-300 text-amber-700 bg-amber-50';
			case 'paid':
				return 'border-blue-300 text-blue-700 bg-blue-50';
			case 'fulfilled':
				return 'border-emerald-300 text-emerald-700 bg-emerald-50';
			case 'cancelled':
				return 'border-gray-300 text-gray-700 bg-gray-50';
			case 'refunded':
				return 'border-red-300 text-red-700 bg-red-50';
			default:
				return 'border-gray-300 text-gray-700 bg-gray-50';
		}
	}

	function openRefundModal(order: { id: number; customerName: string; totalAmount: number }) {
		refundOrderId = order.id;
		refundOrderName = order.customerName;
		refundOrderTotal = order.totalAmount;
	}

	function closeRefundModal() {
		refundOrderId = null;
	}

	const showFrom = $derived(data.pagination.total === 0 ? 0 : (data.pagination.page - 1) * data.pagination.perPage + 1);
	const showTo = $derived(
		Math.min(data.pagination.page * data.pagination.perPage, data.pagination.total)
	);
</script>

<nav class="border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
		<h1 class="font-display text-xl text-crimson">
			Saraylı Döner <span class="font-body text-sm font-normal text-gray-400">— Admin</span>
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
	<div class="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
		<div class="flex flex-wrap items-end gap-4">
			<div>
				<label for="statusFilter" class="mb-1 block font-body text-xs text-gray-500">Status</label>
				<select
					id="statusFilter"
					bind:value={filterStatus}
					onchange={applyFilters}
					class="rounded-lg border-gray-300 font-body text-sm focus:border-crimson focus:ring-crimson"
				>
					<option value="">All statuses</option>
					{#each statuses as status}
						<option value={status}>{status}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="dateFrom" class="mb-1 block font-body text-xs text-gray-500">From</label>
				<input
					id="dateFrom"
					type="date"
					bind:value={filterDateFrom}
					onchange={applyFilters}
					class="rounded-lg border-gray-300 font-body text-sm focus:border-crimson focus:ring-crimson"
				/>
			</div>
			<div>
				<label for="dateTo" class="mb-1 block font-body text-xs text-gray-500">To</label>
				<input
					id="dateTo"
					type="date"
					bind:value={filterDateTo}
					onchange={applyFilters}
					class="rounded-lg border-gray-300 font-body text-sm focus:border-crimson focus:ring-crimson"
				/>
			</div>
			<button
				onclick={resetFilters}
				class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
			>
				Reset
			</button>
		</div>
	</div>

	{#if data.orders.length === 0}
		<div class="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
			<p class="font-display text-xl text-gray-400">No orders found</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
			<div class="overflow-x-auto">
				<table class="w-full text-left font-body text-sm">
					<thead>
						<tr class="border-b border-gray-100 bg-gray-50">
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase"></th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Order</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Time</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Customer</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Type</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Items</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Total</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Status</th>
						</tr>
					</thead>
					<tbody>
						{#each data.orders as order, i}
							<tr
								class="cursor-pointer border-b border-gray-50 transition-colors hover:bg-cream {i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}"
								onclick={() => toggleExpanded(order.id)}
							>
								<td class="px-3 py-3 text-gray-400">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4 transition-transform {expandedOrders.has(order.id) ? 'rotate-90' : ''}"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
									</svg>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<a href="/admin/orders/{order.id}" class="font-medium text-crimson hover:underline" onclick={(e) => e.stopPropagation()}>
										#{order.id}
									</a>
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(order.createdAt)}</td>
								<td class="px-4 py-3">
									<div class="font-medium text-gray-800">{order.customerName}</div>
									<div class="text-xs text-gray-500">{order.customerPhone}</div>
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600">{order.orderType === 'pickup' ? 'Pickup' : 'Dine-in'}{#if order.pickupTime} · {order.pickupTime}{/if}</td>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600">{order.itemCount}</td>
								<td class="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{formatPrice(order.totalAmount)}</td>
								<td class="px-4 py-3 whitespace-nowrap" onclick={(e) => e.stopPropagation()}>
									<form method="POST" action="?/updateStatus" use:enhance>
										<input type="hidden" name="orderId" value={order.id} />
										<select
											name="status"
											class="rounded-lg border px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-crimson {statusSelectClass(order.status)}"
											value={order.status}
											onchange={(e) => e.currentTarget.form?.requestSubmit()}
										>
											{#each statuses as s}
												<option value={s} selected={s === order.status}>{s}</option>
											{/each}
										</select>
									</form>
								</td>
							</tr>

							{#if expandedOrders.has(order.id)}
								<tr class="{i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}">
									<td colspan="8" class="px-4 pb-4 pt-0">
										<div class="ml-7 rounded-lg border border-gray-100 bg-cream/50 p-3">
											{#if order.items.length === 0}
												<p class="text-xs text-gray-400">No items</p>
											{:else}
												<table class="w-full text-xs">
													<thead>
														<tr class="border-b border-gray-200">
															<th class="pb-1.5 text-left font-semibold text-gray-500">Item</th>
															<th class="pb-1.5 text-right font-semibold text-gray-500">Qty</th>
															<th class="pb-1.5 text-right font-semibold text-gray-500">Price</th>
														</tr>
													</thead>
													<tbody>
														{#each order.items as item}
															<tr class="border-b border-gray-100 last:border-0">
																<td class="py-1.5">
																	<span class="font-medium text-gray-800">{item.itemName}</span>
																	{#if item.extras}
																		{@const extras = parseExtras(item.extras)}
																		{#if extras.length > 0}
																			<span class="ml-1 text-amber-600">({extras.join(', ')})</span>
																		{/if}
																	{/if}
																</td>
																<td class="py-1.5 text-right text-gray-600">{item.quantity}x</td>
																<td class="py-1.5 text-right font-medium text-gray-800">{formatPrice(item.unitPrice * item.quantity)}</td>
															</tr>
														{/each}
													</tbody>
												</table>
												{#if order.notes}
													<p class="mt-2 border-t border-gray-200 pt-2 text-xs text-gray-600">
														<span class="font-semibold">Notes:</span> {order.notes}
													</p>
												{/if}

												{#if order.status === 'paid' || order.status === 'pending'}
													<div class="mt-2 border-t border-gray-200 pt-2">
														<button
															type="button"
															onclick={() => openRefundModal(order)}
															class="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
														>
															Refund &amp; Cancel
														</button>
													</div>
												{/if}
											{/if}
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>

			<div class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row">
				<p class="font-body text-sm text-gray-500">
					Showing {showFrom}-{showTo} of {data.pagination.total.toLocaleString('de-DE')}
				</p>
				<div class="flex items-center gap-2">
					<button
						onclick={() => updateParams({ page: String(data.pagination.page - 1) })}
						disabled={data.pagination.page <= 1}
						class="rounded-lg border border-gray-300 px-3 py-1.5 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
					>
						Previous
					</button>
					<span class="font-body text-sm text-gray-500">
						Page {data.pagination.page} of {data.pagination.totalPages || 1}
					</span>
					<button
						onclick={() => updateParams({ page: String(data.pagination.page + 1) })}
						disabled={data.pagination.page >= data.pagination.totalPages}
						class="rounded-lg border border-gray-300 px-3 py-1.5 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
					>
						Next
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

{#if refundOrderId}
	<div
		class="fixed inset-0 z-[80] flex items-center justify-center"
		role="dialog"
		aria-modal="true"
		aria-label="Confirm refund"
	>
		<button
			class="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
			onclick={closeRefundModal}
			aria-label="Close"
		></button>
		<div class="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
			</div>
			<h3 class="mb-1 font-display text-lg font-bold text-gray-900">Confirm Refund</h3>
			<p class="mb-4 font-body text-sm text-gray-600">
				Refund order <span class="font-semibold">#{refundOrderId}</span> from
				<span class="font-semibold">{refundOrderName}</span> for
				<span class="font-semibold text-crimson">{formatPrice(refundOrderTotal)}</span>?
				This will refund the payment via Stripe and cannot be undone.
			</p>
			<div class="flex gap-2">
				<button
					onclick={closeRefundModal}
					class="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 font-body text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
				>
					Cancel
				</button>
				<form method="POST" action="?/refund" use:enhance class="flex-1">
					<input type="hidden" name="orderId" value={refundOrderId} />
					<button
						type="submit"
						onclick={closeRefundModal}
						class="w-full rounded-lg bg-red-600 px-3 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-red-700"
					>
						Refund
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
