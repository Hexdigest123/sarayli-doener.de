<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { cart } from '$lib/stores/cart.svelte';

	let { open, onclose }: { open: boolean; onclose: () => void } = $props();

	const msg: Record<string, () => string> = {};
	for (const [key, fn] of Object.entries(m)) {
		if (typeof fn === 'function') {
			msg[key] = fn as () => string;
		}
	}

	const formatPrice = (price: number) => `${price.toFixed(2).replace('.', ',')} €`;
</script>

	<div
		class={`fixed inset-0 z-[70] transition-opacity duration-300 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
		role="dialog"
		aria-modal="true"
		aria-label="Cart"
	>
		<button
			class={`absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
			onclick={onclose}
			aria-label={msg.cart_close?.() ?? 'Close cart'}
			tabindex={open ? 0 : -1}
		></button>

		<aside
			class={`absolute top-0 right-0 h-full w-full max-w-md transform bg-cream shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
		>
			<div class="flex h-full flex-col">
				<div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
					<h2 class="font-display text-2xl font-bold text-crimson">
						{msg.cart_title?.() ?? 'Warenkorb'}
					</h2>
					<button
						onclick={onclose}
						class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white hover:text-crimson"
						aria-label={msg.cart_close?.() ?? 'Close cart'}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
					{#if cart.isEmpty}
						<div class="flex h-full items-center justify-center">
							<p class="font-body text-sm text-gray-600">
								{msg.cart_empty?.() ?? 'Your cart is empty'}
							</p>
						</div>
					{:else}
						<div class="space-y-3">
							{#each cart.items as item}
								<div class="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<p class="font-body text-sm font-semibold text-gray-900">
												{msg[item.nameKey]?.() ?? item.nameKey}
											</p>
											{#if item.sizeKey}
												<p class="font-body text-xs text-gray-500">{msg[item.sizeKey]?.() ?? item.sizeKey}</p>
											{/if}
										</div>
										<button
											onclick={() => cart.removeItem(item.menuItemId, item.sizeKey)}
											class="rounded-md p-1 text-gray-400 transition-colors hover:bg-cream-dark hover:text-crimson"
											aria-label={msg.cart_remove?.() ?? 'Remove item'}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.8"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-5-3h4a1 1 0 011 1v2H9V5a1 1 0 011-1z"
												/>
											</svg>
										</button>
									</div>

									<div class="mt-3 flex items-center justify-between">
										<div class="flex items-center rounded-lg border border-gray-100 bg-cream-dark p-1">
											<button
												onclick={() => cart.updateQuantity(item.menuItemId, item.quantity - 1, item.sizeKey)}
												class="flex h-7 w-7 items-center justify-center rounded-md text-lg leading-none text-gray-700 transition-colors hover:bg-white hover:text-crimson"
												aria-label={msg.cart_decrease?.() ?? 'Decrease quantity'}
											>
												-
											</button>
											<span class="w-8 text-center font-body text-sm font-semibold text-gray-800">{item.quantity}</span>
											<button
												onclick={() => cart.updateQuantity(item.menuItemId, item.quantity + 1, item.sizeKey)}
												class="flex h-7 w-7 items-center justify-center rounded-md text-lg leading-none text-gray-700 transition-colors hover:bg-white hover:text-crimson"
												aria-label={msg.cart_increase?.() ?? 'Increase quantity'}
											>
												+
											</button>
										</div>

										<div class="text-right">
											<p class="font-body text-xs text-gray-500">{formatPrice(item.price)}</p>
											<p class="font-body text-sm font-bold text-crimson">
												{formatPrice(item.price * item.quantity)}
											</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="border-t border-gray-100 bg-white px-5 py-4">
					<div class="mb-3 flex items-center justify-between">
						<span class="font-body text-sm text-gray-600">{msg.cart_total?.() ?? 'Total'}</span>
						<span class="font-display text-xl font-bold text-crimson">{formatPrice(cart.totalPrice)}</span>
					</div>
					<a
						href="/checkout"
						class="inline-flex w-full items-center justify-center rounded-lg bg-crimson px-4 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
						onclick={onclose}
					>
						{msg.cart_checkout?.() ?? msg.checkout_pay_now?.() ?? 'Checkout'}
					</a>
				</div>
			</div>
		</aside>
	</div>
