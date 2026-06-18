import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private prisma: PrismaService) {}

  // ── Créer un signalement ───────────────────────────────────
  async create(userId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        ...dto,
        userId,
      },
      select: REPORT_SELECT,
    });
  }

  // ── Liste avec filtres et pagination ──────────────────────
  async findAll(filters: FilterReportsDto) {
    const { status, categoryId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status)     where.status     = status;
    if (categoryId) where.categoryId = categoryId;

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        select:  REPORT_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ── Signalements d'un utilisateur ────────────────────────
  async findByUser(userId: string) {
    return this.prisma.report.findMany({
      where:   { userId },
      select:  REPORT_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Détail d'un signalement ───────────────────────────────
  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where:  { id },
      select: {
        ...REPORT_SELECT,
        statusHistories: {
          select: {
            id:       true,
            status:   true,
            comment:  true,
            changedAt: true,
            changedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { changedAt: 'desc' },
        },
      },
    });
    if (!report) throw new NotFoundException('Signalement introuvable');
    return report;
  }

  // ── Changer le statut (admin seulement) ───────────────────
  async updateStatus(id: string, adminId: string, dto: UpdateStatusDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
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

    return updated;
  }

  // ── Supprimer (auteur ou admin) ───────────────────────────
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
