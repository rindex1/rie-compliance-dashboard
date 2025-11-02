import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan || 'standard';

      if (!userId) {
        console.error('No userId in session metadata');
        return NextResponse.json(
          { error: 'Missing userId in metadata' },
          { status: 400 }
        );
      }

      if (!prisma) {
        console.error('Prisma not initialized');
        return NextResponse.json(
          { error: 'Database not available' },
          { status: 500 }
        );
      }

      // Auto-assign license on successful payment
      try {
        await prisma.license.upsert({
          where: { userId },
          update: {
            plan,
            status: 'ACTIVE',
            expiresAt: null, // No expiry for subscription
          },
          create: {
            userId,
            plan,
            status: 'ACTIVE',
          },
        });

        console.log(`License assigned to user ${userId} after payment`);
      } catch (error) {
        console.error('Error assigning license:', error);
        return NextResponse.json(
          { error: 'Failed to assign license' },
          { status: 500 }
        );
      }
    }

    // Handle subscription events (for renewals, cancellations, etc.)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      // Handle subscription updates if needed
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      // Handle subscription cancellation - set license to INACTIVE or EXPIRED
      // You may want to store Stripe customer_id in the database for this
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

