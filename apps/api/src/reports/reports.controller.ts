import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { Role } from '../generated/prisma/client';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FilterReportsDto } from './dto/filter-reports.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  // POST /reports — créer un signalement (authentifié)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() dto: CreateReportDto) {
    return this.reportsService.create(user.id, dto);
  }

  // GET /reports — liste avec filtres (public)
  @Get()
  findAll(@Query() filters: FilterReportsDto) {
    return this.reportsService.findAll(filters);
  }

  // GET /reports/me — mes signalements (authentifié)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) {
    return this.reportsService.findByUser(user.id);
  }

  // GET /reports/:id — détail (public)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  // PATCH /reports/:id/status — changer statut (admin)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.reportsService.updateStatus(id, user.id, dto);
  }

  // DELETE /reports/:id — supprimer (auteur ou admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reportsService.remove(id, user.id, user.role);
  }
}
