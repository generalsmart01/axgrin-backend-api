# User Roles Documentation

This document describes the user roles available in the Axgrin Backend API.

## Available Roles

### 1. **USER** (Default)
- **Description**: Standard user with full access to personal finance features
- **Default**: Yes, all new users are assigned this role
- **Permissions**:
  - Create, read, update, and delete personal expenses
  - Create, read, update, and delete personal income records
  - Manage personal categories and budget goals
  - Access AI financial assistant
  - View personal analytics and reports
  - Manage personal profile and settings
  - Access chat history

### 2. **ADMIN**
- **Description**: System administrator with full system access
- **Default**: No, must be assigned manually
- **Permissions**:
  - All USER permissions
  - Access to admin-only endpoints
  - View all users and system analytics
  - Manage user accounts
  - Access admin statistics and reports

### 3. **PREMIUM** ⭐
- **Description**: Paid subscription tier with advanced features
- **Default**: No, must be upgraded from USER
- **Permissions**:
  - All USER permissions
  - Unlimited AI chat queries (no rate limits)
  - Advanced analytics and insights
  - Export capabilities (PDF, Excel)
  - Priority support
  - Unlimited budget goals
  - Advanced reporting features
  - Recurring expense automation
  - Custom categories and tags

### 4. **VIEWER** 👁️
- **Description**: Read-only access for data sharing
- **Default**: No, must be assigned manually
- **Permissions**:
  - **Read-only access** to expenses, budgets, and reports
  - View analytics and insights
  - Cannot create, edit, or delete any data
  - Cannot modify settings or profile
  - Useful for:
    - Accountants reviewing client data
    - Family members viewing shared budgets
    - Financial advisors (read-only mode)
    - Auditors

## Role Hierarchy

```
ADMIN (Full system access)
  ↓
PREMIUM (Paid features)
  ↓
USER (Standard user)
  ↓
VIEWER (Read-only)
```

## Implementation Details

### Role Definition

Roles are defined in:
- **Prisma Schema**: `prisma/schema.prisma`
- **TypeScript Enum**: `src/auth/roles.enum.ts`

```typescript
enum Role {
  USER
  ADMIN
  PREMIUM
  VIEWER
}
```

### Using Roles in Controllers

#### Example 1: Admin Only
```typescript
@Roles('ADMIN')
@Get('admin-stats')
getAdminStats() {
  return 'Admin-only data';
}
```

#### Example 2: Multiple Roles
```typescript
@Roles('ADMIN', 'USER', 'PREMIUM')
@Get('analytics')
getAnalytics() {
  return analyticsData;
}
```

#### Example 3: Premium Features
```typescript
@Roles('PREMIUM', 'ADMIN')
@Post('export')
exportData() {
  // Premium feature: Export to PDF/Excel
}
```

#### Example 4: Read-Only Guard for VIEWER
```typescript
@UseGuards(JwtAuthGuard, ReadOnlyGuard)
@Get('expenses')
getExpenses() {
  // VIEWER can read, but ReadOnlyGuard prevents POST/PATCH/DELETE
}
```

### VIEWER Role Restrictions

The `ReadOnlyGuard` automatically restricts VIEWER users to GET requests only:

```typescript
// VIEWER can access
GET /expense
GET /expense/:id
GET /budget-goal
GET /analytics

// VIEWER cannot access
POST /expense          // ❌ Forbidden
PATCH /expense/:id     // ❌ Forbidden
DELETE /expense/:id    // ❌ Forbidden
```

## Upgrading Users

### USER → PREMIUM
- Typically done through payment/subscription system
- Update user role in database:
  ```typescript
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'PREMIUM' }
  });
  ```

### USER → VIEWER
- For sharing access with accountants/advisors
- Update user role:
  ```typescript
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'VIEWER' }
  });
  ```

## Best Practices

1. **Always check roles** before allowing sensitive operations
2. **Use guards** (`RolesGuard`, `ReadOnlyGuard`) for automatic enforcement
3. **Document role requirements** in Swagger/API documentation
4. **Validate role changes** - ensure only admins can change roles
5. **Log role changes** for audit purposes

## API Endpoints by Role

### All Authenticated Users
- `GET /profile/me` - View own profile
- `GET /expense` - View own expenses
- `GET /income` - View own income
- `GET /budget-goal` - View own budget goals

### PREMIUM Only
- `POST /export/pdf` - Export to PDF
- `POST /export/excel` - Export to Excel
- `GET /analytics/advanced` - Advanced analytics
- `POST /ai/chat` (unlimited) - Unlimited AI queries

### VIEWER Only
- Read-only access to all GET endpoints
- Cannot access any POST, PATCH, or DELETE endpoints

### ADMIN Only
- `GET /users` - View all users
- `GET /analytics/admin` - Admin analytics
- `GET /auth/admin-stats` - Admin statistics

## Migration Notes

When adding new roles:
1. Update `prisma/schema.prisma` enum
2. Update `src/auth/roles.enum.ts`
3. Run `npx prisma generate` to regenerate Prisma client
4. Update guards and decorators as needed
5. Update API documentation

## Security Considerations

- Roles are validated using JWT tokens
- Role information is included in the JWT payload
- Always validate roles server-side, never trust client-side role claims
- Use `RolesGuard` to automatically enforce role-based access control

