<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

	const summaryCards = $derived([
		{ label: 'Visitor ID', value: data.visitorId, full: true },
		{ label: 'IP Address', value: data.ipAddress },
		{ label: 'User Agent', value: data.userAgent, truncate: true },
		{ label: 'First Seen', value: formatDate(data.firstSeen) },
		{ label: 'Last Seen', value: formatDate(data.lastSeen) },
		{ label: 'Total Page Views', value: data.totalPageViews },
		{ label: 'Total Events', value: data.totalEvents }
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
					{#each timeline as item}
						<div class="relative">
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
							<div class="text-sm text-gray-700">
								{#if item.type === 'pageview'}
									<div class="font-medium">{item.landingPage}</div>
									{#if item.utmSource}
										<div class="mt-1 text-xs text-gray-500">
											Source: {item.utmSource} / {item.utmMedium}
										</div>
									{/if}
								{:else if item.type === 'scroll_depth'}
									{@const meta = getMetadata(item)}
									<div>
										Reached {meta.threshold}% on {item.page}
									</div>
									<div class="text-xs text-gray-500">Max: {meta.maxPercent}%</div>
								{:else if item.type === 'click'}
									{@const meta = getMetadata(item)}
									<div>
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
			</div>
		</div>

		<div class="space-y-6 lg:col-span-2">
			<div class="rounded-xl border border-gray-100 bg-white shadow-sm">
				<div class="border-b border-gray-100 px-6 py-4">
					<h2 class="font-display text-lg text-crimson">Page Views</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-left font-body text-sm">
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
							{#each data.pageViews as view}
								<tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50">
									<td class="px-4 py-3 whitespace-nowrap text-gray-600">
										{formatDate(view.createdAt)}
									</td>
									<td class="px-4 py-3 text-gray-800">{view.landingPage}</td>
									<td class="px-4 py-3 text-gray-600">{view.utmSource || '—'}</td>
									<td class="px-4 py-3 text-gray-600">{view.utmMedium || '—'}</td>
									<td class="px-4 py-3 text-gray-600 uppercase">{view.locale || '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<div class="rounded-xl border border-gray-100 bg-white shadow-sm">
				<div class="border-b border-gray-100 px-6 py-4">
					<h2 class="font-display text-lg text-crimson">Events</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-left font-body text-sm">
						<thead>
							<tr class="border-b border-gray-100 bg-gray-50">
								<th class="px-4 py-3 font-semibold text-gray-500">Time</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Type</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Page</th>
								<th class="px-4 py-3 font-semibold text-gray-500">Details</th>
							</tr>
						</thead>
						<tbody>
							{#each data.events as event}
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
									<td class="px-4 py-3 text-gray-800">{event.page}</td>
									<td class="px-4 py-3 text-gray-600">
										{#if event.eventType === 'scroll_depth'}
											Reached {meta.threshold}% (max {meta.maxPercent}%)
										{:else if event.eventType === 'click'}
											{meta.tag}: {meta.text}
											{#if meta.href}
												<span class="ml-1 text-gray-400">({meta.href})</span>
											{/if}
										{:else}
											<pre class="text-xs">{JSON.stringify(meta)}</pre>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
