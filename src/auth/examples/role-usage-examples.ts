// src/auth/examples/role-usage-examples.ts
/**
 * Examples of how to use different roles in controllers
 * 
 * This file demonstrates best practices for role-based access control
 */

import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ReadOnlyGuard } from '../guards/read-only.guard';

// Example 1: Admin-only endpoint
export class AdminExampleController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-data')
  getAdminData() {
    return { message: 'Admin-only data' };
  }
}

// Example 2: Premium feature endpoint
export class PremiumExampleController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PREMIUM', 'ADMIN') // Premium users and admins can access
  @Post('export-pdf')
  exportToPdf() {
    return { message: 'PDF export (Premium feature)' };
  }
}

// Example 3: Multiple roles can access
export class MultiRoleExampleController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'PREMIUM', 'ADMIN')
  @Get('analytics')
  getAnalytics() {
    return { message: 'Analytics data' };
  }
}

// Example 4: VIEWER role with read-only guard
export class ViewerExampleController {
  // VIEWER can read
  @UseGuards(JwtAuthGuard, ReadOnlyGuard)
  @Get('expenses')
  getExpenses() {
    return { message: 'Expenses (read-only for VIEWER)' };
  }

  // VIEWER cannot write - ReadOnlyGuard will block this
  @UseGuards(JwtAuthGuard, ReadOnlyGuard)
  @Post('expenses')
  createExpense() {
    // VIEWER role will be blocked by ReadOnlyGuard
    return { message: 'Expense created' };
  }
}

// Example 5: Standard user endpoint (no role restriction)
export class StandardExampleController {
  @UseGuards(JwtAuthGuard) // Any authenticated user can access
  @Get('profile')
  getProfile() {
    return { message: 'User profile' };
  }
}

// Example 6: Premium or Admin only
export class PremiumFeatureController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PREMIUM', 'ADMIN')
  @Get('advanced-insights')
  getAdvancedInsights() {
    return { message: 'Advanced financial insights (Premium feature)' };
  }
}

