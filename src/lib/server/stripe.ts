import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

if (!env.STRIPE_SECRET_KEY) {
	throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export function getStripePublishableKey(): string {
	const key = env.STRIPE_PUBLISHABLE_KEY;
	if (!key) {
		throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is not set');
	}

	return key;
}
