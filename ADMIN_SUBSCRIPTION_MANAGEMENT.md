# Admin Subscription Management

## Overview

Admins can now directly manage user subscriptions through dedicated API endpoints. This allows customer support and administrators to handle subscription issues, upgrades, cancellations, and trial extensions.

## Endpoints

All endpoints require **ADMIN** role and are prefixed with `/admin/subscriptions`.

### 1. Get Subscription by User ID

**GET** `/admin/subscriptions/user/:userId`

Retrieve subscription details for a specific user.

**Example:**
```
GET /admin/subscriptions/user/clx123...
```

**Response:**
```json
{
  "id": "clx456...",
  "userId": "clx123...",
  "stripeCustomerId": "cus_123...",
  "stripeSubscriptionId": "sub_123...",
  "plan": "MONTHLY",
  "status": "ACTIVE",
  "currentPeriodStart": "2024-01-01T00:00:00.000Z",
  "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "trialEnd": null,
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PREMIUM"
  }
}
```

### 2. Get Subscription by ID

**GET** `/admin/subscriptions/:subscriptionId`

Retrieve subscription details by subscription ID.

**Example:**
```
GET /admin/subscriptions/clx456...
```

### 3. Update Subscription

**PUT** `/admin/subscriptions/:subscriptionId`

Update subscription plan, status, or other properties.

**Request Body:**
```json
{
  "plan": "YEARLY",
  "status": "ACTIVE",
  "cancelAtPeriodEnd": false,
  "stripeSubscriptionId": "sub_new_123"
}
```

**Fields:**
- `plan` (optional): Change subscription plan (MONTHLY/YEARLY)
- `status` (optional): Update subscription status
- `cancelAtPeriodEnd` (optional): Schedule cancellation
- `stripeSubscriptionId` (optional): Update Stripe subscription ID

**Response:**
```json
{
  "id": "clx456...",
  "userId": "clx123...",
  "plan": "YEARLY",
  "status": "ACTIVE",
  ...
}
```

**Note:** When changing plans, the system automatically:
- Updates the plan in Stripe (if subscription exists)
- Applies prorations for plan changes
- Updates user role if status changes to ACTIVE

### 4. Cancel Subscription

**POST** `/admin/subscriptions/:subscriptionId/cancel`

Cancel a subscription immediately or schedule cancellation at period end.

**Request Body:**
```json
{
  "immediate": false,
  "reason": "Customer requested cancellation"
}
```

**Fields:**
- `immediate` (optional): If `true`, cancel immediately. If `false` or omitted, cancel at period end (default: `false`)
- `reason` (optional): Reason for cancellation (sent to user in notification)

**Response:**
```json
{
  "message": "Subscription will be canceled at period end"
}
```

**Behavior:**
- **Immediate cancellation**: 
  - Cancels in Stripe immediately
  - Updates status to CANCELED
  - Downgrades user to USER role
  - User loses premium access immediately

- **Cancel at period end**:
  - Schedules cancellation in Stripe
  - Sets `cancelAtPeriodEnd: true`
  - User retains premium access until period ends
  - User downgraded automatically when period ends

### 5. Reactivate Subscription

**POST** `/admin/subscriptions/:subscriptionId/reactivate`

Reactivate a canceled or scheduled-for-cancellation subscription.

**Request Body:**
```json
{
  "reason": "Customer requested reactivation"
}
```

**Fields:**
- `reason` (optional): Reason for reactivation

**Response:**
```json
{
  "id": "clx456...",
  "userId": "clx123...",
  "status": "ACTIVE",
  "cancelAtPeriodEnd": false,
  ...
}
```

**Behavior:**
- Reactivates subscription in Stripe
- Updates status to ACTIVE
- Removes cancellation schedule
- Upgrades user to PREMIUM role
- User regains premium access

### 6. Extend Trial Period

**POST** `/admin/subscriptions/:subscriptionId/extend-trial?days=7`

