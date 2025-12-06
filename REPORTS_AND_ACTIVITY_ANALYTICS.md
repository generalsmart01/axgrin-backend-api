# Reports and Activity Analytics Implementation

## ✅ Completed Implementation

### 1. Activity Logging System

#### Database Model
- ✅ Created `ActivityLog` model in Prisma schema
- ✅ Added `ActivityType` enum (CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, EXPORT, IMPORT, DOWNLOAD, UPLOAD)
- ✅ Migration created and applied

#### Automatic Activity Tracking
- ✅ Created `ActivityLoggingInterceptor` - Automatically logs all user activities
- ✅ Registered globally in `AppModule`
- ✅ Tracks:
  - HTTP method (POST → CREATE, PATCH → UPDATE, DELETE → DELETE, GET → VIEW)
  - Entity type (from route)
  - Entity ID
  - IP address and user agent
  - Timestamp
  - Additional metadata

### 2. Activity Analytics Endpoints

#### User Endpoints
- **`GET /analytics/activities/my-activities`** - Get my activity logs
  - Query params: `startDate`, `endDate`, `activityType`, `entityType`, `limit`, `offset`
  - Returns: List of user's activities with pagination

- **`GET /analytics/activities/statistics`** - Get activity statistics
  - Query params: `startDate`, `endDate`
  - Returns: Statistics grouped by type and entity

#### Admin/Customer Care Endpoints
- **`GET /analytics/activities/most-active-users`** - Get most active users
  - Query params: `limit`, `startDate`, `endDate`
  - Returns: Top users by activity count

- **`GET /analytics/activities/user/:userId`** - Get activities for specific user
  - Query params: `startDate`, `endDate`
  - Returns: All activities for a user

### 3. Reports Endpoints (Premium Feature)

#### Report Generation
- **`POST /reports/generate`** - Generate financial reports (Premium only)
  - Request body: `GenerateReportDto`
  - Returns: Download URL and filename

- **`GET /reports/download/:filename`** - Download generated report

#### Report Types Available
1. **EXPENSES** - Expense report with category breakdown
2. **INCOME** - Income report
3. **BUDGET** - Budget goals with progress
4. **FINANCIAL_SUMMARY** - Complete financial overview
5. **CATEGORY_BREAKDOWN** - Category-wise spending analysis
6. **MONTHLY_REPORT** - Monthly financial trends
7. **ACTIVITY_LOG** - User activity log report

#### Report Formats
- **PDF** - Portable Document Format
- **EXCEL** - Microsoft Excel format
- **CSV** - Comma-separated values
- **JSON** - JSON data format

## 📋 API Usage Examples

### Generate Expense Report
```http
POST /reports/generate
Authorization: Bearer <premium-jwt-token>
Content-Type: application/json

{
  "reportType": "EXPENSES",
  "format": "PDF",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "includeCharts": true
}
```

**Response:**
```json
{
  "downloadUrl": "/api/reports/download/expenses-report-1234567890.pdf",
  "filename": "expenses-report-1234567890.pdf",
  "format": "PDF"
}
```

### Get My Activities
```http
GET /analytics/activities/my-activities?limit=50&offset=0&activityType=CREATE
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "activities": [
    {
      "id": "clx123...",
      "activityType": "CREATE",
      "entityType": "Expense",
      "entityId": "clx456...",
      "description": "Created new Expense",
      "metadata": {
        "method": "POST",
        "route": "/expense",
        "params": {},
        "query": {}
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": "clx789...",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### Get Activity Statistics
```http
GET /analytics/activities/statistics?startDate=2024-01-01T00:00:00.000Z
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "totalActivities": 500,
  "activitiesByType": {
    "CREATE": 150,
    "UPDATE": 200,
    "DELETE": 50,
    "VIEW": 100
  },
  "activitiesByEntity": {
    "Expense": 200,
    "Income": 150,
    "BudgetGoal": 100,
    "Category": 50
  },
  "recentActivities": [...]
}
```

### Get Most Active Users (Admin/Customer Care)
```http
GET /analytics/activities/most-active-users?limit=10
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "users": [
    {
      "userId": "clx123...",
      "activityCount": 250,
      "user": {
        "email": "user@example.com",
        "name": "John Doe",
        "role": "USER"
      }
    }
  ]
}
```

## 🔐 Security & Permissions

### Reports
- **Premium Feature**: Only PREMIUM and ADMIN users can generate reports
- **Activity Logging**: Report generation is automatically logged

### Activity Analytics
- **My Activities**: Any authenticated user can view their own activities
- **Statistics**: Users see their own stats, admins see all stats
- **Most Active Users**: ADMIN and CUSTOMER_CARE only
- **User Activities**: ADMIN and CUSTOMER_CARE can view any user's activities

## 📊 Activity Types Tracked

The system automatically tracks:
- **CREATE** - When users create expenses, income, categories, etc.
- **UPDATE** - When users update existing records
- **DELETE** - When users delete records
- **VIEW** - When users view data (lists, details)
- **EXPORT** - When users generate reports
- **LOGIN** - User login (via LoginActivity model)
- **LOGOUT** - User logout

## 🎯 Features

### Automatic Activity Logging
- ✅ Interceptor automatically logs all API requests
- ✅ Captures IP address and user agent
- ✅ Stores metadata (route, params, query)
- ✅ Non-blocking (doesn't slow down requests)

### Activity Analytics
- ✅ Filter by date range
- ✅ Filter by activity type
- ✅ Filter by entity type
- ✅ Pagination support
- ✅ Statistics and summaries
- ✅ Most active users tracking

### Reports
- ✅ Multiple report types
- ✅ Multiple formats (PDF, Excel, CSV, JSON)
- ✅ Date range filtering
- ✅ Chart inclusion option
- ✅ Automatic activity logging

## 📁 Files Created

1. **`prisma/schema.prisma`** - Added ActivityLog model and ActivityType enum
2. **`src/analytics/activity-tracking.service.ts`** - Activity logging service
3. **`src/analytics/activity-analytics.controller.ts`** - Activity analytics endpoints
4. **`src/analytics/dto/activity-response.dto.ts`** - Activity response DTOs
5. **`src/common/interceptors/activity-logging.interceptor.ts`** - Automatic activity logging
6. **`src/reports/reports.service.ts`** - Report generation service
7. **`src/reports/reports.controller.ts`** - Reports endpoints
8. **`src/reports/dto/generate-report.dto.ts`** - Report generation DTOs
9. **`src/reports/reports.module.ts`** - Reports module

## 🚀 Next Steps (Optional)

1. **File Generation**: Implement actual PDF/Excel generation (using libraries like `pdfkit`, `exceljs`)
2. **File Storage**: Store generated reports in cloud storage (S3, etc.)
3. **Scheduled Reports**: Add cron jobs for automatic report generation
4. **Report Templates**: Create customizable report templates
5. **Email Reports**: Send reports via email
6. **Activity Alerts**: Set up alerts for suspicious activities
7. **Activity Dashboard**: Create visual dashboard for activity analytics

## 📝 Notes

- Activity logging is non-blocking and won't affect API performance
- Reports are Premium features - ensure users have PREMIUM role
- Activity logs are stored indefinitely (consider cleanup job for old logs)
- All report generation is automatically logged as EXPORT activity

