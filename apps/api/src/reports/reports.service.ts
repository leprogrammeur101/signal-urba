import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FilterReportsDto } from './dto/filter-reports.dto';
import { Role } from '../generated/prisma/client';

const REPORT_SELECT = {
  id:          true,
  title:       true,
  description: true,
  photoUrl:    true,
  latitude:    true,
  longitude:   true,
  address:     true,
  status:      true,
  createdAt:   true,
  updatedAt:   true,
  category: {
    select: { id: true, name: true, slug: true, icon: true },
  },
  user: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

@Injectable()
export class ReportsService {
  constructor(
    private prisma:        PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateReportDto) {
    // 🟡 FIX : Valider que la catégorie existe réellement en base
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(`Catégorie introuvable : ${dto.categoryId}`);
    }

    return this.prisma.report.create({
      data:   { ...dto, userId },
      select: REPORT_SELECT,
    });
  }

  async findAll(filters: FilterReportsDto) {
    const { status, categoryId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status)     where.status     = status;
    if (categoryId) where.categoryId = categoryId;

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where, select: REPORT_SELECT,
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    // 🟡 FIX : Pagination ajoutée sur findByUser
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where:   { userId },
        select:  REPORT_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where: { userId } }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where:  { id },
      select: {
        ...REPORT_SELECT,
        statusHistories: {
          select: {
            id: true, status: true, comment: true, changedAt: true,
            changedBy: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { changedAt: 'desc' },
        },
      },
    });
    if (!report) throw new NotFoundException('Signalement introuvable');
    return report;
  }

  async updateStatus(id: string, adminId: string, dto: UpdateStatusDto) {
    const report = await this.prisma.report.findUnique({
      where:  { id },
      select: { userId: true },
    });
    if (!report) throw new NotFoundException('Signalement introuvable');

    const [updated] = await Promise.all([
      this.prisma.report.update({
        where:  { id },
        data:   { status: dto.status },
        select: REPORT_SELECT,
      }),
      this.prisma.statusHistory.create({
        data: {
          reportId:    id,
          status:      dto.status,
          comment:     dto.comment,
          changedById: adminId,
        },
      }),
    ]);

    // Notification push au citoyen
    await this.notifications.notifyStatusChange(
      id, report.userId, dto.status, dto.comment,
    );

    return updated;
  }

  async remove(id: string, userId: string, userRole: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Signalement introuvable');

    if (report.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Action non autorisée');
    }

    await this.prisma.report.delete({ where: { id } });
    return { message: 'Signalement supprimé' };
  }
}
