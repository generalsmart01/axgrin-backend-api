# API Payload Examples

This document provides comprehensive payload examples for creating and updating entities in the Axgrin Backend API.

## Table of Contents

- [Expense](#expense)
- [Budget Goal](#budget-goal)
- [Category](#category)
- [Chat History](#chat-history)
- [AI Financial Assistant](#ai-financial-assistant)
- [Notifications](#notifications)

---

## Expense

### Create Expense

**Endpoint:** `POST /expense`

**Description:** Creates a new expense record for the authenticated user.

**Payload:**

```json
{
  "amount": 150.5,
  "categoryId": "clx1234567890abcdef",
  "note": "Grocery shopping at Whole Foods",
  "date": "2024-01-15T10:30:00.000Z"
}
```

**Field Descriptions:**

- `amount` (number, required): The expense amount in the user's currency
- `categoryId` (string, required): UUID of the category this expense belongs to
- `note` (string, optional): Additional notes or description for the expense
- `date` (Date, optional): When the expense occurred (defaults to current timestamp)

**Validation Rules:**

- `amount` must be a valid number
- `categoryId` must be a valid UUID
- `note` must be a string if provided
- `date` must be a valid date string if provided

### Update Expense

**Endpoint:** `PATCH /expense/:id`

**Description:** Updates an existing expense record. All fields are optional.

**Payload:**

```json
{
  "amount": 175.25,
  "categoryId": "clx1234567890abcdef",
  "note": "Updated grocery shopping - bought organic items",
  "date": "2024-01-15T11:45:00.000Z"
}
```

**Field Descriptions:**

- All fields are optional and follow the same validation rules as create
- Only provided fields will be updated

---

## Budget Goal

### Create Budget Goal

**Endpoint:** `POST /budget-goal`

**Description:** Creates a new budget goal for a specific category and time period.

**Payload:**

```json
{
  "categoryId": "clx1234567890abcdef",
  "target": 2000.0,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.000Z"
}
```

**Field Descriptions:**

- `categoryId` (string, required): UUID of the category for this budget goal
- `target` (number, required): Target amount to spend within the time period
- `startDate` (string, required): Start date of the budget period (ISO 8601 format)
- `endDate` (string, required): End date of the budget period (ISO 8601 format)

**Validation Rules:**

- `categoryId` must be a valid UUID
- `target` must be a positive number
- `startDate` must be a valid ISO 8601 date string
- `endDate` must be a valid ISO 8601 date string
- `endDate` must be after `startDate`

### Update Budget Goal

**Endpoint:** `PATCH /budget-goal/:id`

**Description:** Updates an existing budget goal. All fields are optional.

**Payload:**

```json
{
  "categoryId": "clx1234567890abcdef",
  "target": 2500.0,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-02-29T23:59:59.000Z"
}
```

**Field Descriptions:**

- All fields are optional and follow the same validation rules as create
- Only provided fields will be updated

---

## Category

### Create Category

**Endpoint:** `POST /category`

**Description:** Creates a new expense category for the authenticated user.

**Payload:**

```json
{
  "name": "Food & Dining"
}
```

**Field Descriptions:**

- `name` (string, required): The name of the category

**Validation Rules:**

- `name` must be a string with at least 2 characters
- Category names should be descriptive and unique per user

**Example Categories:**

- "Food & Dining"
- "Transportation"
- "Entertainment"
- "Healthcare"
- "Shopping"
- "Utilities"
- "Rent & Housing"
- "Education"
- "Travel"
- "Miscellaneous"

### Update Category

**Endpoint:** `PATCH /category/:id`

**Description:** Updates an existing category name.

**Payload:**

```json
{
  "name": "Food & Groceries"
}
```

**Field Descriptions:**

- `name` (string, optional): New name for the category

**Validation Rules:**

- `name` must be a string with at least 2 characters if provided
- Only provided fields will be updated

---

## Chat History

### Create Chat History

**Endpoint:** `POST /chat-history`

**Description:** Creates a new chat history entry for the authenticated user.

**Payload:**

```json
{
  "message": "How can I reduce my monthly expenses?",
  "response": "Here are some strategies to reduce your monthly expenses:\n\n1. Track all your spending for a month to identify patterns\n2. Create a realistic budget and stick to it\n3. Cut back on non-essential expenses like dining out\n4. Shop around for better deals on recurring bills\n5. Consider cooking at home more often\n6. Look for free or low-cost entertainment options\n\nWould you like me to help you create a specific budget plan?"
}
```

**Field Descriptions:**

- `message` (string, required): The user's message or question
- `response` (string, required): The AI assistant's response

**Validation Rules:**

- `message` must be a non-empty string
- `response` must be a non-empty string
- Both fields are required

**Use Cases:**

- Storing user queries and AI responses
- Maintaining conversation history
- Learning from user interactions
- Providing context for future conversations

### Update Chat History

**Note:** Currently, there is no update endpoint for chat history. Chat history entries are typically immutable once created to maintain conversation integrity.

---

## AI Financial Assistant

### Chat with AI Assistant

**Endpoint:** `POST /ai/chat`

**Description:** Send a message to the AI financial assistant and get personalized financial advice based on your data.

**Payload:**

```json
{
  "message": "How am I doing with my budget this month?",
  "context": {
    "includeFinancialData": true,
    "includeInsights": true
  }
}
```

**Field Descriptions:**

- `message` (string, required): The user message or question for the AI assistant
- `context` (object, optional): Additional context for the AI response
  - `includeFinancialData` (boolean, optional): Whether to include user financial data in the response
  - `includeInsights` (boolean, optional): Whether to include financial insights and recommendations

**Response:**

```json
{
  "response": "📊 **Budget Analysis for This Month**\n\n**Overall Status:** $1,250.50 of $1,500.00 budget used\n\n✅ **On Track Categories:**\n• Food & Dining: $450.00 of $500.00 (90.0%)\n• Entertainment: $80.00 of $100.00 (80.0%)\n\n⚠️ **Over Budget Categories:**\n• Transportation: $275.00 of $250.00 (110.0%)\n\n**Top Spending Categories:**\n1. Food & Dining: $450.00\n2. Transportation: $275.00\n3. Entertainment: $80.00\n\n💡 **Recommendations:**\n• Review overspending categories and adjust your budget\n• Consider reducing expenses in over-budget areas\n• Set up budget alerts to stay on track",
  "insights": {
    "spendingAnalysis": {
      "totalSpent": 1250.5,
      "averageDaily": 41.68,
      "topCategories": [
        { "name": "Food & Dining", "amount": 450.0, "count": 12 },
        { "name": "Transportation", "amount": 275.0, "count": 8 },
        { "name": "Entertainment", "amount": 80.0, "count": 3 }
      ],
      "trends": [
        { "date": "2024-01-15", "amount": 45.5 },
        { "date": "2024-01-14", "amount": 32.0 }
      ],
      "anomalies": []
    },
    "budgetStatus": {
      "totalBudget": 1500.0,
      "totalSpent": 1250.5,
      "remaining": 249.5,
      "overBudgetCategories": [
        {
          "category": "Transportation",
          "budget": 250.0,
          "spent": 275.0,
          "overage": 25.0,
          "percentage": 110.0
        }
      ],
      "onTrackCategories": [
        {
          "category": "Food & Dining",
          "budget": 500.0,
          "spent": 450.0,
          "remaining": 50.0,
          "percentage": 90.0
        }
      ]
    }
  },
  "suggestedActions": [
    "Review overspending categories and adjust your budget",
    "Consider reducing expenses in over-budget areas",
    "Set up budget alerts to stay on track",
    "Track your progress weekly"
  ],
  "conversationId": "clx1234567890abcdef",
  "confidence": 0.9
}
```

**Response Field Descriptions:**

- `response` (string): The AI assistant response message
- `insights` (object, optional): Financial insights and analysis data
- `suggestedActions` (array, optional): Suggested actions for the user to take
- `conversationId` (string, optional): Unique identifier for this conversation
- `confidence` (number, optional): Confidence score for the AI response (0-1)

### Get Financial Insights

**Endpoint:** `GET /ai/insights`

**Description:** Retrieve comprehensive financial insights including spending trends, budget status, and savings opportunities.

**Response:**

```json
{
  "spendingTrends": {
    "monthlyTrends": [
      { "month": "2024-01", "total": 1250.5, "count": 25 },
      { "month": "2023-12", "total": 1180.0, "count": 22 },
      { "month": "2023-11", "total": 1320.75, "count": 28 }
    ],
    "averageMonthly": 1250.42,
    "trend": "stable"
  },
  "budgetStatus": {
    "totalBudget": 1500.0,
    "totalSpent": 1250.5,
    "remaining": 249.5,
    "overBudgetCategories": [],
    "underBudgetCategories": [
      {
        "category": "Food & Dining",
        "budget": 500.0,
        "spent": 450.0,
        "remaining": 50.0,
        "percentage": 90.0
      }
    ],
    "onTrackCategories": [
      {
        "category": "Entertainment",
        "budget": 100.0,
        "spent": 80.0,
        "remaining": 20.0,
        "percentage": 80.0
      }
    ]
  },
  "savingsOpportunities": [
    {
      "type": "HIGH_SPENDING",
      "category": "Food & Dining",
      "currentAmount": 450.0,
      "potentialSavings": 90.0,
      "suggestions": [
        "Meal plan for the week",
        "Cook at home more often",
        "Look for restaurant deals",
        "Buy generic brands"
      ]
    }
  ],
  "financialHealth": 85,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

### Get Welcome Message

**Endpoint:** `GET /ai/welcome`

**Description:** Get a personalized welcome message from the AI assistant.

**Response:**

```json
{
  "response": "Hello John! 👋\n\nWelcome to your AI Financial Assistant! I'm here to help you:\n\n🎯 **Get started with your finances**\n📊 **Track your budget and spending**\n💰 **Find ways to save money**\n📝 **Organize your expenses**\n🎯 **Set and achieve financial goals**\n\n**What would you like to work on first?**\nJust ask me anything about your finances!",
  "confidence": 1.0
}
```

### AI Assistant Features

**Budget Analysis:**

- Analyze spending vs budget
- Identify overspending categories
- Track financial progress
- Provide budget recommendations

**Savings Advice:**

- Find savings opportunities
- Suggest money-saving strategies
- Help optimize spending
- Calculate potential savings

**Expense Management:**

- Help categorize expenses
- Organize financial data
- Set up better tracking
- Suggest expense improvements

**Goal Setting:**

- Create financial goals
- Track goal progress
- Adjust goals as needed
- Provide goal recommendations

**Example Conversations:**

**Budget Question:**

```
User: "How am I doing with my budget this month?"
AI: "Based on your spending this month, you're doing well overall! Here's the breakdown..."
```

**Savings Question:**

```
User: "How can I save more money?"
AI: "Great goal! Based on your spending patterns, here are some opportunities to save more..."
```

**Categorization Help:**

```
User: "Help me categorize my recent expenses"
AI: "I found 5 uncategorized expenses. Here are my suggestions..."
```

**Goal Setting:**

```
User: "I want to set a savings goal"
AI: "Let's set up some realistic financial goals. Based on your income..."
```

### Auto-Categorize Expense

**Endpoint:** `POST /ai/auto-categorize/:expenseId`

**Description:** Use AI to automatically categorize an uncategorized expense based on its description.

**Response:**

```json
{
  "success": true,
  "message": "Expense categorized successfully",
  "suggestedCategory": "Food & Dining"
}
```

### Get Budget Recommendations

**Endpoint:** `GET /ai/budget-recommendations`

**Description:** Get personalized budget recommendations based on your spending patterns and financial data.

**Response:**

```json
{
  "recommendations": [
    {
      "category": "Food & Dining",
      "currentSpending": 450.0,
      "recommendedBudget": 495.0,
      "reasoning": "Based on your average spending of $450.00/month",
      "priority": "high"
    },
    {
      "category": "Transportation",
      "currentSpending": 275.0,
      "recommendedBudget": 302.5,
      "reasoning": "Based on your average spending of $275.00/month",
      "priority": "high"
    }
  ],
  "totalRecommendedBudget": 797.5,
  "emergencyFund": 3750.0
}
```

### Get Financial Health Assessment

**Endpoint:** `GET /ai/financial-health`

**Description:** Get a comprehensive AI-powered assessment of your financial health with scores and recommendations.

**Response:**

```json
{
  "score": 85,
  "level": "Good",
  "strengths": [
    "Staying within budget",
    "Positive cash flow",
    "Good budget management"
  ],
  "weaknesses": ["Overspending in some categories"],
  "recommendations": [
    "Review and adjust budget limits for overspending categories",
    "Consider reallocating budget to better match spending patterns"
  ]
}
```

### Trigger Proactive Analysis

**Endpoint:** `POST /ai/proactive-check`

**Description:** Manually trigger AI analysis to check for budget alerts, spending anomalies, and savings opportunities.

**Response:**

```json
{
  "success": true,
  "message": "Proactive analysis completed. 2 new notifications sent.",
  "notificationsSent": 2
}
```

### AI Integration Features

**Proactive Notifications:**

- Budget alerts when approaching limits
- Spending anomaly detection
- Savings opportunity alerts
- Goal progress updates

**Smart Categorization:**

- Automatic expense categorization
- Category suggestions based on descriptions
- Learning from user patterns

**Financial Analysis:**

- Budget recommendations based on spending patterns
- Financial health scoring
- Emergency fund calculations
- Goal setting assistance

**Intelligent Insights:**

- Spending trend analysis
- Anomaly detection
- Savings opportunity identification
- Personalized recommendations

---

## Notifications

### Create Notification

**Endpoint:** `POST /notifications`

**Description:** Creates a new notification for the authenticated user. Typically used by the system to send alerts about budget goals, expense limits, etc.

**Payload:**

```json
{
  "message": "Your budget goal for Food & Dining has been exceeded by $50.00"
}
```

**Field Descriptions:**

- `message` (string, required): The notification message content

**Validation Rules:**

- `message` must be a non-empty string

**Use Cases:**

- Budget goal alerts
- Expense limit warnings
- System notifications
- Financial advice reminders
- **Automatic Notifications:**
  - Welcome message after account creation
  - Login notifications with IP address
  - Budget alerts when approaching limits
  - Budget exceeded warnings
  - Goal achievement celebrations
  - Monthly report notifications
  - Daily spending limit warnings

### Get All Notifications

**Endpoint:** `GET /notifications`

**Description:** Retrieves all notifications for the authenticated user, including read and unread notifications with metadata.

**Response:**

```json
{
  "notifications": [
    {
      "id": "clx1234567890abcdef",
      "userId": "clx0987654321fedcba",
      "message": "Your budget goal for Food & Dining has been exceeded by $50.00",
      "read": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "clx1234567890abcdee",
      "userId": "clx0987654321fedcba",
      "message": "Welcome to Axgrin! Start by creating your first expense category.",
      "read": true,
      "createdAt": "2024-01-14T09:15:00.000Z"
    }
  ],
  "total": 2,
  "unreadCount": 1
}
```

**Response Field Descriptions:**

- `notifications` (array): Array of notification objects
- `total` (number): Total count of notifications
- `unreadCount` (number): Number of unread notifications

### Mark Notification as Read

**Endpoint:** `PATCH /notifications/:id/read`

**Description:** Marks a specific notification as read for the authenticated user.

**Parameters:**

- `id` (string, required): Notification ID to mark as read

**Response:**

```json
{
  "id": "clx1234567890abcdef",
  "userId": "clx0987654321fedcba",
  "message": "Your budget goal for Food & Dining has been exceeded by $50.00",
  "read": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response Field Descriptions:**

- `id` (string): Unique identifier for the notification
- `userId` (string): User ID who owns this notification
- `message` (string): The notification message content
- `read` (boolean): Whether the notification has been read
- `createdAt` (string): When the notification was created

### Notification Examples

**Budget Alert:**

```json
{
  "message": "⚠️ Budget Alert: You've spent 90% of your Food & Dining budget ($450 of $500)"
}
```

**Goal Achievement:**

```json
{
  "message": "🎉 Congratulations! You've successfully stayed within your Transportation budget this month."
}
```

**System Notification:**

```json
{
  "message": "📊 Your monthly expense report is ready. Check your analytics dashboard for insights."
}
```

**Expense Limit Warning:**

```json
{
  "message": "⚠️ You've exceeded your daily spending limit of $100. Consider reviewing your expenses."
}
```

### Automatic Notifications

The system automatically creates notifications for various events:

**Welcome Notification (After Registration):**

```json
{
  "id": "clx1234567890abcdef",
  "userId": "clx0987654321fedcba",
  "message": "🎉 Welcome to Axgrin, John! Start by creating your first expense category to begin tracking your finances.",
  "read": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Login Notification:**

```json
{
  "id": "clx1234567890abcdee",
  "userId": "clx0987654321fedcba",
  "message": "🔐 You've successfully logged in from 192.168.1.100. Welcome back!",
  "read": false,
  "createdAt": "2024-01-15T11:45:00.000Z"
}
```

**Budget Alert (90% of budget used):**

```json
{
  "id": "clx1234567890abcdef",
  "userId": "clx0987654321fedcba",
  "message": "⚠️ Budget Alert: You've spent 90% of your Food & Dining budget ($450.00 of $500.00)",
  "read": false,
  "createdAt": "2024-01-15T12:30:00.000Z"
}
```

**Budget Exceeded:**

```json
{
  "id": "clx1234567890abcdee",
  "userId": "clx0987654321fedcba",
  "message": "🚨 Budget Exceeded: You've exceeded your Transportation budget by $25.50 ($275.50 of $250.00)",
  "read": false,
  "createdAt": "2024-01-15T13:15:00.000Z"
}
```

**Goal Achievement:**

```json
{
  "id": "clx1234567890abcdee",
  "userId": "clx0987654321fedcba",
  "message": "🎉 Goal Achieved: Congratulations! You've successfully stayed within your Entertainment budget this month.",
  "read": false,
  "createdAt": "2024-01-31T23:59:00.000Z"
}
```

**Monthly Report:**

```json
{
  "id": "clx1234567890abcdee",
  "userId": "clx0987654321fedcba",
  "message": "📊 Your monthly expense report is ready! Check your analytics dashboard for insights into your spending patterns.",
  "read": false,
  "createdAt": "2024-02-01T00:00:00.000Z"
}
```

---

## Common Response Format

All successful operations return the created/updated entity with additional metadata:

```json
{
  "id": "clx1234567890abcdef",
  "userId": "clx0987654321fedcba",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
  // ... entity-specific fields
}
```

## Error Responses

Failed requests return appropriate HTTP status codes with error details:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "amount",
      "message": "amount must be a number"
    }
  ]
}
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

API requests are rate-limited to prevent abuse. Check response headers for rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Additional Examples

### Complete Expense Examples

**Minimal Create:**

```json
{
  "amount": 25.99,
  "categoryId": "clx1234567890abcdef"
}
```

**Full Create:**

```json
{
  "amount": 89.5,
  "categoryId": "clx1234567890abcdef",
  "note": "Dinner at Italian restaurant with friends",
  "date": "2024-01-20T19:30:00.000Z"
}
```

### Complete Budget Goal Examples

**Monthly Budget:**

```json
{
  "categoryId": "clx1234567890abcdef",
  "target": 500.0,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.000Z"
}
```

**Weekly Budget:**

```json
{
  "categoryId": "clx1234567890abcdef",
  "target": 100.0,
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2024-01-21T23:59:59.000Z"
}
```

### Complete Category Examples

**Basic Category:**

```json
{
  "name": "Gas"
}
```

**Detailed Category:**

```json
{
  "name": "Car Maintenance & Fuel"
}
```

### Complete Chat History Examples

**Simple Q&A:**

```json
{
  "message": "What's my total spending this month?",
  "response": "Your total spending this month is $1,234.56 across 15 transactions."
}
```

**Complex Financial Advice:**

```json
{
  "message": "I want to save $10,000 in 6 months. How should I budget?",
  "response": "To save $10,000 in 6 months, you'll need to save approximately $1,667 per month. Here's a suggested budget breakdown:\n\n1. Track your current expenses for 2 weeks\n2. Identify areas where you can cut back\n3. Set up automatic transfers to a savings account\n4. Consider increasing your income through side gigs\n5. Review and adjust your budget monthly\n\nWould you like me to help you create a detailed monthly budget plan?"
}
```

## Data Types Reference

| Field Type | Description                           | Example                      |
| ---------- | ------------------------------------- | ---------------------------- |
| `number`   | Numeric values (integers or decimals) | `150.50`, `2000`             |
| `string`   | Text values                           | `"Food & Dining"`            |
| `Date`     | ISO 8601 date strings                 | `"2024-01-15T10:30:00.000Z"` |
| `UUID`     | Unique identifier strings             | `"clx1234567890abcdef"`      |

## Best Practices

1. **Always validate data** before sending requests
2. **Use descriptive category names** for better organization
3. **Include meaningful notes** for expenses when possible
4. **Set realistic budget goals** based on your income
5. **Keep chat history messages concise** but informative
6. **Use consistent date formats** (ISO 8601)
7. **Handle errors gracefully** in your client applications
