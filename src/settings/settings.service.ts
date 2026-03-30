// src/settings/settings.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string) {
    return this.prisma.settings.findUnique({
      where: { userId },
    });
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const existing = await this.prisma.settings.findUnique({
      where: { userId },
    });

    if (!existing) {
      return this.prisma.settings.create({
        data: {
          userId,
          currency: dto.currency ?? 'USD',
          theme: dto.theme ?? 'system',
        },
      });
    }

    return this.prisma.settings.update({
      where: { userId },
      data: dto,
    });
  }
}
