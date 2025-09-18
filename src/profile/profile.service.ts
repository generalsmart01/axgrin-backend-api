import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        settings: true,
        _count: {
          select: {
            incomes: true,
            expenses: true,
            budgetGoals: true,
            categories: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      gender: user.gender,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      bio: user.profile?.bio || null,
      avatarUrl: user.profile?.avatarUrl || null,
      lastVerificationEmailSentAt: user.lastVerificationEmailSentAt,
      settings: user.settings
        ? {
            currency: user.settings.currency,
            theme: user.settings.theme,
          }
        : null,
      totalIncomes: user._count.incomes,
      totalExpenses: user._count.expenses,
      totalBudgetGoals: user._count.budgetGoals,
      totalCategories: user._count.categories,
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user basic info
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
      },
      include: {
        profile: true,
        settings: true,
        _count: {
          select: {
            incomes: true,
            expenses: true,
            budgetGoals: true,
            categories: true,
          },
        },
      },
    });

    // Update or create profile
    if (dto.bio !== undefined || dto.avatarUrl !== undefined) {
      await this.prisma.userProfile.upsert({
        where: { userId },
        update: {
          bio: dto.bio,
          avatarUrl: dto.avatarUrl,
        },
        create: {
          userId,
          bio: dto.bio,
          avatarUrl: dto.avatarUrl,
        },
      });

      // Fetch updated data
      const userWithProfile = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          settings: true,
          _count: {
            select: {
              incomes: true,
              expenses: true,
              budgetGoals: true,
              categories: true,
            },
          },
        },
      });

      return {
        id: userWithProfile!.id,
        email: userWithProfile!.email,
        firstName: userWithProfile!.firstName,
        lastName: userWithProfile!.lastName,
        role: userWithProfile!.role,
        gender: userWithProfile!.gender,
        emailVerified: userWithProfile!.emailVerified,
        createdAt: userWithProfile!.createdAt,
        updatedAt: userWithProfile!.updatedAt,
        bio: userWithProfile!.profile?.bio || null,
        avatarUrl: userWithProfile!.profile?.avatarUrl || null,
        lastVerificationEmailSentAt:
          userWithProfile!.lastVerificationEmailSentAt,
        settings: userWithProfile!.settings
          ? {
              currency: userWithProfile!.settings.currency,
              theme: userWithProfile!.settings.theme,
            }
          : null,
        totalIncomes: userWithProfile!._count.incomes,
        totalExpenses: userWithProfile!._count.expenses,
        totalBudgetGoals: userWithProfile!._count.budgetGoals,
        totalCategories: userWithProfile!._count.categories,
      };
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      gender: updatedUser.gender,
      emailVerified: updatedUser.emailVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      bio: updatedUser.profile?.bio || null,
      avatarUrl: updatedUser.profile?.avatarUrl || null,
      lastVerificationEmailSentAt: updatedUser.lastVerificationEmailSentAt,
      settings: updatedUser.settings
        ? {
            currency: updatedUser.settings.currency,
            theme: updatedUser.settings.theme,
          }
        : null,
      totalIncomes: updatedUser._count.incomes,
      totalExpenses: updatedUser._count.expenses,
      totalBudgetGoals: updatedUser._count.budgetGoals,
      totalCategories: updatedUser._count.categories,
    };
  }

  async getAllProfiles(): Promise<ProfileResponseDto[]> {
    const users = await this.prisma.user.findMany({
      include: {
        profile: true,
        settings: true,
        _count: {
          select: {
            incomes: true,
            expenses: true,
            budgetGoals: true,
            categories: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      gender: user.gender,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      bio: user.profile?.bio || null,
      avatarUrl: user.profile?.avatarUrl || null,
      lastVerificationEmailSentAt: user.lastVerificationEmailSentAt,
      settings: user.settings
        ? {
            currency: user.settings.currency,
            theme: user.settings.theme,
          }
        : null,
      totalIncomes: user._count.incomes,
      totalExpenses: user._count.expenses,
      totalBudgetGoals: user._count.budgetGoals,
      totalCategories: user._count.categories,
    }));
  }
}
