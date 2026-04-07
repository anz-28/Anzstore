import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

export const getStripeClient = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');
  }
  return stripePromise;
};
