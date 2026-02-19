<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import {
		ArcElement,
		BarController,
		BarElement,
		CategoryScale,
		Chart,
		DoughnutController,
		Legend,
		LinearScale,
		Tooltip
	} from 'chart.js';

	if (browser) {
		Chart.register(
			BarController,
			BarElement,
			CategoryScale,
			LinearScale,
			Tooltip,
			Legend,
			ArcElement,
			DoughnutController
		);
	}

	let { data } = $props();

	let dailyRevenueCanvas = $state<HTMLCanvasElement>();
	let statusCanvas = $state<HTMLCanvasElement>();
	let orderTypeCanvas = $state<HTMLCanvasElement>();

	const CHART_PALETTE = ['#8b1a1a', '#2563eb', '#d4a847', '#16a34a', '#ea580c', '#db2777'];

	function formatPrice(amountCents: number): string {
		return `${(amountCents / 100).toFixed(2).replace('.', ',')} €`;
	}

	$effect(() => {
		if (!browser || !dailyRevenueCanvas || data.dailyRevenue.length === 0) return;

		const chart = new Chart(dailyRevenueCanvas, {
			type: 'bar',
			data: {
				labels: data.dailyRevenue.map((day: { date: string }) => day.date),
				datasets: [
					{
						label: 'Revenue',
						data: data.dailyRevenue.map((day: { revenue: number }) => day.revenue / 100),
						backgroundColor: '#8b1a1a',
						hoverBackgroundColor: '#d4a847',
						borderRadius: 4
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
						bodyFont: { family: 'DM Sans' },
						callbacks: {
							label: (context) => `${context.parsed.y.toFixed(2).replace('.', ',')} €`
						}
					}
				},
				scales: {
					x: {
						ticks: { font: { family: 'DM Sans', size: 11 } },
						grid: { color: '#f0f0f0' }
					},
					y: {
						beginAtZero: true,
						ticks: {
							font: { family: 'DM Sans' },
							callback: (value) => `${Number(value).toFixed(0)} €`
						},
						grid: { color: '#f0f0f0' }
					}
				}
			}
		});

		return () => chart.destroy();
	});

	$effect(() => {
		if (!browser || !statusCanvas || data.statusCounts.length === 0) return;

		const chart = new Chart(statusCanvas, {
			type: 'doughnut',
			data: {
				labels: data.statusCounts.map((status: { status: string }) => status.status),
				datasets: [
					{
						data: data.statusCounts.map((status: { count: number }) => status.count),
						backgroundColor: CHART_PALETTE.slice(0, data.statusCounts.length),
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
		if (!browser || !orderTypeCanvas || data.orderTypeDistribution.length === 0) return;

		const chart = new Chart(orderTypeCanvas, {
			type: 'doughnut',
			data: {
				labels: data.orderTypeDistribution.map((orderType: { type: string }) =>
					orderType.type === 'pickup' ? 'Pickup' : 'Dine-in'
				),
				datasets: [
					{
						data: data.orderTypeDistribution.map((orderType: { count: number }) => orderType.count),
						backgroundColor: ['#8b1a1a', '#d4a847'],
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

	const summaryCards = $derived([
		{ label: 'Total Revenue', value: formatPrice(data.totalRevenue) },
		{ label: 'Today Revenue', value: formatPrice(data.todayRevenue) },
		{ label: 'This Week Revenue', value: formatPrice(data.weekRevenue) },
		{ label: 'This Month Revenue', value: formatPrice(data.monthRevenue) },
		{ label: 'Total Orders', value: data.totalOrders.toLocaleString('de-DE') },
		{ label: 'Today Orders', value: data.todayOrders.toLocaleString('de-DE') }
	]);
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
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each summaryCards as card}
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<p class="font-body text-sm text-gray-500">{card.label}</p>
				<p class="mt-1 font-display text-3xl font-bold text-crimson">{card.value}</p>
			</div>
		{/each}
	</div>

	<div class="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
		<h2 class="mb-4 font-display text-lg text-gray-800">Daily Revenue (This Month)</h2>
		<div class="h-72">
			{#if browser && data.dailyRevenue.length > 0}
				<canvas bind:this={dailyRevenueCanvas}></canvas>
			{:else}
				<div class="flex h-full items-center justify-center">
					<p class="font-body text-sm text-gray-400">No revenue data for this period</p>
				</div>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-display text-lg text-gray-800">Order Status Distribution</h2>
			<div class="h-72">
				{#if browser && data.statusCounts.length > 0}
					<canvas bind:this={statusCanvas}></canvas>
				{:else}
					<div class="flex h-full items-center justify-center">
						<p class="font-body text-sm text-gray-400">No status data available</p>
					</div>
				{/if}
			</div>
		</div>

		<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-display text-lg text-gray-800">Pickup vs Dine-in</h2>
			<div class="h-72">
				{#if browser && data.orderTypeDistribution.length > 0}
					<canvas bind:this={orderTypeCanvas}></canvas>
				{:else}
					<div class="flex h-full items-center justify-center">
						<p class="font-body text-sm text-gray-400">No order type data available</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
