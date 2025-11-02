# Stripe Payment Integration Setup

## Overview

The app now uses Stripe for payment processing. Users can:
1. Register themselves
2. Complete payment via Stripe
3. Automatically receive a license after successful payment
4. Login and access the dashboard

## Setup Steps

### 1. Create Stripe Account

1. Go to https://stripe.com
2. Sign up for an account
3. Complete account setup

### 2. Get Stripe API Keys

**Test Mode (for development):**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

**Production Mode:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy production keys (same format but `pk_live_...` and `sk_live_...`)

### 3. Set Up Webhook

**For Local Development (using Stripe CLI):**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/payment/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_...`)

**For Production (Vercel):**

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-app.vercel.app/api/payment/webhook`
4. Events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret

### 4. Configure Environment Variables

**Local (.env.local):**
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # From Stripe CLI or dashboard
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Vercel Production:**
Add in Vercel Dashboard → Settings → Environment Variables:
- `STRIPE_SECRET_KEY` = `sk_live_...`
- `STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (optional, if needed for client-side)
- `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from Stripe dashboard)
- `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`

### 5. Update Payment Amount

Edit `src/app/api/payment/create-checkout/route.ts`:

```typescript
unit_amount: 49900, // €499.00 in cents - change this to your price
```

## How It Works

### Registration Flow:

1. **User registers** at `/register`
   - Creates account and company
   - No license assigned yet

2. **Redirect to Stripe Checkout**
   - Creates Stripe checkout session
   - Passes `userId` in metadata
   - Redirects to Stripe payment page

3. **Payment Success**
   - Stripe sends webhook to `/api/payment/webhook`
   - Webhook handler extracts `userId` from metadata
   - Automatically creates license with status `ACTIVE`
   - User redirected to `/payment/success`

4. **User Login**
   - Can now login (license validation passes)
   - Access dashboard

### Webhook Events Handled:

- `checkout.session.completed` - Assigns license on payment
- `customer.subscription.updated` - Handle subscription changes
- `customer.subscription.deleted` - Handle cancellations (set license to INACTIVE)

## Testing

### Test Mode:

1. Use Stripe test cards: https://stripe.com/docs/testing
2. Example test card: `4242 4242 4242 4242`
3. Any future expiry date, any CVC
4. Use Stripe CLI to forward webhooks locally

### Test Flow:

1. Register a user
2. Complete payment with test card
3. Check webhook logs: `stripe logs tail`
4. Verify license created in database
5. Login with new user credentials

## Troubleshooting

**Webhook not received:**
- Check webhook endpoint is accessible (not behind auth)
- Verify webhook secret matches
- Check Stripe dashboard → Webhooks → Recent events

**License not assigned:**
- Check webhook logs in Stripe dashboard
- Verify `userId` is in checkout session metadata
- Check application logs for errors

**Payment succeeds but can't login:**
- Verify webhook processed successfully
- Check license was created: Query database or admin tool
- Ensure license status is `ACTIVE`

## Price Configuration

Current price: €499/year (subscription)

To change:
1. Edit `unit_amount` in `create-checkout/route.ts` (in cents)
2. Update product name/description
3. Adjust `recurring.interval` if needed (currently 'year')

## Subscription Management

Future enhancements:
- Link Stripe customer_id to User model
- Handle subscription renewals automatically
- Implement cancellation flow
- Add subscription status to user dashboard

