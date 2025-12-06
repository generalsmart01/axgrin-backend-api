# Payment & Subscription Implementation

## ✅ Completed Implementation

### 1. Database Schema
- ✅ Created `Subscription` model in Prisma schema
- ✅ Added `SubscriptionStatus` enum (ACTIVE, CANCELED, PAST_DUE, UNPAID, TRIALING, etc.)
- ✅ Added `SubscriptionPlan` enum (MONTHLY, YEARLY)
- ✅ Migration created and applied

### 2. Stripe Integration
- ✅ Installed Stripe SDK (`stripe` package)
- ✅ Created `PaymentService` with full Stripe integration
- ✅ Configured Stripe checkout sessions
- ✅ Webhook handling for subscription events

### 3. Payment Endpoints

#### User Endpoints
- **`POST /payment/checkout`** - Create checkout session for premium subscription
- **`GET /payment/subscription/status`** - Get current subscription status
- **`POST /payment/subscription/cancel`** - Cancel subscription (at period end)
- **`POST /payment/subscription/reactivate`** - Reactivate canceled subscription
- **`POST /payment/customer-portal`** - Get Stripe customer portal URL

#### Webhook Endpoint
- **`POST /payment/webhook`** - Stripe webhook endpoint (no auth required)

## 📋 API Usage Examples

### Create Checkout Session
```http
POST /payment/checkout
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "plan": "MONTHLY",
  "successUrl": "https://yourapp.com/subscription/success",
  "cancelUrl": "https://yourapp.com/subscription/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### Get Subscription Status
```http
GET /payment/subscription/status
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "hasSubscription": true,
  "isPremium": true,
  "isActive": true,
  "subscription": {
    "id": "clx123...",
    "plan": "MONTHLY",
    "status": "ACTIVE",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "trialEnd": null
  }
}
```

### Cancel Subscription
```http
POST /payment/subscription/cancel
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Subscription will be canceled at the end of the current period"
}
```

### Get Customer Portal
```http
POST /payment/customer-portal
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session_..."
}
```

## 🔐 Environment Variables Required

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret from Stripe dashboard
STRIPE_PRICE_ID_MONTHLY=price_... # Monthly subscription price ID
STRIPE_PRICE_ID_YEARLY=price_... # Yearly subscription price ID

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
```

## 🎯 Stripe Setup Steps

1. **Create Stripe Account**: Sign up at https://stripe.com
2. **Create Products & Prices**:
   - Go to Products in Stripe Dashboard
   - Create "Premium Monthly" product with recurring monthly price
   - Create "Premium Yearly" product with recurring yearly price
   - Copy the Price IDs to your `.env` file

3. **Configure Webhook**:
   - Go to Developers > Webhooks in Stripe Dashboard
   - Add endpoint: `https://yourdomain.com/payment/webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## 🔄 Subscription Flow

1. **User initiates subscription**:
   - Frontend calls `POST /payment/checkout`
   - User is redirected to Stripe checkout page
   - User completes payment

2. **Stripe sends webhook**:
   - `checkout.session.completed` event
   - System creates/updates subscription record
   - User role upgraded to PREMIUM

3. **Ongoing subscription**:
   - Stripe automatically charges user each period
   - `invoice.payment_succeeded` webhook confirms payment
   - Subscription remains ACTIVE

4. **Subscription cancellation**:
   - User calls `POST /payment/subscription/cancel`
   - Subscription marked to cancel at period end
   - User retains PREMIUM access until period ends
   - On period end, user downgraded to USER

## 📊 Subscription Statuses

- **ACTIVE**: Subscription is active and user has PREMIUM access
- **CANCELED**: Subscription was canceled
- **PAST_DUE**: Payment failed, subscription is past due
- **UNPAID**: Payment failed multiple times
- **TRIALING**: User is in trial period
- **INCOMPLETE**: Checkout not completed
- **INCOMPLETE_EXPIRED**: Checkout expired

## 🔒 Security Features

1. **Webhook Signature Verification**: All webhooks are verified using Stripe signature
2. **User Isolation**: Users can only manage their own subscriptions
3. **Automatic Role Management**: Roles are automatically updated based on subscription status
4. **Notification System**: Users receive notifications for subscription events

## 📁 Files Created

1. **`prisma/schema.prisma`** - Added Subscription model
2. **`src/payment/payment.service.ts`** - Payment and subscription logic
3. **`src/payment/payment.controller.ts`** - Payment endpoints
4. **`src/payment/payment-webhook.controller.ts`** - Webhook endpoint (no auth)
5. **`src/payment/payment.module.ts`** - Payment module
6. **`src/payment/dto/create-checkout.dto.ts`** - Checkout DTO
7. **`src/payment/dto/subscription-status.dto.ts`** - Status DTO

## 🚀 Next Steps

1. **Configure Stripe**: Set up products and prices in Stripe dashboard
2. **Add Environment Variables**: Add Stripe keys to `.env`
3. **Test Webhook**: Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3300/payment/webhook`
4. **Configure Raw Body**: Ensure Express is configured to parse raw body for webhooks
5. **Add Payment Methods**: Consider adding support for other payment methods
6. **Subscription Plans**: Add more plan options (quarterly, lifetime, etc.)

## ⚠️ Important Notes

- **Webhook Security**: The webhook endpoint must NOT require authentication
- **Raw Body**: Express must be configured to preserve raw body for webhook signature verification
- **Price IDs**: You must create products and prices in Stripe dashboard first
- **Testing**: Use Stripe test mode keys for development
- **Production**: Switch to live keys and configure production webhook endpoint

## 🧪 Testing with Stripe CLI

```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to localhost:3300/payment/webhook

# In another terminal, trigger test events:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

