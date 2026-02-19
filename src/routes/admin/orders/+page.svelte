<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data } = $props();

	let filterStatus = $state(data.filters.status);
	let filterDateFrom = $state(data.filters.dateFrom);
	let filterDateTo = $state(data.filters.dateTo);

	$effect(() => {
		filterStatus = data.filters.status;
		filterDateFrom = data.filters.dateFrom;
		filterDateTo = data.filters.dateTo;
	});

	const statuses = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];

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
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Order</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Time</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Customer</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Type</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Items</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Total</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Status</th>
							<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Action</th>
						</tr>
					</thead>
					<tbody>
						{#each data.orders as order, i}
							<tr class="border-b border-gray-50 transition-colors hover:bg-cream {i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}">
								<td class="px-4 py-3 whitespace-nowrap">
									<a href="/admin/orders/{order.id}" class="font-medium text-crimson hover:underline">
										#{order.id}
									</a>
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(order.createdAt)}</td>
								<td class="px-4 py-3">
									<div class="font-medium text-gray-800">{order.customerName}</div>
									<div class="text-xs text-gray-500">{order.customerPhone}</div>
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600">{order.orderType === 'pickup' ? 'Pickup' : 'Dine-in'}</td>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600">{order.itemCount}</td>
								<td class="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{formatPrice(order.totalAmount)}</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusClass(order.status)}">
										{order.status}
									</span>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									{#if order.status === 'paid' || order.status === 'pending'}
										<form method="POST" action="?/fulfill" use:enhance>
											<input type="hidden" name="orderId" value={order.id} />
											<button
												type="submit"
												class="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
											>
												Mark fulfilled
											</button>
										</form>
									{:else}
										<span class="text-xs text-gray-400">-</span>
									{/if}
								</td>
							</tr>
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
