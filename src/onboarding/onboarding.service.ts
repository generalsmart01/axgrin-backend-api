import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompleteOnboardingDto, OnboardingStatus } from './dto/complete-onboarding.dto';

@Injectable()
export class OnboardingService {
    constructor(private prisma: PrismaService) { }

    /**
     * Initializes the onboarding process.
     */
    async startOnboarding(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { onboardingStatus: 'STARTED', onboardingStep: 1 },
        });
    }

    /**
     * Gets the current onboarding status and step for a user.
     */
    async getOnboardingStatus(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { onboardingStatus: true, onboardingStep: true },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return user;
    }

    /**
     * Updates the onboarding step to save progress.
     */
    async updateOnboardingStep(userId: string, step: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { onboardingStep: step },
            select: { onboardingStatus: true, onboardingStep: true },
        });
    }

    /**
     * Step 1: Update basic onboarding info
     */
    async updateBasicInfo(userId: string, dto: import('./dto/update-basic-info.dto').UpdateOnboardingBasicInfoDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                currency: dto.currency,
                monthStartDay: dto.monthStartDay,
                incomeFrequency: dto.incomeFrequency,
                onboardingStep: 2,
            },
        });
    }

    /**
     * Step 2: Save incomes
     */
    async updateIncomes(userId: string, dto: import('./dto/update-incomes.dto').UpdateOnboardingIncomesDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return this.prisma.$transaction(async (tx) => {
            if (dto.incomes && dto.incomes.length > 0) {
                await tx.income.createMany({
                    data: dto.incomes.map((inc) => ({
                        userId,
                        source: inc.source,
                        amount: inc.amount,
                        date: new Date(),
                    })),
                });
            }

            await tx.user.update({
                where: { id: userId },
                data: { onboardingStep: 3 },
            });

            return { message: 'Incomes saved successfully' };
        });
    }

    /**
     * Step 3: Save budgets and complete onboarding
     */
    async updateBudgets(userId: string, dto: import('./dto/update-budgets.dto').UpdateOnboardingBudgetsDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        return this.prisma.$transaction(async (tx) => {
            if (dto.budgets && dto.budgets.length > 0) {
                await tx.budget.createMany({
                    data: dto.budgets.map((bud) => ({
                        userId,
                        categoryId: bud.categoryId,
                        amount: bud.amount,
                        month: currentMonth,
                        year: currentYear,
                    })),
                });
            }

            await tx.user.update({
                where: { id: userId },
                data: { onboardingStep: 4, onboardingStatus: 'COMPLETED' },
            });

            return { message: 'Budgets saved and onboarding completed successfully' };
        });
    }
}
