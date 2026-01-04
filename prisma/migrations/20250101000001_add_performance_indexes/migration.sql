-- Add performance indexes for Expenses
CREATE INDEX IF NOT EXISTS "expense_userId_idx" ON "expenses"("userId");
CREATE INDEX IF NOT EXISTS "expense_categoryId_idx" ON "expenses"("categoryId");
CREATE INDEX IF NOT EXISTS "expense_date_idx" ON "expenses"("date");
CREATE INDEX IF NOT EXISTS "expense_userId_date_idx" ON "expenses"("userId", "date");

-- Add performance indexes for Income
CREATE INDEX IF NOT EXISTS "income_userId_idx" ON "incomes"("userId");
CREATE INDEX IF NOT EXISTS "income_date_idx" ON "incomes"("date");
CREATE INDEX IF NOT EXISTS "income_userId_date_idx" ON "incomes"("userId", "date");

-- Add performance indexes for BudgetGoals
CREATE INDEX IF NOT EXISTS "budgetGoal_userId_idx" ON "budgetGoals"("userId");
CREATE INDEX IF NOT EXISTS "budgetGoal_categoryId_idx" ON "budgetGoals"("categoryId");

-- Add performance indexes for Categories
CREATE INDEX IF NOT EXISTS "category_userId_idx" ON "categories"("userId");

-- Add performance indexes for ChatHistory
CREATE INDEX IF NOT EXISTS "chatHistory_userId_idx" ON "chatHistories"("userId");
CREATE INDEX IF NOT EXISTS "chatHistory_createdAt_idx" ON "chatHistories"("createdAt");

-- Add performance indexes for Notifications
CREATE INDEX IF NOT EXISTS "notification_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notification_read_idx" ON "notifications"("read");
CREATE INDEX IF NOT EXISTS "notification_createdAt_idx" ON "notifications"("createdAt");
