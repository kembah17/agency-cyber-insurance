import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = getStripeServer().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      // TODO: Fulfill the order, grant access, send confirmation email
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      console.log('Invoice payment succeeded:', invoice.id);
      // TODO: Update subscription status, send receipt
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log('Invoice payment failed:', invoice.id);
      // TODO: Notify customer, handle grace period
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
