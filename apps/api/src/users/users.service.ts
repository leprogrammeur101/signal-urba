import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where:  { id },
      select: {
        id: true, email: true, role: true,
        firstName: true, lastName: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where:  { id },
      data:   dto,
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true, email: true, role: true,
        firstName: true, lastName: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
