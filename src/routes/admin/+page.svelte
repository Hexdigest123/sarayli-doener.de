<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Chart,
		BarController,
		CategoryScale,
		LinearScale,
		BarElement,
		Tooltip,
		Legend,
		ArcElement,
		DoughnutController,
		LineController,
		LineElement,
		PointElement,
		Filler
	} from 'chart.js';

	if (browser) {
		Chart.register(
			BarController,
			CategoryScale,
			LinearScale,
			BarElement,
			Tooltip,
			Legend,
			ArcElement,
			DoughnutController,
			LineController,
			LineElement,
			PointElement,
			Filler
		);
	}

	let { data } = $props();

	let barCanvas = $state<HTMLCanvasElement>();
	let doughnutCanvas = $state<HTMLCanvasElement>();
	let campaignCanvas = $state<HTMLCanvasElement>();
	let trafficCanvas = $state<HTMLCanvasElement>();

	let filterDateFrom = $state(data.filters.dateFrom);
	let filterDateTo = $state(data.filters.dateTo);
	let filterSource = $state(data.filters.source);

	$effect(() => {
		filterDateFrom = data.filters.dateFrom;
		filterDateTo = data.filters.dateTo;
		filterSource = data.filters.source;
	});

	const CHART_PALETTE = [
		'#8b1a1a',
		'#2563eb',
		'#d4a847',
		'#16a34a',
		'#9333ea',
		'#ea580c',
		'#0d9488',
		'#db2777',
		'#65a30d',
		'#6366f1'
	];

	$effect(() => {
		if (!browser || !barCanvas || data.sourceStats.length === 0) return;

		const chart = new Chart(barCanvas, {
			type: 'bar',
			data: {
				labels: data.sourceStats.map((s: { source: string; count: number }) => s.source),
				datasets: [
					{
						label: 'Views',
						data: data.sourceStats.map((s: { source: string; count: number }) => s.count),
						backgroundColor: '#8b1a1a',
						hoverBackgroundColor: '#d4a847',
						borderRadius: 4
					}
				]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#1a1a1a',
						titleFont: { family: 'DM Sans' },
						bodyFont: { family: 'DM Sans' }
					}
				},
				scales: {
					x: {
						beginAtZero: true,
						ticks: { font: { family: 'DM Sans' }, precision: 0 },
						grid: { color: '#f0f0f0' }
					},
					y: {
						ticks: { font: { family: 'DM Sans', size: 12 } },
						grid: { display: false }
					}
				}
			}
		});

		return () => chart.destroy();
	});

	$effect(() => {
		if (!browser || !doughnutCanvas || data.sourceStats.length === 0) return;

		const chart = new Chart(doughnutCanvas, {
			type: 'doughnut',
			data: {
				labels: data.sourceStats.map((s: { source: string; count: number }) => s.source),
				datasets: [
					{
						data: data.sourceStats.map((s: { source: string; count: number }) => s.count),
						backgroundColor: CHART_PALETTE.slice(0, data.sourceStats.length),
						hoverOffset: 6,
						borderWidth: 2,
						borderColor: '#ffffff'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '60%',
				plugins: {
					legend: {
						position: 'bottom',
						labels: { font: { family: 'DM Sans', size: 12 }, padding: 16, usePointStyle: true }
					},
					tooltip: {
						backgroundColor: '#1a1a1a',
						titleFont: { family: 'DM Sans' },
						bodyFont: { family: 'DM Sans' }
					}
				}
			}
		});

		return () => chart.destroy();
	});

	$effect(() => {
		if (!browser || !campaignCanvas || data.campaignStats.length === 0) return;

		const chart = new Chart(campaignCanvas, {
			type: 'doughnut',
			data: {
				labels: data.campaignStats.map((c: { campaign: string; count: number }) => c.campaign),
				datasets: [
					{
						data: data.campaignStats.map((c: { campaign: string; count: number }) => c.count),
						backgroundColor: CHART_PALETTE.slice(0, data.campaignStats.length),
						hoverOffset: 6,
						borderWidth: 2,
						borderColor: '#ffffff'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '60%',
				plugins: {
					legend: {
						position: 'bottom',
						labels: { font: { family: 'DM Sans', size: 12 }, padding: 16, usePointStyle: true }
					},
					tooltip: {
						backgroundColor: '#1a1a1a',
						titleFont: { family: 'DM Sans' },
						bodyFont: { family: 'DM Sans' }
					}
				}
			}
		});

		return () => chart.destroy();
	});

	$effect(() => {
		if (!browser || !trafficCanvas || data.trafficTimeline.length === 0) return;

		const timeline = data.trafficTimeline;

		const chart = new Chart(trafficCanvas, {
			type: 'line',
			data: {
				labels: timeline.map((d: { label: string; count: number }) => d.label),
				datasets: [
					{
						label: 'Views',
						data: timeline.map((d: { label: string; count: number }) => d.count),
						borderColor: '#8b1a1a',
						backgroundColor: 'rgba(139, 26, 26, 0.08)',
						pointBackgroundColor: '#8b1a1a',
						pointBorderColor: '#ffffff',
						pointBorderWidth: 2,
						pointRadius: 4,
						pointHoverRadius: 6,
						borderWidth: 2.5,
						fill: true,
						tension: 0.3
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#1a1a1a',
						titleFont: { family: 'DM Sans' },
						bodyFont: { family: 'DM Sans' }
					}
				},
				scales: {
					x: {
						ticks: { font: { family: 'DM Sans', size: 11 } },
						grid: { color: '#f0f0f0' }
					},
					y: {
						beginAtZero: true,
						ticks: { font: { family: 'DM Sans' }, precision: 0 },
						grid: { color: '#f0f0f0' }
					}
				}
			}
		});

		return () => chart.destroy();
	});

	function toDateStr(d: Date): string {
		return d.toISOString().split('T')[0];
	}

	function setPreset(preset: 'today' | 'week' | 'month' | 'year') {
		const now = new Date();
		let from: Date;

		switch (preset) {
			case 'today':
				from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				break;
			case 'week': {
				const day = now.getDay();
				const diff = day === 0 ? 6 : day - 1;
				from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
				break;
			}
			case 'month':
				from = new Date(now.getFullYear(), now.getMonth(), 1);
				break;
			case 'year':
				from = new Date(now.getFullYear(), 0, 1);
				break;
		}

		filterDateFrom = toDateStr(from);
		filterDateTo = toDateStr(now);
		updateParams({
			dateFrom: filterDateFrom,
			dateTo: filterDateTo,
			source: filterSource,
			page: '1'
		});
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

	function toggleSort(column: string) {
		updateParams({
			sortBy: column,
			sortDir: data.filters.sortBy === column && data.filters.sortDir === 'desc' ? 'asc' : 'desc',
			page: '1'
		});
	}

	function applyFilters() {
		updateParams({
			dateFrom: filterDateFrom,
			dateTo: filterDateTo,
			source: filterSource,
			page: '1'
		});
	}

	function resetFilters() {
		filterDateFrom = '';
		filterDateTo = '';
		filterSource = '';
		updateParams({ dateFrom: '', dateTo: '', source: '', page: '1', sortBy: '', sortDir: '' });
	}

	function sortArrow(column: string): string {
		if (data.filters.sortBy !== column) return '';
		return data.filters.sortDir === 'asc' ? ' ↑' : ' ↓';
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

	const summaryCards = $derived([
		{ label: 'Total Views', value: data.totalViews, icon: 'eye' },
		{ label: 'Unique Visitors', value: data.uniqueVisitors, icon: 'users' },
		{ label: 'Top Source', value: data.topSource, icon: 'trending' },
		{ label: 'Views Today', value: data.todayViews, icon: 'calendar' }
	]);

	const tableColumns = [
		{ key: 'createdAt', label: 'Time', sortable: true },
		{ key: 'visitorId', label: 'Visitor ID', sortable: true },
		{ key: 'landingPage', label: 'Page', sortable: true },
		{ key: 'utmSource', label: 'Source', sortable: true },
		{ key: 'utmMedium', label: 'Medium', sortable: true },
		{ key: 'utmCampaign', label: 'Campaign', sortable: true },
		{ key: 'referer', label: 'Referer', sortable: true },
		{ key: 'locale', label: 'Locale', sortable: true }
	];

	const showFrom = $derived((data.pagination.page - 1) * data.pagination.perPage + 1);
	const showTo = $derived(
		Math.min(data.pagination.page * data.pagination.perPage, data.pagination.total)
	);
</script>

<!-- Top nav bar -->
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
				← Main Page
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
		<div class="mb-3 flex flex-wrap gap-2">
			{#each [{ key: 'today', label: 'Today' }, { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }, { key: 'year', label: 'This Year' }] as preset}
				<button
					onclick={() => setPreset(preset.key as 'today' | 'week' | 'month' | 'year')}
					class="rounded-lg border border-gray-200 px-3 py-1.5 font-body text-xs font-medium text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
				>
					{preset.label}
				</button>
			{/each}
		</div>
		<div class="flex flex-wrap items-end gap-4">
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
			<div>
				<label for="sourceFilter" class="mb-1 block font-body text-xs text-gray-500">Source</label>
				<select
					id="sourceFilter"
					bind:value={filterSource}
					onchange={applyFilters}
					class="rounded-lg border-gray-300 font-body text-sm focus:border-crimson focus:ring-crimson"
				>
					<option value="">All sources</option>
					{#each data.allSources as source}
						<option value={source}>{source}</option>
					{/each}
				</select>
			</div>
			<button
				onclick={resetFilters}
				class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
			>
				Reset
			</button>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each summaryCards as card}
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<p class="font-body text-sm text-gray-500">{card.label}</p>
				<p class="mt-1 font-display text-3xl font-bold text-crimson">
					{typeof card.value === 'number' ? card.value.toLocaleString('de-DE') : card.value}
				</p>
			</div>
		{/each}
	</div>

	<!-- Charts -->
	<!-- Traffic Overview -->
	<div class="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<h2 class="font-display text-lg text-gray-800">Traffic Overview</h2>
			<p class="font-body text-xs text-gray-400">
				{#if data.filters.dateFrom && data.filters.dateTo}
					{data.filters.dateFrom} — {data.filters.dateTo}
				{:else}
					All time
				{/if}
			</p>
		</div>
		<div class="h-64">
			{#if browser && data.trafficTimeline.length > 0}
				<canvas bind:this={trafficCanvas}></canvas>
			{:else}
				<div class="flex h-full items-center justify-center">
					<p class="font-body text-sm text-gray-400">No traffic data for this period</p>
				</div>
			{/if}
		</div>
	</div>

	{#if data.sourceStats.length > 0 || data.campaignStats.length > 0}
		<div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<h2 class="mb-4 font-display text-lg text-gray-800">Views by Source</h2>
				<div class="h-64">
					{#if browser && data.sourceStats.length > 0}
						<canvas bind:this={barCanvas}></canvas>
					{/if}
				</div>
			</div>
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<h2 class="mb-4 font-display text-lg text-gray-800">Source Distribution</h2>
				<div class="h-64">
					{#if browser && data.sourceStats.length > 0}
						<canvas bind:this={doughnutCanvas}></canvas>
					{/if}
				</div>
			</div>
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<h2 class="mb-4 font-display text-lg text-gray-800">Campaigns</h2>
				<div class="h-64">
					{#if browser && data.campaignStats.length > 0}
						<canvas bind:this={campaignCanvas}></canvas>
					{:else}
						<div class="flex h-full items-center justify-center">
							<p class="font-body text-sm text-gray-400">No campaign data</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Data Table -->
	{#if data.views.length === 0}
		<div class="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
			<p class="font-display text-xl text-gray-400">No tracking data yet</p>
			<p class="mt-2 font-body text-sm text-gray-400">
				Visits to your site will appear here automatically.
			</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
			<div class="overflow-x-auto">
				<table class="w-full text-left font-body text-sm">
					<thead>
						<tr class="border-b border-gray-100 bg-gray-50">
							{#each tableColumns as col}
								<th class="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
									{#if col.sortable}
										<button
											onclick={() => toggleSort(col.key)}
											class="inline-flex items-center gap-1 transition-colors hover:text-crimson"
										>
											{col.label}{sortArrow(col.key)}
										</button>
									{:else}
										{col.label}
									{/if}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data.views as row, i}
							<tr
								class="border-b border-gray-50 transition-colors hover:bg-cream {i % 2 === 0
									? 'bg-white'
									: 'bg-gray-50/50'}"
							>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600">
									{formatDate(row.createdAt)}
								</td>
								<td class="px-4 py-3 font-mono text-xs whitespace-nowrap">
									{#if row.visitorId}
										<a
											href="/admin/visitor/{row.visitorId}"
											class="text-crimson transition-colors hover:text-crimson-dark hover:underline"
											title={row.visitorId}
										>
											{row.visitorId.slice(0, 12)}...
										</a>
									{:else}
										<span class="text-gray-600">—</span>
									{/if}
								</td>
								<td class="max-w-[180px] truncate px-4 py-3 text-gray-600" title={row.landingPage}>
									{row.landingPage}
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									{#if row.utmSource}
										<span
											class="rounded-full bg-crimson/10 px-2 py-0.5 text-xs font-medium text-crimson"
										>
											{row.utmSource}
										</span>
									{:else}
										<span class="text-gray-300">—</span>
									{/if}
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600">
									{row.utmMedium ?? '—'}
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600">
									{row.utmCampaign ?? '—'}
								</td>
								<td
									class="max-w-[200px] truncate px-4 py-3 text-gray-400"
									title={row.referer ?? ''}
								>
									{row.referer ?? '—'}
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-gray-600 uppercase">
									{row.locale ?? '—'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			<div
				class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row"
			>
				<p class="font-body text-sm text-gray-500">
					Showing {showFrom}–{showTo} of {data.pagination.total.toLocaleString('de-DE')}
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
