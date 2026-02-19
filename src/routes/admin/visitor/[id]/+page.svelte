<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const PER_PAGE_OPTIONS = [25, 50, 100, 250] as const;

	let timelinePerPage = $state(25);
	let timelinePage = $state(1);
	let viewsPerPage = $state(25);
	let viewsPage = $state(1);
	let eventsPerPage = $state(25);
	let eventsPage = $state(1);

	const pagedViews = $derived(data.pageViews.slice((viewsPage - 1) * viewsPerPage, viewsPage * viewsPerPage));
	const viewsTotalPages = $derived(Math.ceil(data.pageViews.length / viewsPerPage) || 1);
	const viewsShowFrom = $derived(data.pageViews.length === 0 ? 0 : (viewsPage - 1) * viewsPerPage + 1);
	const viewsShowTo = $derived(Math.min(viewsPage * viewsPerPage, data.pageViews.length));

	const pagedEvents = $derived(data.events.slice((eventsPage - 1) * eventsPerPage, eventsPage * eventsPerPage));
	const eventsTotalPages = $derived(Math.ceil(data.events.length / eventsPerPage) || 1);
	const eventsShowFrom = $derived(data.events.length === 0 ? 0 : (eventsPage - 1) * eventsPerPage + 1);
	const eventsShowTo = $derived(Math.min(eventsPage * eventsPerPage, data.events.length));

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function getMetadata(event: { metadata: unknown }): Record<string, unknown> {
		if (typeof event.metadata === 'object' && event.metadata !== null) {
			return event.metadata as Record<string, unknown>;
		}
		return {};
	}

	const timeline = $derived(
		[
			...data.pageViews.map((pv) => ({ type: 'pageview' as const, time: pv.createdAt, ...pv })),
			...data.events.map((ev) => ({
				type: ev.eventType as 'scroll_depth' | 'click',
				time: ev.createdAt,
				...ev
			}))
		].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
	);

	const pagedTimeline = $derived(timeline.slice((timelinePage - 1) * timelinePerPage, timelinePage * timelinePerPage));
	const timelineTotalPages = $derived(Math.ceil(timeline.length / timelinePerPage) || 1);
	const timelineShowFrom = $derived(timeline.length === 0 ? 0 : (timelinePage - 1) * timelinePerPage + 1);
	const timelineShowTo = $derived(Math.min(timelinePage * timelinePerPage, timeline.length));

	function formatPrice(amountCents: number): string {
		return `${(amountCents / 100).toFixed(2).replace('.', ',')} €`;
	}

	function statusClass(status: string): string {
		switch (status) {
			case 'pending': return 'bg-amber-100 text-amber-700';
			case 'paid': return 'bg-blue-100 text-blue-700';
			case 'in_process': return 'bg-purple-100 text-purple-700';
			case 'fulfilled': return 'bg-emerald-100 text-emerald-700';
			case 'cancelled': return 'bg-gray-100 text-gray-700';
			case 'refunded': return 'bg-red-100 text-red-700';
			case 'cancellation_requested': return 'bg-orange-100 text-orange-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	}

	function parseExtras(extrasJson: string | null): string[] {
		if (!extrasJson) return [];
		try { return JSON.parse(extrasJson) as string[]; } catch { return []; }
	}

	const summaryCards = $derived([
		{ label: 'Visitor ID', value: data.visitorId, full: true },
		{ label: 'IP Address', value: data.ipAddress },
		{ label: 'User Agent', value: data.userAgent, truncate: true },
		{ label: 'First Seen', value: formatDate(data.firstSeen) },
		{ label: 'Last Seen', value: formatDate(data.lastSeen) },
		{ label: 'Total Page Views', value: data.totalPageViews },
		{ label: 'Total Events', value: data.totalEvents },
		{ label: 'Total Orders', value: data.totalOrders }
	]);
</script>

<nav class="border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
		<div class="flex items-center gap-3">
			<a
				href="/admin"
				class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
			>
				← Dashboard
			</a>
			<h1 class="font-display text-xl text-crimson">Visitor Detail</h1>
		</div>
	</div>
</nav>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each summaryCards as card}
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<p class="font-body text-sm text-gray-500">{card.label}</p>
				{#if card.full}
					<p
						class="mt-1 font-mono text-sm font-medium break-all text-gray-800"
						title={String(card.value)}
					>
						{card.value}
					</p>
				{:else if card.truncate}
					<p
						class="mt-1 truncate font-body text-lg font-medium text-gray-800"
						title={String(card.value)}
					>
						{card.value}
					</p>
				{:else}
					<p class="mt-1 font-body text-lg font-medium text-gray-800">
						{card.value}
					</p>
				{/if}
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<div class="lg:col-span-1">
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<h2 class="mb-4 font-display text-lg text-crimson">Activity Timeline</h2>
				<div class="relative space-y-6 border-l-2 border-gray-100 pl-4">
					{#each pagedTimeline as item}
						<div class="relative min-w-0">
							<div class="mb-1 flex items-center gap-2">
								<span class="font-mono text-xs text-gray-400">{formatDate(item.time)}</span>
								{#if item.type === 'pageview'}
									<span
										class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
									>
										View
									</span>
								{:else if item.type === 'scroll_depth'}
									<span
										class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
									>
										Scroll
									</span>
								{:else if item.type === 'click'}
									<span
										class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
									>
										Click
									</span>
								{/if}
							</div>
							<div class="min-w-0 text-sm text-gray-700">
								{#if item.type === 'pageview'}
									<div class="truncate font-medium" title={item.landingPage}>
										{item.landingPage}
									</div>
									{#if item.utmSource}
										<div
											class="mt-1 truncate text-xs text-gray-500"
											title="Source: {item.utmSource} / {item.utmMedium}"
										>
											Source: {item.utmSource} / {item.utmMedium}
										</div>
									{/if}
								{:else if item.type === 'scroll_depth'}
									{@const meta = getMetadata(item)}
									<div class="truncate" title="Reached {meta.threshold}% on {item.page}">
										Reached {meta.threshold}% on {item.page}
									</div>
									<div class="text-xs text-gray-500">Max: {meta.maxPercent}%</div>
								{:else if item.type === 'click'}
									{@const meta = getMetadata(item)}
									<div class="truncate" title="{meta.tag}: {meta.text}">
										{meta.tag}: {meta.text}
									</div>
									{#if meta.href}
										<div class="truncate text-xs text-gray-500">{meta.href}</div>
									{/if}
								{/if}
							</div>
						</div>
					{/each}
				</div>
				{#if timeline.length > timelinePerPage}
					<div class="mt-4 flex flex-col items-center gap-3 border-t border-gray-100 pt-3">
						<div class="flex items-center gap-3">
							<p class="font-body text-xs text-gray-500">
								{timelineShowFrom}–{timelineShowTo} of {timeline.length}
							</p>
							<select
								class="rounded-lg border-gray-300 py-1 font-body text-xs focus:border-crimson focus:ring-crimson"
								bind:value={timelinePerPage}
								onchange={() => { timelinePage = 1; }}
							>
								{#each PER_PAGE_OPTIONS as size}
									<option value={size}>{size} / page</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center gap-2">
							<button
								onclick={() => { timelinePage = Math.max(1, timelinePage - 1); }}
								disabled={timelinePage <= 1}
								class="rounded-lg border border-gray-300 px-2.5 py-1 font-body text-xs text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
							>Prev</button>
							<span class="font-body text-xs text-gray-500">{timelinePage} / {timelineTotalPages}</span>
							<button
								onclick={() => { timelinePage = Math.min(timelineTotalPages, timelinePage + 1); }}
								disabled={timelinePage >= timelineTotalPages}
								class="rounded-lg border border-gray-300 px-2.5 py-1 font-body text-xs text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
							>Next</button>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div class="space-y-6 lg:col-span-2">
			<div class="rounded-xl border border-gray-100 bg-white shadow-sm">
				<div class="border-b border-gray-100 px-6 py-4">
					<h2 class="font-display text-lg text-crimson">Page Views</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full table-fixed text-left font-body text-sm">
						<colgroup>
							<col class="w-[160px]" />
							<col />
							<col class="w-[100px]" />
							<col class="w-[100px]" />
							<col class="w-[80px]" />
						</colgroup>
						<thead>
							<tr class="border-b border-gray-100 bg-gray-50">
								<th class="px-4 py-3 font-semibold text-gray-500">Time</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Page</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Source</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Medium</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Locale</th>
							</tr>
						</thead>
						<tbody>
							{#each pagedViews as view}
								<tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50">
									<td class="px-4 py-3 whitespace-nowrap text-gray-600">
										{formatDate(view.createdAt)}
									</td>
									<td class="truncate px-4 py-3 text-gray-800" title={view.landingPage}
										>{view.landingPage}</td
									>
									<td class="px-4 py-3 text-gray-600">{view.utmSource || '—'}</td>
									<td class="px-4 py-3 text-gray-600">{view.utmMedium || '—'}</td>
									<td class="px-4 py-3 text-gray-600 uppercase">{view.locale || '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#if data.pageViews.length > viewsPerPage}
					<div class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row">
						<div class="flex items-center gap-3">
							<p class="font-body text-sm text-gray-500">
								Showing {viewsShowFrom}–{viewsShowTo} of {data.pageViews.length.toLocaleString('de-DE')}
							</p>
							<select
								class="rounded-lg border-gray-300 py-1 font-body text-xs focus:border-crimson focus:ring-crimson"
								bind:value={viewsPerPage}
								onchange={() => { viewsPage = 1; }}
							>
								{#each PER_PAGE_OPTIONS as size}
									<option value={size}>{size} / page</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center gap-2">
							<button
								onclick={() => { viewsPage = Math.max(1, viewsPage - 1); }}
								disabled={viewsPage <= 1}
								class="rounded-lg border border-gray-300 px-3 py-1.5 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
							>Previous</button>
							<span class="font-body text-sm text-gray-500">Page {viewsPage} of {viewsTotalPages}</span>
							<button
								onclick={() => { viewsPage = Math.min(viewsTotalPages, viewsPage + 1); }}
								disabled={viewsPage >= viewsTotalPages}
								class="rounded-lg border border-gray-300 px-3 py-1.5 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
							>Next</button>
						</div>
					</div>
				{/if}
			</div>

			<div class="rounded-xl border border-gray-100 bg-white shadow-sm">
				<div class="border-b border-gray-100 px-6 py-4">
					<h2 class="font-display text-lg text-crimson">Events</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full table-fixed text-left font-body text-sm">
						<colgroup>
							<col class="w-[160px]" />
							<col class="w-[110px]" />
							<col class="w-[180px]" />
							<col />
						</colgroup>
						<thead>
							<tr class="border-b border-gray-100 bg-gray-50">
								<th class="px-4 py-3 font-semibold text-gray-500">Time</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Type</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Page</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Details</th>
							</tr>
						</thead>
						<tbody>
							{#each pagedEvents as event}
								{@const meta = getMetadata(event)}
								<tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50">
									<td class="px-4 py-3 whitespace-nowrap text-gray-600">
										{formatDate(event.createdAt)}
									</td>
									<td class="px-4 py-3">
										<span
											class="rounded-full px-2 py-0.5 text-xs font-medium
                      {event.eventType === 'scroll_depth'
												? 'bg-amber-100 text-amber-700'
												: 'bg-emerald-100 text-emerald-700'}"
										>
											{event.eventType}
										</span>
									</td>
									<td class="truncate px-4 py-3 text-gray-800" title={event.page}>{event.page}</td>
									<td class="px-4 py-3 text-gray-600">
										{#if event.eventType === 'scroll_depth'}
											<span class="block truncate"
												>Reached {meta.threshold}% (max {meta.maxPercent}%)</span
											>
										{:else if event.eventType === 'click'}
											<span class="block truncate" title="{meta.tag}: {meta.text}"
												>{meta.tag}: {meta.text}</span
											>
											{#if meta.href}
												<span class="ml-1 block truncate text-gray-400" title={String(meta.href)}
													>({meta.href})</span
												>
											{/if}
										{:else}
											<pre class="truncate text-xs" title={JSON.stringify(meta)}>{JSON.stringify(
													meta
												)}</pre>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#if data.events.length > eventsPerPage}
					<div class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row">
						<div class="flex items-center gap-3">
							<p class="font-body text-sm text-gray-500">
								Showing {eventsShowFrom}–{eventsShowTo} of {data.events.length.toLocaleString('de-DE')}
							</p>
							<select
								class="rounded-lg border-gray-300 py-1 font-body text-xs focus:border-crimson focus:ring-crimson"
								bind:value={eventsPerPage}
								onchange={() => { eventsPage = 1; }}
							>
								{#each PER_PAGE_OPTIONS as size}
									<option value={size}>{size} / page</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center gap-2">
							<button
								onclick={() => { eventsPage = Math.max(1, eventsPage - 1); }}
								disabled={eventsPage <= 1}
								class="rounded-lg border border-gray-300 px-3 py-1.5 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
							>Previous</button>
							<span class="font-body text-sm text-gray-500">Page {eventsPage} of {eventsTotalPages}</span>
							<button
								onclick={() => { eventsPage = Math.min(eventsTotalPages, eventsPage + 1); }}
								disabled={eventsPage >= eventsTotalPages}
								class="rounded-lg border border-gray-300 px-3 py-1.5 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
							>Next</button>
						</div>
					</div>
				{/if}
			</div>

			{#if data.orders.length > 0}
				<div class="rounded-xl border border-gray-100 bg-white shadow-sm">
					<div class="border-b border-gray-100 px-6 py-4">
						<h2 class="font-display text-lg text-crimson">Orders</h2>
					</div>
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
								</tr>
							</thead>
							<tbody>
								{#each data.orders as order, i}
									<tr class="border-b border-gray-50 last:border-0 {i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-cream transition-colors">
										<td class="px-4 py-3 whitespace-nowrap">
											<a href="/admin/orders/{order.id}" class="font-medium text-crimson hover:underline">
												{order.orderNumber}
											</a>
										</td>
										<td class="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(order.createdAt)}</td>
										<td class="px-4 py-3 text-gray-800">{order.customerName}</td>
										<td class="px-4 py-3 whitespace-nowrap text-gray-600">{order.orderType === 'pickup' ? 'Pickup' : 'Dine-in'}</td>
										<td class="px-4 py-3">
											{#each order.items as item}
												<div class="text-xs">
													<span class="font-medium text-gray-800">{item.quantity}x {item.itemName}</span>
													{#if item.extras}
														{@const extras = parseExtras(item.extras)}
														{#if extras.length > 0}
															<span class="text-amber-600">({extras.join(', ')})</span>
														{/if}
													{/if}
												</div>
											{/each}
										</td>
										<td class="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{formatPrice(order.totalAmount)}</td>
										<td class="px-4 py-3 whitespace-nowrap">
											<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusClass(order.status)}">{order.status}</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
