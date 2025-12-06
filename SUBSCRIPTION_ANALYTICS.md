# Subscription Analytics for Admins

## Overview

Comprehensive subscription analytics endpoints that provide admins with detailed insights into subscription performance, trends, and metrics.

## Endpoints

All endpoints require **ADMIN** role and are prefixed with `/admin/subscription-analytics`.

### 1. Get Comprehensive Analytics

**GET** `/admin/subscription-analytics`

Retrieve overall subscription metrics including counts, revenue estimates, and breakdowns.

**Response:**
```json
{
  "totalSubscriptions": 150,
  "activeSubscriptions": 120,
  "canceledSubscriptions": 20,
  "trialingSubscriptions": 5,
  "pastDueSubscriptions": 5,
  "subscriptionsByPlan": [
    {
      "plan": "MONTHLY",
      "count": 80,
      "active": 65
    },
    {
      "plan": "YEARLY",
      "count": 70,
      "active": 55
    }
  ],
  "subscriptionsByStatus": [
    {
      "status": "ACTIVE",
      "count": 120
    },
    {
      "status": "CANCELED",
      "count": 20
    },
    {
      "status": "TRIALING",
      "count": 5
    },
    {
      "status": "PAST_DUE",
      "count": 5
    }
  ],
  "recentSubscriptions": 25,
  "expiringSoon": 8,
  "scheduledCancellations": 12,
  "estimatedMonthlyRevenue": 1250.50,
  "estimatedYearlyRevenue": 15000.00
}
```

**Metrics Explained:**
- **totalSubscriptions**: Total number of subscription records
- **activeSubscriptions**: Currently active subscriptions
- **canceledSubscriptions**: Canceled subscriptions
- **trialingSubscriptions**: Subscriptions in trial period
- **pastDueSubscriptions**: Subscriptions with failed payments
- **subscriptionsByPlan**: Breakdown by MONTHLY and YEARLY plans
- **subscriptionsByStatus**: Breakdown by subscription status
- **recentSubscriptions**: New subscriptions in last 30 days
- **expiringSoon**: Active subscriptions expiring in next 7 days
- **scheduledCancellations**: Active subscriptions scheduled to cancel at period end
- **estimatedMonthlyRevenue**: Estimated monthly recurring revenue (MRR)
- **estimatedYearlyRevenue**: Estimated annual recurring revenue (ARR)

### 2. Get Subscription Trends

**GET** `/admin/subscription-analytics/trends?days=30`

Retrieve subscription trends showing new subscriptions, cancellations, and net changes over time.

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30, max: 365)

**Example:**
```
GET /admin/subscription-analytics/trends?days=60
```

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "newSubscriptions": 5,
    "canceledSubscriptions": 2,
    "netChange": 3,
    "totalActive": 100
  },
  {
    "date": "2024-01-02",
    "newSubscriptions": 3,
    "canceledSubscriptions": 1,
    "netChange": 2,
    "totalActive": 102
  },
  ...
]
```

**Fields Explained:**
- **date**: Date in YYYY-MM-DD format
- **newSubscriptions**: Number of new subscriptions created on this date
- **canceledSubscriptions**: Number of subscriptions canceled on this date
- **netChange**: Net change in subscriptions (new - canceled)
- **totalActive**: Total active subscriptions at the end of this date

### 3. Get Subscription Details

**GET** `/admin/subscription-analytics/details`

Retrieve detailed list of subscriptions with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by subscription status (ACTIVE, CANCELED, TRIALING, etc.)
- `plan` (optional): Filter by subscription plan (MONTHLY, YEARLY)
- `limit` (optional): Number of results to return (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Examples:**

Get all active subscriptions:
```
GET /admin/subscription-analytics/details?status=ACTIVE
```

Get monthly subscriptions:
```
GET /admin/subscription-analytics/details?plan=MONTHLY
```

Get past due subscriptions with pagination:
```
GET /admin/subscription-analytics/details?status=PAST_DUE&limit=20&offset=0
```

**Response:**
```json
{
  "subscriptions": [
    {
      "id": "clx123...",
      "userId": "clx456...",
      "userEmail": "user@example.com",
      "plan": "MONTHLY",
      "status": "ACTIVE",
      "currentPeriodStart": "2024-01-01T00:00:00.000Z",
      "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
      "cancelAtPeriodEnd": false,
      "trialEnd": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    ...
  ],
  "total": 120
}
```

## Usage Examples

### Monitor Subscription Health

```bash
# Get overall analytics
curl -X GET http://localhost:3300/admin/subscription-analytics \
  -H "Authorization: Bearer <admin-jwt-token>"
```

### Track Subscription Trends

```bash
# Get 60-day trends
curl -X GET "http://localhost:3300/admin/subscription-analytics/trends?days=60" \
  -H "Authorization: Bearer <admin-jwt-token>"
```

### Find Subscriptions Needing Attention

```bash
# Get past due subscriptions
curl -X GET "http://localhost:3300/admin/subscription-analytics/details?status=PAST_DUE" \
  -H "Authorization: Bearer <admin-jwt-token>"

# Get subscriptions expiring soon
curl -X GET "http://localhost:3300/admin/subscription-analytics/details?status=ACTIVE&limit=100" \
  -H "Authorization: Bearer <admin-jwt-token>"
```

### Revenue Analysis

The analytics endpoint calculates estimated revenue based on:
- Active subscription count
- Subscription plan type (MONTHLY or YEARLY)
- Current pricing from SubscriptionConfig

**Note**: Revenue estimates are based on configured prices and may not reflect actual Stripe revenue. For accurate revenue data, integrate with Stripe's reporting API.

## Business Insights

### Key Metrics to Monitor

1. **Active Subscriptions**: Core metric for business health
2. **Churn Rate**: `canceledSubscriptions / totalSubscriptions`
3. **Trial Conversion**: `activeSubscriptions / (activeSubscriptions + trialingSubscriptions)`
4. **MRR Growth**: Compare `estimatedMonthlyRevenue` over time
5. **Expiring Soon**: Subscriptions needing renewal attention

### Using Trends for Forecasting

The trends endpoint helps identify:
- **Growth patterns**: Increasing `newSubscriptions` indicates growth
- **Churn patterns**: Increasing `canceledSubscriptions` indicates issues
- **Seasonality**: Patterns in subscription creation/cancellation
- **Net growth**: Positive `netChange` indicates healthy growth

### Actionable Insights

1. **High Past Due**: Investigate payment issues, send reminders
2. **Scheduled Cancellations**: Reach out to users before cancellation
3. **Expiring Soon**: Send renewal reminders
4. **Low Trial Conversion**: Review trial experience and onboarding
5. **Plan Preference**: Use `subscriptionsByPlan` to optimize pricing

## Integration with Dashboard

These analytics can be integrated into admin dashboards to provide:
- Real-time subscription metrics
- Trend visualizations
- Revenue forecasting
- Churn analysis
- Subscription health monitoring

## Performance Considerations

- Analytics queries are optimized with database indexes
- Large date ranges for trends may take longer to process
- Pagination is recommended for subscription details
- Consider caching analytics data for frequently accessed metrics

## Future Enhancements

Potential additions:
- Revenue by plan breakdown
- Churn rate calculations
- Customer lifetime value (LTV)
- Cohort analysis
- Retention curves
- Subscription upgrade/downgrade tracking

