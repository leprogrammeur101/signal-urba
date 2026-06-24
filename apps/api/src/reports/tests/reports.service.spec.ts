import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReportsService } from '../reports.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

const mockPrisma = {
  report: {
    create:     jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
  },
  statusHistory: {
    create: jest.fn(),
  },
};

const mockNotifications = {
  notifyStatusChange: jest.fn(),
};

const MOCK_REPORT = {
  id: 'report-1', title: 'Nid de poule',
  status: 'NEW', latitude: 5.36, longitude: -4.01,
  category: { id: 'cat-1', name: 'Voirie', slug: 'voirie', icon: 'road' },
  user: { id: 'user-1', firstName: 'Kouamé', lastName: 'Koffi', email: 'k@k.ci' },
};

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService,        useValue: mockPrisma        },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer un signalement', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });
      mockPrisma.report.create.mockResolvedValue(MOCK_REPORT);

      const result = await service.create('user-1', {
        categoryId: 'cat-1', latitude: 5.36, longitude: -4.01,
        title: 'Nid de poule',
      });

      expect(result.title).toBe('Nid de poule');
    });

    it('devrait lever BadRequestException si catégorie inexistante', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', {
        categoryId: 'cat-inexistante', latitude: 5.36, longitude: -4.01,
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('devrait retourner un signalement existant', async () => {
      mockPrisma.report.findUnique.mockResolvedValue({
        ...MOCK_REPORT, statusHistories: [],
      });

      const result = await service.findOne('report-1');
      expect(result.id).toBe('report-1');
    });

    it('devrait lever NotFoundException si signalement introuvable', async () => {
      mockPrisma.report.findUnique.mockResolvedValue(null);

      await expect(service.findOne('inexistant')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('devrait changer le statut et notifier le citoyen', async () => {
      mockPrisma.report.findUnique.mockResolvedValue({ userId: 'user-1' });
      mockPrisma.report.update.mockResolvedValue({ ...MOCK_REPORT, status: 'RESOLVED' });
      mockPrisma.statusHistory.create.mockResolvedValue({});
      mockNotifications.notifyStatusChange.mockResolvedValue(undefined);

      const result = await service.updateStatus('report-1', 'admin-1', {
        status: 'RESOLVED' as any, comment: 'Réparé !',
      });

      expect(result.status).toBe('RESOLVED');
      expect(mockNotifications.notifyStatusChange).toHaveBeenCalledWith(
        'report-1', 'user-1', 'RESOLVED', 'Réparé !',
      );
    });

    it('devrait lever NotFoundException si signalement introuvable', async () => {
      mockPrisma.report.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('inexistant', 'admin-1', {
        status: 'RESOLVED' as any,
      })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('devrait empêcher un non-auteur de supprimer', async () => {
      mockPrisma.report.findUnique.mockResolvedValue({ userId: 'autre-user' });

      await expect(service.remove('report-1', 'user-1', 'CITIZEN'))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
