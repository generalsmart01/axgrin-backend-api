# Admin Subscription Configuration

## Overview

Admins can now manage subscription prices and trial days through dedicated API endpoints. This allows dynamic configuration of subscription plans without code changes.

## Database Schema

A new `SubscriptionConfig` model stores configuration for each subscription plan:

- **plan**: Subscription plan type (MONTHLY, YEARLY)
- **stripePriceId**: Stripe Price ID for the plan
- **price**: Price in USD (for display/reference)
- **currency**: Currency code (default: USD)
- **trialDays**: Number of trial days (0-365)
- **isActive**: Whether the plan is currently active
- **description**: Optional plan description

## Admin Endpoints

All endpoints require **ADMIN** role and are prefixed with `/admin/subscription-config`.

### 1. Create or Update Configuration

**POST** `/admin/subscription-config`

Create or update subscription configuration for a plan.

**Request Body:**
```json
{
  "plan": "MONTHLY",
  "stripePriceId": "price_1234567890",
  "price": 9.99,
  "currency": "USD",
  "trialDays": 7,
  "description": "Monthly premium subscription with all features",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "clx123...",
  "plan": "MONTHLY",
  "stripePriceId": "price_1234567890",
  "price": 9.99,
  "currency": "USD",
  "trialDays": 7,
  "isActive": true,
  "description": "Monthly premium subscription with all features",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Get All Configurations

**GET** `/admin/subscription-config`

Retrieve all subscription configurations.

**Response:**
```json
[
  {
    "id": "clx123...",
    "plan": "MONTHLY",
    "stripePriceId": "price_1234567890",
    "price": 9.99,
    "currency": "USD",
    "trialDays": 7,
    "isActive": true,
    "description": "Monthly premium subscription",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "clx456...",
    "plan": "YEARLY",
    "stripePriceId": "price_0987654321",
    "price": 99.99,
    "currency": "USD",
    "trialDays": 14,
    "isActive": true,
    "description": "Yearly premium subscription",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 3. Get Configuration by Plan

**GET** `/admin/subscription-config/:plan`

Retrieve configuration for a specific plan (MONTHLY or YEARLY).

**Example:**
```
GET /admin/subscription-config/MONTHLY
```

**Response:**
```json
{
  "id": "clx123...",
  "plan": "MONTHLY",
  "stripePriceId": "price_1234567890",
  "price": 9.99,
  "currency": "USD",
  "trialDays": 7,
  "isActive": true,
  "description": "Monthly premium subscription",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Update Configuration

**PUT** `/admin/subscription-config/:plan`

Update subscription configuration for a specific plan. Only provided fields will be updated.

**Request Body:**
```json
{
  "price": 12.99,
  "trialDays": 14,
  "isActive": true
}
```

**Response:**
```json
{
  "id": "clx123...",
  "plan": "MONTHLY",
  "stripePriceId": "price_1234567890",
  "price": 12.99,
  "currency": "USD",
  "trialDays": 14,
  "isActive": true,
  "description": "Monthly premium subscription",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

### 5. Delete Configuration

**DELETE** `/admin/subscription-config/:plan`

Delete subscription configuration for a plan.

**Response:**
```json
{
  "message": "Subscription config for MONTHLY plan deleted successfully"
}
```

## Usage Examples

### Initial Setup

1. **Create Monthly Plan Configuration:**
```bash
curl -X POST http://localhost:3300/admin/subscription-config \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "MONTHLY",
    "stripePriceId": "price_1234567890",
    "price": 9.99,
    "trialDays": 7,
    "description": "Monthly premium subscription"
  }'
```

2. **Create Yearly Plan Configuration:**
```bash
curl -X POST http://localhost:3300/admin/subscription-config \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "YEARLY",
    "stripePriceId": "price_0987654321",
    "price": 99.99,
    "trialDays": 14,
    "description": "Yearly premium subscription"
  }'
```

### Update Pricing

**Change Monthly Price:**
```bash
curl -X PUT http://localhost:3300/admin/subscription-config/MONTHLY \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 12.99,
    "stripePriceId": "price_new_monthly_price"
  }'
```

**Change Trial Days:**
```bash
curl -X PUT http://localhost:3300/admin/subscription-config/MONTHLY \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "trialDays": 14
  }'
```

### Temporarily Disable a Plan

```bash
curl -X PUT http://localhost:3300/admin/subscription-config/MONTHLY \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

## Integration with Payment System

The payment service automatically uses the subscription configuration when creating checkout sessions:

1. **Price ID**: Retrieved from `SubscriptionConfig.stripePriceId`
2. **Trial Period**: Automatically applied if `trialDays > 0`
3. **Validation**: Only active plans can be used for checkout

### How It Works

When a user initiates a checkout:

1. Payment service calls `SubscriptionConfigService.getActiveConfigByPlan(plan)`
2. If config exists and is active, uses `config.stripePriceId` for Stripe checkout
3. If `config.trialDays > 0`, adds trial period to subscription
4. If config doesn't exist or is inactive, returns error

## Important Notes

1. **Stripe Price IDs**: You must create the prices in Stripe Dashboard first, then use the Price ID here
2. **Trial Days**: Trial period is calculated from the checkout date. Users get full access during trial
3. **Active Status**: Inactive plans cannot be used for new subscriptions, but existing subscriptions continue
4. **Price Updates**: Changing the price in config doesn't affect existing subscriptions. Only new subscriptions use the new price
5. **Stripe Sync**: If you change the Stripe Price ID, make sure the new price exists in Stripe

## Validation Rules

- **plan**: Must be MONTHLY or YEARLY
- **stripePriceId**: Required, must be a valid Stripe Price ID
- **price**: Must be >= 0
- **trialDays**: Must be between 0 and 365
- **currency**: Optional, defaults to "USD"
- **isActive**: Optional, defaults to true

## Error Responses

### Configuration Not Found
```json
{
  "statusCode": 404,
  "message": "Subscription config for plan MONTHLY not found",
  "error": "Not Found"
}
```

### Plan Not Configured (during checkout)
```json
{
  "statusCode": 400,
  "message": "Subscription plan MONTHLY is not configured or is inactive",
  "error": "Bad Request"
}
```

### Invalid Input
```json
{
  "statusCode": 400,
  "message": [
    "trialDays must not be greater than 365",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

## Best Practices

1. **Always configure both plans**: Set up both MONTHLY and YEARLY configurations
2. **Test before activating**: Create configs with `isActive: false`, test, then activate
3. **Update Stripe first**: Create/update prices in Stripe Dashboard before updating config
4. **Monitor trial usage**: Track trial signups to optimize trial period length
5. **Version control**: Consider logging configuration changes for audit purposes

