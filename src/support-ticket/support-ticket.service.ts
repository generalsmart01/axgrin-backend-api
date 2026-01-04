import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { Role } from '@prisma/client';
import { TicketStatus, TicketPriority, TicketCategory } from './dto/update-ticket.dto';
import { NotificationService } from '../notification/notification.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SupportTicketService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private mailService: MailService,
  ) {}

  async create(userId: string, dto: CreateTicketDto): Promise<TicketResponseDto> {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        category: dto.category || TicketCategory.GENERAL,
        priority: dto.priority || TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify customer care staff about new ticket
    await this.notifyCustomerCare(ticket.id);

    // Notify user
    await this.notificationService.create(userId, {
      message: `Your support ticket "${ticket.title}" has been created. We'll get back to you soon!`,
    });

    return this.mapToResponse(ticket);
  }

  async findAll(userId: string, userRole: Role) {
    const where: any = userRole === Role.ADMIN || userRole === Role.CUSTOMER_CARE
      ? {} // Admins and customer care can see all tickets
      : { userId }; // Regular users only see their own tickets

    const tickets = await this.prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map(ticket => this.mapToResponse(ticket));
  }

  async findOne(userId: string, id: string, userRole: Role): Promise<TicketResponseDto> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check permissions
    if (userRole !== Role.ADMIN && userRole !== Role.CUSTOMER_CARE && ticket.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this ticket');
    }

    return this.mapToResponse(ticket);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTicketDto,
    userRole: Role,
  ): Promise<TicketResponseDto> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Permission check: Users can only update their own tickets if status is OPEN
    if (userRole !== Role.ADMIN && userRole !== Role.CUSTOMER_CARE) {
      if (ticket.userId !== userId) {
        throw new ForbiddenException('You do not have permission to update this ticket');
      }
      if (ticket.status !== TicketStatus.OPEN) {
        throw new BadRequestException('You can only update open tickets');
      }
      // Regular users cannot change status, assignedTo, or priority
      if (dto.status || dto.assignedTo || dto.priority) {
        throw new ForbiddenException('You do not have permission to modify this field');
      }
    }

    // Validate assignedTo is customer care or admin
    if (dto.assignedTo) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: dto.assignedTo },
      });
      if (!assignedUser || (assignedUser.role !== Role.CUSTOMER_CARE && assignedUser.role !== Role.ADMIN)) {
        throw new BadRequestException('Can only assign tickets to customer care staff or admins');
      }
    }

    const updateData: any = { ...dto };
    if (dto.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    } else if (dto.status && dto.status !== TicketStatus.RESOLVED && ticket.resolvedAt) {
      updateData.resolvedAt = null;
    }

    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify relevant users about ticket update
    await this.notifyTicketUpdate(updatedTicket, ticket);

    return this.mapToResponse(updatedTicket);
  }

  async remove(userId: string, id: string, userRole: Role): Promise<void> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Only admins can delete tickets
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can delete tickets');
    }

    await this.prisma.supportTicket.delete({
      where: { id },
    });
  }

  async assignTicket(adminId: string, ticketId: string, assignToUserId: string): Promise<TicketResponseDto> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const assignedUser = await this.prisma.user.findUnique({
      where: { id: assignToUserId },
    });

    if (!assignedUser || (assignedUser.role !== Role.CUSTOMER_CARE && assignedUser.role !== Role.ADMIN)) {
      throw new BadRequestException('Can only assign tickets to customer care staff or admins');
    }

    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assignedTo: assignToUserId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify assigned staff
    await this.notificationService.create(assignToUserId, {
      message: `You have been assigned to ticket: "${ticket.title}"`,
    });

    // Notify ticket creator
    await this.notificationService.create(ticket.userId, {
      message: `Your ticket "${ticket.title}" has been assigned to our support team.`,
    });

    return this.mapToResponse(updatedTicket);
  }

  async getTicketStatistics() {
    const [total, open, inProgress, resolved, closed, pending] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({ where: { status: TicketStatus.OPEN } }),
      this.prisma.supportTicket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      this.prisma.supportTicket.count({ where: { status: TicketStatus.RESOLVED } }),
      this.prisma.supportTicket.count({ where: { status: TicketStatus.CLOSED } }),
      this.prisma.supportTicket.count({ where: { status: TicketStatus.PENDING } }),
    ]);

    // Calculate average response time (time from OPEN to first update by staff)
    const resolvedTickets = await this.prisma.supportTicket.findMany({
      where: { status: TicketStatus.RESOLVED },
      select: { createdAt: true, resolvedAt: true },
    });

    let totalResponseTime = 0;
    let countWithResponseTime = 0;
    for (const ticket of resolvedTickets) {
      if (ticket.resolvedAt) {
        const responseTime = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
        totalResponseTime += responseTime;
        countWithResponseTime++;
      }
    }

    const averageResponseTime = countWithResponseTime > 0
      ? Math.round(totalResponseTime / countWithResponseTime / (1000 * 60)) // in minutes
      : 0;

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      pending,
      averageResponseTime,
    };
  }

  private async notifyCustomerCare(ticketId: string) {
    const customerCareStaff = await this.prisma.user.findMany({
      where: { role: Role.CUSTOMER_CARE },
      select: { id: true },
    });

    for (const staff of customerCareStaff) {
      await this.notificationService.create(staff.id, {
        message: `New support ticket #${ticketId.substring(0, 8)} needs attention`,
      });
    }
  }

  private async notifyTicketUpdate(updatedTicket: any, oldTicket: any) {
    // Notify ticket creator if status changed
    if (updatedTicket.status !== oldTicket.status) {
      await this.notificationService.create(updatedTicket.userId, {
        message: `Your ticket "${updatedTicket.title}" status has been updated to ${updatedTicket.status}`,
      });
    }

    // Notify newly assigned staff
    if (updatedTicket.assignedTo && updatedTicket.assignedTo !== oldTicket.assignedTo) {
      await this.notificationService.create(updatedTicket.assignedTo, {
        message: `You have been assigned to ticket: "${updatedTicket.title}"`,
      });
    }
  }

  private mapToResponse(ticket: any): TicketResponseDto {
    return {
      id: ticket.id,
      userId: ticket.userId,
      assignedTo: ticket.assignedTo || undefined,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      resolvedAt: ticket.resolvedAt || undefined,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      user: ticket.user ? {
        id: ticket.user.id,
        email: ticket.user.email,
        firstName: ticket.user.firstName || undefined,
        lastName: ticket.user.lastName || undefined,
      } : undefined,
      assignedStaff: ticket.assignedStaff ? {
        id: ticket.assignedStaff.id,
        email: ticket.assignedStaff.email,
        firstName: ticket.assignedStaff.firstName || undefined,
        lastName: ticket.assignedStaff.lastName || undefined,
      } : undefined,
    };
  }
}

