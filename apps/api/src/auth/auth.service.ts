import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma:  PrismaService,
    private jwt:     JwtService,
    private config:  ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Cet email est déjà utilisé');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email:     dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName:  dto.lastName,
      },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id, email: user.email,
        role: user.role, firstName: user.firstName, lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async refresh(userId: string, email: string, role: string, oldToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: oldToken },
      data:  { revoked: true },
    });
    return this.generateTokens(userId, email, role);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data:  { revoked: true },
    });
    return { message: 'Déconnexion réussie' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret:    this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret:    this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
    });

    await this.prisma.refreshToken.create({
      data: {
        token:     refreshToken,
        userId,
        expiresAt: addDays(new Date(), 7),
      },
    });

    return { accessToken, refreshToken };
  }
}
