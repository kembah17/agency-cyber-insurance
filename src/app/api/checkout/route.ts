import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { priceId, mode } = (await request.json()) as {
      priceId: string;
      mode: 'payment' | 'subscription';
    };

    const origin = new URL(request.url).origin;

    const session = await getStripeServer().checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
