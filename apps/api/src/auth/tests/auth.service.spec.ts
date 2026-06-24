import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock PrismaService
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create:     jest.fn(),
  },
  refreshToken: {
    create:      jest.fn(),
    updateMany:  jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

const mockConfig = {
  get: jest.fn().mockReturnValue('test-secret'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService,  useValue: mockPrisma },
        { provide: JwtService,     useValue: mockJwt   },
        { provide: ConfigService,  useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1', email: 'test@test.ci',
        role: 'CITIZEN', firstName: 'Kouamé', lastName: 'Koffi',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({
        email: 'test@test.ci', password: 'MotDePasse123!',
        firstName: 'Kouamé', lastName: 'Koffi',
      });

      expect(result.user.email).toBe('test@test.ci');
      expect(result.accessToken).toBe('mock-token');
    });

    it('devrait lever ConflictException si email déjà utilisé', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.register({
        email: 'existant@test.ci', password: 'MotDePasse123!',
      })).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec les bons identifiants', async () => {
      const hash = await bcrypt.hash('MotDePasse123!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.ci',
        passwordHash: hash, role: 'CITIZEN',
        firstName: 'Kouamé', lastName: 'Koffi',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'test@test.ci', password: 'MotDePasse123!',
      });

      expect(result.accessToken).toBeDefined();
    });

    it('devrait lever UnauthorizedException si utilisateur introuvable', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({
        email: 'inconnu@test.ci', password: 'MotDePasse123!',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever UnauthorizedException si mot de passe incorrect', async () => {
      const hash = await bcrypt.hash('BonMotDePasse!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.ci', passwordHash: hash,
      });

      await expect(service.login({
        email: 'test@test.ci', password: 'MauvaisMotDePasse!',
      })).rejects.toThrow(UnauthorizedException);
    });
  });
});
