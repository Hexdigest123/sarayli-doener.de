<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { markdownToHtml } from '$lib/markdown';

	let { data, form } = $props();

	type PopupItem = (typeof data.popups)[number];

	// ── View state ───────────────────────────────────────────────────────────────
	// The page is either the list of saved popups or the wizard editing one of them.
	let view = $state<'list' | 'editor'>('list');
	let editingId = $state<number | null>(null);

	// ── Wizard content state ───────────────────────────────────────────────────
	// Re-initialised every time the editor opens (new or an existing popup).
	let title = $state('');
	let body = $state('');
	let badge = $state('');
	let ctaLabel = $state('');
	let ctaUrl = $state('');

	// ── Markdown description editor ──────────────────────────────────────────────
	// The description is stored as Markdown; the toolbar inserts syntax around the
	// current selection and the live preview (right) shows the rendered result.
	let bodyEl = $state<HTMLTextAreaElement>();
	const bodyPreviewHtml = $derived(markdownToHtml(body));

	// Wrap the current selection with the same marker on both sides (e.g. ** for bold).
	async function surround(marker: string) {
		const el = bodyEl;
		if (!el) return;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = body.slice(start, end);
		body = body.slice(0, start) + marker + selected + marker + body.slice(end);
		await tick();
		el.focus();
		el.setSelectionRange(start + marker.length, start + marker.length + selected.length);
	}

	// Prefix each line in the selection (bullet/numbered list, heading, quote).
	async function prefixLines(prefix: string, numbered = false) {
		const el = bodyEl;
		if (!el) return;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const lineStart = body.lastIndexOf('\n', start - 1) + 1;
		const nextBreak = body.indexOf('\n', end);
		const lineEnd = nextBreak === -1 ? body.length : nextBreak;
		const block = body
			.slice(lineStart, lineEnd)
			.split('\n')
			.map((line, i) => (numbered ? `${i + 1}. ` : prefix) + line)
			.join('\n');
		body = body.slice(0, lineStart) + block + body.slice(lineEnd);
		await tick();
		el.focus();
		el.setSelectionRange(lineStart, lineStart + block.length);
	}

	// Insert a Markdown link, leaving the URL placeholder selected for quick typing.
	async function insertLink() {
		const el = bodyEl;
		if (!el) return;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const text = body.slice(start, end) || 'Text';
		const placeholder = 'https://';
		body = body.slice(0, start) + `[${text}](${placeholder})` + body.slice(end);
		await tick();
		el.focus();
		const urlStart = start + text.length + 3; // past "[text]("
		el.setSelectionRange(urlStart, urlStart + placeholder.length);
	}

	const mdTools = [
		{ label: 'B', title: 'Fett', cls: 'font-bold', run: () => surround('**') },
		{ label: 'I', title: 'Kursiv', cls: 'italic', run: () => surround('*') },
		{ label: 'H', title: 'Überschrift', cls: 'font-display', run: () => prefixLines('## ') },
		{ label: '• Liste', title: 'Aufzählung', cls: '', run: () => prefixLines('- ') },
		{ label: '1. Liste', title: 'Nummerierte Liste', cls: '', run: () => prefixLines('', true) },
		{ label: '❝', title: 'Zitat', cls: '', run: () => prefixLines('> ') },
		{ label: '🔗', title: 'Link', cls: '', run: insertLink }
	];

	let imageMode = $state<'none' | 'url' | 'upload'>('none');
	let imageUrlInput = $state('');
	let uploadedDataUrl = $state('');
	let uploadName = $state('');
	let uploadError = $state('');
	let processing = $state(false);
	let step = $state(0);

	const effectiveImageUrl = $derived(
		imageMode === 'url' ? imageUrlInput.trim() : imageMode === 'upload' ? uploadedDataUrl : ''
	);
	const previewImage = $derived(effectiveImageUrl || '');

	const liveCount = $derived(data.popups.filter((p) => p.active).length);
	const editingActive = $derived(
		editingId != null && data.popups.some((p) => p.id === editingId && p.active)
	);

	function openEditor(popup: PopupItem | null) {
		editingId = popup?.id ?? null;
		title = popup?.title ?? '';
		body = popup?.body ?? '';
		badge = popup?.badge ?? '';
		ctaLabel = popup?.ctaLabel ?? '';
		ctaUrl = popup?.ctaUrl ?? '';

		const img = popup?.imageUrl ?? '';
		const isData = img.startsWith('data:');
		imageMode = img ? (isData ? 'upload' : 'url') : 'none';
		imageUrlInput = isData ? '' : img;
		uploadedDataUrl = isData ? img : '';
		uploadName = isData ? 'Saved image' : '';
		uploadError = '';
		processing = false;
		step = 0;
		view = 'editor';
	}

	function backToList() {
		view = 'list';
		editingId = null;
	}

	// ── Wizard steps ───────────────────────────────────────────────────────────
	const steps = [
		{ id: 'content', label: 'Content' },
		{ id: 'image', label: 'Image' },
		{ id: 'cta', label: 'Button' },
		{ id: 'review', label: 'Review' }
	];

	const titleValid = $derived(title.trim().length > 0);
	const canAdvance = $derived(step !== 0 || titleValid);

	function next() {
		if (step < steps.length - 1 && canAdvance) step += 1;
	}
	function back() {
		if (step > 0) step -= 1;
	}
	function goTo(target: number) {
		// Only allow jumping forward once the title (the one required field) exists.
		if (target <= step || titleValid) step = target;
	}

	// ── Device image upload → downscaled, compact data URL ───────────────────────
	// Kept well under the request body limit by capping dimensions and stepping the
	// quality down until the encoded string is small enough to store inline.
	const MAX_DIMENSION = 1280;
	const TARGET_BYTES = 280_000;

	function readFile(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error('Could not read file'));
			reader.readAsDataURL(file);
		});
	}

	function loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error('Could not load image'));
			img.src = src;
		});
	}

	function encode(canvas: HTMLCanvasElement): string {
		// Prefer WebP (much smaller); fall back to JPEG where WebP is unsupported.
		let quality = 0.85;
		let webp = canvas.toDataURL('image/webp', quality);
		const useWebp = webp.startsWith('data:image/webp');
		const type = useWebp ? 'image/webp' : 'image/jpeg';
		let out = useWebp ? webp : canvas.toDataURL(type, quality);
		while (out.length > TARGET_BYTES && quality > 0.4) {
			quality -= 0.1;
			out = canvas.toDataURL(type, quality);
		}
		return out;
	}

	async function downscale(file: File): Promise<string> {
		const original = await readFile(file);
		const img = await loadImage(original);
		let width = img.naturalWidth;
		let height = img.naturalHeight;
		const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
		width = Math.max(1, Math.round(width * scale));
		height = Math.max(1, Math.round(height * scale));

		// If still too large after quality stepping, shrink the canvas and retry.
		for (let attempt = 0; attempt < 4; attempt += 1) {
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');
			if (!ctx) return original;
			ctx.drawImage(img, 0, 0, width, height);
			const out = encode(canvas);
			if (out.length <= TARGET_BYTES || (width <= 480 && height <= 480)) return out;
			width = Math.round(width * 0.8);
			height = Math.round(height * 0.8);
		}
		return original;
	}

	async function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		uploadError = '';
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			uploadError = 'Please choose an image file.';
			return;
		}
		processing = true;
		try {
			uploadedDataUrl = await downscale(file);
			uploadName = file.name;
		} catch {
			uploadError = 'Could not process that image. Try a different file.';
			uploadedDataUrl = '';
			uploadName = '';
		} finally {
			processing = false;
		}
	}

	function clearUpload() {
		uploadedDataUrl = '';
		uploadName = '';
		uploadError = '';
	}

	// ── Action feedback ──────────────────────────────────────────────────────────
	let saving = $state(false);
	let toast = $state('');
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	function showToast(message: string) {
		toast = message;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = ''), 4000);
	}

	function fmtDate(iso: string): string {
		return new Date(iso).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head><title>Popup – Saraylı Döner Admin</title></svelte:head>

<!-- Top nav bar (matches other admin pages) -->
<nav class="border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
		<h1 class="font-display text-xl text-crimson">
			Saraylı Döner <span class="font-body text-sm font-normal text-gray-400">— Popup</span>
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
	{#if toast}
		<div
			class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 font-body text-sm text-emerald-700"
		>
			{toast}
		</div>
	{/if}
	{#if form?.error}
		<div
			class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700"
		>
			{form.error}
		</div>
	{/if}

	{#if view === 'list'}
		<!-- ── List of saved popups ───────────────────────────────────────────── -->
		<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h2 class="font-display text-2xl font-bold text-gray-800">Popups</h2>
				<p class="mt-1 font-body text-sm text-gray-500">
					{#if data.popups.length === 0}
						Create a popup and publish it when you're ready.
					{:else if liveCount > 0}
						One popup is live. Saving several lets you switch between them anytime.
					{:else}
						{data.popups.length}
						{data.popups.length === 1 ? 'draft' : 'drafts'} saved — none are live right now.
					{/if}
				</p>
			</div>
			<button
				type="button"
				onclick={() => openEditor(null)}
				class="rounded-lg bg-crimson px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition-colors hover:bg-crimson-dark"
			>
				+ New popup
			</button>
		</div>

		{#if data.popups.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center"
			>
				<span class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cream">
					<svg class="h-6 w-6 text-crimson" viewBox="0 0 20 20" fill="currentColor">
						<path
							d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
						/>
					</svg>
				</span>
				<h3 class="font-display text-lg text-gray-800">No popups yet</h3>
				<p class="mt-1 mb-4 max-w-sm font-body text-sm text-gray-500">
					Build an announcement, offer or notice. Save as many drafts as you like and publish one at
					a time.
				</p>
				<button
					type="button"
					onclick={() => openEditor(null)}
					class="rounded-lg bg-crimson px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition-colors hover:bg-crimson-dark"
				>
					Create your first popup
				</button>
			</div>
		{:else}
			<ul class="space-y-3">
				{#each data.popups as popup (popup.id)}
					<li
						class="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center {popup.active
							? 'border-emerald-200 ring-1 ring-emerald-100'
							: 'border-gray-100'}"
					>
						<!-- Thumbnail -->
						<div
							class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
						>
							{#if popup.imageUrl}
								<img src={popup.imageUrl} alt="" class="h-full w-full object-cover" />
							{:else}
								<div class="flex h-full w-full items-center justify-center text-gray-300">
									<svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
							{/if}
						</div>

						<!-- Title + meta -->
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-2">
								<span class="truncate font-display text-lg font-semibold text-gray-800">
									{popup.title.trim() || 'Untitled popup'}
								</span>
								{#if popup.active}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-body text-xs font-bold tracking-wide text-emerald-700 uppercase"
									>
										<span class="relative flex h-2 w-2">
											<span
												class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
											></span>
											<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
										</span>
										Live
									</span>
								{:else}
									<span
										class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 font-body text-xs font-bold tracking-wide text-amber-700 uppercase"
									>
										Draft
									</span>
								{/if}
								{#if popup.badge}
									<span
										class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-body text-xs text-gray-500"
									>
										{popup.badge}
									</span>
								{/if}
							</div>
							<p class="mt-1 truncate font-body text-sm text-gray-500">
								{popup.body?.trim() || 'No description'}
							</p>
							<p class="mt-0.5 font-body text-xs text-gray-400">
								Updated {fmtDate(popup.updatedAt)}
							</p>
						</div>

						<!-- Actions -->
						<div class="flex flex-shrink-0 flex-wrap items-center gap-2">
							{#if popup.active}
								<form
									method="POST"
									action="?/takeDown"
									use:enhance={() => {
										saving = true;
										return async ({ update }) => {
											await update();
											saving = false;
											showToast('Popup taken down — it is no longer shown to visitors.');
										};
									}}
								>
									<input type="hidden" name="id" value={popup.id} />
									<button
										type="submit"
										disabled={saving}
										class="rounded-lg border border-red-200 bg-white px-3.5 py-2 font-body text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
									>
										Take down
									</button>
								</form>
							{:else}
								<form
									method="POST"
									action="?/activate"
									use:enhance={() => {
										saving = true;
										return async ({ update }) => {
											await update();
											saving = false;
											showToast('Popup published — it is now live for visitors.');
										};
									}}
								>
									<input type="hidden" name="id" value={popup.id} />
									<button
										type="submit"
										disabled={saving}
										class="rounded-lg bg-crimson px-3.5 py-2 font-body text-sm font-semibold text-white shadow-sm transition-colors hover:bg-crimson-dark disabled:opacity-50"
									>
										Publish
									</button>
								</form>
							{/if}
							<button
								type="button"
								onclick={() => openEditor(popup)}
								class="rounded-lg border border-gray-300 px-3.5 py-2 font-body text-sm font-semibold text-gray-600 transition-colors hover:border-crimson hover:text-crimson"
							>
								Edit
							</button>
							<form
								method="POST"
								action="?/delete"
								use:enhance={({ cancel }) => {
									const what = popup.active ? 'the live popup' : 'this draft';
									if (!confirm(`Delete ${what} permanently? This cannot be undone.`)) {
										cancel();
										return;
									}
									saving = true;
									return async ({ update }) => {
										await update();
										saving = false;
										showToast('Popup deleted.');
									};
								}}
							>
								<input type="hidden" name="id" value={popup.id} />
								<button
									type="submit"
									disabled={saving}
									aria-label="Delete popup"
									class="rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
								>
									<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
											clip-rule="evenodd"
										/>
									</svg>
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{:else}
		<!-- ── Editor (wizard) ────────────────────────────────────────────────── -->
		<div class="mb-4 flex items-center justify-between gap-4">
			<button
				type="button"
				onclick={backToList}
				class="inline-flex items-center gap-1.5 font-body text-sm text-gray-500 transition-colors hover:text-crimson"
			>
				&larr; All popups
			</button>
			<span class="font-display text-lg text-gray-800">
				{editingId == null ? 'New popup' : editingActive ? 'Edit live popup' : 'Edit popup'}
			</span>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
			<!-- Wizard -->
			<div class="lg:col-span-3">
				<div class="rounded-xl border border-gray-100 bg-white shadow-sm">
					<!-- Stepper -->
					<div class="flex items-center gap-1 border-b border-gray-100 px-4 py-4 sm:px-6">
						{#each steps as s, i}
							<button
								type="button"
								onclick={() => goTo(i)}
								class="flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-body text-sm font-medium transition-colors {i ===
								step
									? 'text-crimson'
									: i < step
										? 'text-gray-600 hover:text-crimson'
										: 'text-gray-400'}"
							>
								<span
									class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold {i ===
									step
										? 'bg-crimson text-white'
										: i < step
											? 'bg-crimson/10 text-crimson'
											: 'bg-gray-100 text-gray-400'}"
								>
									{i + 1}
								</span>
								<span class="hidden sm:inline">{s.label}</span>
							</button>
							{#if i < steps.length - 1}
								<span class="h-px flex-1 bg-gray-100"></span>
							{/if}
						{/each}
					</div>

					<div class="p-4 sm:p-6">
						<!-- Step 1: Content -->
						{#if step === 0}
							<div class="space-y-5">
								<div>
									<label
										for="f-title"
										class="mb-1.5 block font-body text-sm font-medium text-gray-700"
									>
										Header <span class="text-crimson">*</span>
									</label>
									<input
										id="f-title"
										type="text"
										bind:value={title}
										maxlength="120"
										placeholder="z.B. Neue Öffnungszeiten"
										class="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
									/>
									<p class="mt-1 font-body text-xs text-gray-400">{title.length}/120</p>
								</div>
								<div>
									<label
										for="f-body"
										class="mb-1.5 block font-body text-sm font-medium text-gray-700"
									>
										Description
									</label>
									<div
										class="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 p-1"
									>
										{#each mdTools as tool (tool.label)}
											<button
												type="button"
												title={tool.title}
												aria-label={tool.title}
												onclick={tool.run}
												class="rounded px-2 py-1 font-body text-sm text-gray-600 transition-colors hover:bg-white hover:text-crimson {tool.cls}"
											>
												{tool.label}
											</button>
										{/each}
									</div>
									<textarea
										id="f-body"
										bind:this={bodyEl}
										bind:value={body}
										rows="5"
										maxlength="2000"
										placeholder="Tell visitors what's new — an offer, a notice, opening hours…"
										class="w-full rounded-b-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
									></textarea>
									<p class="mt-1 font-body text-xs text-gray-400">
										Markdown wird unterstützt — **fett**, *kursiv*, Listen und Links. Die Vorschau
										rechts zeigt das Ergebnis.
									</p>
								</div>
								<div>
									<label
										for="f-badge"
										class="mb-1.5 block font-body text-sm font-medium text-gray-700"
									>
										Badge <span class="font-normal text-gray-400"
											>(optional, small label above the header)</span
										>
									</label>
									<input
										id="f-badge"
										type="text"
										bind:value={badge}
										maxlength="40"
										placeholder="z.B. Neu · Angebot · Hinweis"
										class="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
									/>
								</div>
							</div>

							<!-- Step 2: Image -->
						{:else if step === 1}
							<div class="space-y-5">
								<p class="font-body text-sm text-gray-500">
									Add an image (optional). Choose a source:
								</p>
								<div class="grid grid-cols-3 gap-2">
									{#each [{ v: 'none', l: 'No image' }, { v: 'url', l: 'From URL' }, { v: 'upload', l: 'From device' }] as opt}
										<button
											type="button"
											onclick={() => (imageMode = opt.v as typeof imageMode)}
											class="rounded-lg border px-3 py-2.5 font-body text-sm font-semibold transition-colors {imageMode ===
											opt.v
												? 'border-crimson bg-crimson text-white'
												: 'border-gray-200 bg-white text-gray-700 hover:border-crimson/40'}"
										>
											{opt.l}
										</button>
									{/each}
								</div>

								{#if imageMode !== 'none'}
									<p class="font-body text-xs text-gray-400">
										Best results with a wide image, ratio ≈ 5:2 (e.g. 1000 × 400 px).
										Images are cropped to fill, so keep the subject centered.
									</p>
								{/if}

								{#if imageMode === 'url'}
									<div>
										<label
											for="f-imgurl"
											class="mb-1.5 block font-body text-sm font-medium text-gray-700"
										>
											Image URL
										</label>
										<input
											id="f-imgurl"
											type="url"
											bind:value={imageUrlInput}
											placeholder="https://…/image.jpg"
											class="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
										/>
									</div>
								{:else if imageMode === 'upload'}
									<div>
										<label
											class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-crimson/40 hover:bg-cream/40"
										>
											<svg class="h-7 w-7 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
												<path
													fill-rule="evenodd"
													d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
													clip-rule="evenodd"
												/>
											</svg>
											<span class="font-body text-sm font-medium text-gray-600">
												{processing ? 'Processing…' : 'Click to choose an image'}
											</span>
											<span class="font-body text-xs text-gray-400">
												JPG, PNG or WebP — automatically resized for the web
											</span>
											<input
												type="file"
												accept="image/*"
												class="hidden"
												onchange={onFileChange}
												disabled={processing}
											/>
										</label>
										{#if uploadName && uploadedDataUrl}
											<p class="mt-2 flex items-center gap-2 font-body text-xs text-gray-500">
												<span class="truncate">{uploadName}</span>
												<button
													type="button"
													onclick={clearUpload}
													class="text-crimson hover:underline">Remove</button
												>
											</p>
										{/if}
										{#if uploadError}
											<p class="mt-2 font-body text-xs text-red-600">{uploadError}</p>
										{/if}
									</div>
								{/if}

								{#if previewImage}
									<div class="overflow-hidden rounded-lg border border-gray-100">
										<img src={previewImage} alt="Preview" class="max-h-56 w-full object-cover" />
									</div>
								{/if}
							</div>

							<!-- Step 3: Call to action -->
						{:else if step === 2}
							<div class="space-y-5">
								<p class="font-body text-sm text-gray-500">
									Add an optional button. Leave the link empty for an info-only popup.
								</p>
								<div>
									<label
										for="f-ctalabel"
										class="mb-1.5 block font-body text-sm font-medium text-gray-700"
									>
										Button label
									</label>
									<input
										id="f-ctalabel"
										type="text"
										bind:value={ctaLabel}
										maxlength="60"
										placeholder="z.B. Zur Speisekarte"
										class="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
									/>
								</div>
								<div>
									<label
										for="f-ctaurl"
										class="mb-1.5 block font-body text-sm font-medium text-gray-700"
									>
										Button link
									</label>
									<input
										id="f-ctaurl"
										type="text"
										bind:value={ctaUrl}
										placeholder="https://…  ·  /order  ·  #menu"
										class="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-800 focus:border-crimson focus:ring-0"
									/>
									<div class="mt-2 flex flex-wrap gap-1.5">
										{#each ['#menu', '#gallery', '/order/status'] as suggestion}
											<button
												type="button"
												onclick={() => (ctaUrl = suggestion)}
												class="rounded-full border border-gray-200 px-2.5 py-0.5 font-body text-xs text-gray-500 transition-colors hover:border-crimson hover:text-crimson"
											>
												{suggestion}
											</button>
										{/each}
									</div>
								</div>
							</div>

							<!-- Step 4: Review -->
						{:else}
							<div class="space-y-4">
								<h3 class="font-display text-lg text-gray-800">Review & save</h3>
								<p class="font-body text-sm text-gray-500">
									This is exactly how the popup will appear to visitors. Publish it to make it live,
									or save it as a hidden draft.
								</p>
								<ul class="space-y-1.5 font-body text-sm text-gray-600">
									<li class="flex gap-2">
										<span class="text-gray-400">Header:</span>
										<span class="font-medium {titleValid ? 'text-gray-800' : 'text-red-600'}">
											{title.trim() || 'Missing — required'}
										</span>
									</li>
									<li class="flex gap-2">
										<span class="text-gray-400">Image:</span>
										{previewImage ? 'Yes' : 'None'}
									</li>
									<li class="flex gap-2">
										<span class="text-gray-400">Button:</span>
										{ctaUrl.trim() ? `${ctaLabel.trim() || 'Mehr'} → ${ctaUrl.trim()}` : 'None'}
									</li>
								</ul>
							</div>
						{/if}
					</div>

					<!-- Footer nav -->
					<div class="flex items-center justify-between border-t border-gray-100 px-4 py-4 sm:px-6">
						<button
							type="button"
							onclick={back}
							disabled={step === 0}
							class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
						>
							Back
						</button>

						{#if step < steps.length - 1}
							<button
								type="button"
								onclick={next}
								disabled={!canAdvance}
								class="rounded-lg bg-crimson px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark disabled:cursor-not-allowed disabled:opacity-40"
							>
								Next
							</button>
						{:else}
							<!-- Save / publish forms carry the full content as hidden fields -->
							<div class="flex items-center gap-2">
								<form
									method="POST"
									action="?/save"
									use:enhance={() => {
										saving = true;
										return async ({ result, update }) => {
											await update({ reset: false });
											saving = false;
											if (result.type === 'success') {
												showToast(editingId == null ? 'Draft saved.' : 'Changes saved.');
												backToList();
											}
										};
									}}
								>
									<input type="hidden" name="id" value={editingId ?? ''} />
									<input type="hidden" name="title" value={title} />
									<input type="hidden" name="body" value={body} />
									<input type="hidden" name="imageUrl" value={effectiveImageUrl} />
									<input type="hidden" name="badge" value={badge} />
									<input type="hidden" name="ctaLabel" value={ctaLabel} />
									<input type="hidden" name="ctaUrl" value={ctaUrl} />
									<button
										type="submit"
										disabled={saving || !titleValid}
										class="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm font-semibold text-gray-600 transition-colors hover:border-crimson hover:text-crimson disabled:cursor-not-allowed disabled:opacity-40"
									>
										{editingId == null ? 'Save as draft' : 'Save changes'}
									</button>
								</form>

								{#if editingActive}
									<form
										method="POST"
										action="?/takeDown"
										use:enhance={() => {
											saving = true;
											return async ({ result, update }) => {
												await update();
												saving = false;
												if (result.type === 'success') {
													showToast('Popup taken down — it is no longer shown to visitors.');
													backToList();
												}
											};
										}}
									>
										<input type="hidden" name="id" value={editingId ?? ''} />
										<button
											type="submit"
											disabled={saving}
											class="rounded-lg border border-red-200 bg-white px-5 py-2 font-body text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
										>
											Take down
										</button>
									</form>
								{:else}
									<form
										method="POST"
										action="?/publish"
										use:enhance={() => {
											saving = true;
											return async ({ result, update }) => {
												await update({ reset: false });
												saving = false;
												if (result.type === 'success') {
													showToast('Popup published — it is now live for visitors.');
													backToList();
												}
											};
										}}
									>
										<input type="hidden" name="id" value={editingId ?? ''} />
										<input type="hidden" name="title" value={title} />
										<input type="hidden" name="body" value={body} />
										<input type="hidden" name="imageUrl" value={effectiveImageUrl} />
										<input type="hidden" name="badge" value={badge} />
										<input type="hidden" name="ctaLabel" value={ctaLabel} />
										<input type="hidden" name="ctaUrl" value={ctaUrl} />
										<button
											type="submit"
											disabled={saving || !titleValid}
											class="rounded-lg bg-crimson px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition-colors hover:bg-crimson-dark disabled:cursor-not-allowed disabled:opacity-40"
										>
											Publish
										</button>
									</form>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Live preview -->
			<div class="lg:col-span-2">
				<div class="sticky top-6">
					<p class="mb-2 font-body text-xs font-semibold tracking-wider text-gray-400 uppercase">
						Live preview
					</p>
					<div class="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-6">
						<div
							class="popup-card relative w-full overflow-hidden rounded-2xl border-2 border-gold/30 bg-gradient-to-br from-cream via-white to-cream shadow-2xl"
						>
							<div class="h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light"></div>
							<span
								class="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm"
								aria-hidden="true"
							>
								<svg
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</span>
							{#if previewImage}
								<img src={previewImage} alt="" class="h-40 w-full object-cover" />
							{/if}
							<div class="px-6 pt-5 pb-6">
								{#if badge.trim()}
									<div class="mb-3 flex justify-center">
										<span
											class="inline-flex items-center rounded-full bg-crimson px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase shadow-lg shadow-crimson/20"
										>
											{badge.trim()}
										</span>
									</div>
								{/if}
								<h2 class="text-center font-display text-2xl font-bold text-crimson">
									{title.trim() || 'Your header'}
								</h2>
								{#if bodyPreviewHtml}
									<div
										class="prose prose-sm mt-2 max-w-none text-center font-body leading-relaxed text-gray-600 prose-headings:font-display prose-headings:text-crimson prose-a:text-crimson prose-ol:list-inside prose-ol:pl-0 prose-ul:list-inside prose-ul:pl-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
									>
										<!-- eslint-disable-next-line svelte/no-at-html-tags -- admin's own trusted preview; published copy is sanitised server-side in $lib/server/markdown -->
										{@html bodyPreviewHtml}
									</div>
								{/if}
								{#if ctaUrl.trim()}
									<div class="mt-5 flex justify-center">
										<span
											class="inline-flex items-center justify-center gap-2 rounded-xl bg-crimson px-8 py-3 font-body text-base font-bold text-white shadow-lg shadow-crimson/25"
										>
											{ctaLabel.trim() || 'Mehr erfahren'}
										</span>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