Extend the trial period for a subscription by additional days.

**Query Parameters:**
- `days` (required): Number of additional trial days (1-365)

**Example:**
```
POST /admin/subscriptions/clx456.../extend-trial?days=7
```

**Response:**
```json
{
  "id": "clx456...",
  "userId": "clx123...",
  "trialEnd": "2024-01-15T00:00:00.000Z",
  ...
}
```

**Behavior:**
- Extends trial period in Stripe (if subscription exists)
- Updates `trialEnd` date in database
- Sends notification to user
- User retains trial access for extended period

## Usage Examples

### Customer Support Scenarios

#### 1. Customer Wants to Upgrade Plan

```bash
# Get current subscription
GET /admin/subscriptions/user/clx123...

# Update to yearly plan
PUT /admin/subscriptions/clx456...
{
  "plan": "YEARLY"
}
```

#### 2. Customer Payment Failed - Extend Trial

```bash
# Extend trial by 7 days
POST /admin/subscriptions/clx456.../extend-trial?days=7
```

#### 3. Customer Requests Cancellation

```bash
# Cancel at period end (customer keeps access until then)
POST /admin/subscriptions/clx456.../cancel
{
  "immediate": false,
  "reason": "Customer requested cancellation"
}

# Or cancel immediately
POST /admin/subscriptions/clx456.../cancel
{
  "immediate": true,
  "reason": "Refund requested"
}
```

#### 4. Customer Changes Mind - Reactivate

```bash
# Reactivate canceled subscription
POST /admin/subscriptions/clx456.../reactivate
{
  "reason": "Customer changed mind"
}
```

#### 5. Fix Subscription Status

```bash
# Update subscription status manually
PUT /admin/subscriptions/clx456...
{
  "status": "ACTIVE"
}
```

## Automatic Role Management

The system automatically manages user roles based on subscription status:

- **ACTIVE subscription** → User role upgraded to `PREMIUM`
- **CANCELED subscription** → User role downgraded to `USER`
- **Status changes** → Role updated accordingly

## Notifications

All subscription management actions automatically send notifications to users:

- Subscription updated
- Subscription canceled (with reason if provided)
- Subscription reactivated (with reason if provided)
- Trial period extended

## Stripe Integration

The service integrates with Stripe for:

- **Plan changes**: Updates subscription items in Stripe with prorations
- **Cancellations**: Cancels or schedules cancellation in Stripe
- **Reactivation**: Removes cancellation schedule in Stripe
- **Trial extension**: Updates trial end date in Stripe

**Note:** If Stripe operations fail, the system continues with database updates and logs errors. This ensures the system remains functional even if Stripe is temporarily unavailable.

## Error Handling

### Subscription Not Found
```json
{
  "statusCode": 404,
  "message": "Subscription not found",
  "error": "Not Found"
}
```

### Invalid Operation
```json
{
  "statusCode": 400,
  "message": "Subscription is already active",
  "error": "Bad Request"
}
```

### Stripe Errors
If Stripe operations fail, the error is logged but the operation continues with database updates. This ensures system resilience.

## Best Practices

1. **Always check subscription status** before making changes
2. **Provide reasons** for cancellations/reactivations for audit trail
3. **Use immediate cancellation** only when necessary (refunds, fraud, etc.)
4. **Extend trials** for payment issues or customer support cases
5. **Verify Stripe sync** after manual updates
6. **Document actions** in customer support system

## Security

- All endpoints require **ADMIN** role
- User data is protected and only accessible to admins
- All actions are logged via activity tracking
- Notifications sent to users for transparency

## Integration with Analytics

Subscription management actions are tracked in:
- Activity logs (via `ActivityLoggingInterceptor`)
- Subscription analytics
- Admin dashboard statistics

## Future Enhancements

Potential additions:
- Bulk subscription operations
- Subscription transfer between users
- Subscription pause/resume
- Custom billing cycle adjustments
- Subscription history/audit log

