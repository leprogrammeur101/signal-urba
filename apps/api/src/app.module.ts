import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadsModule } from './uploads/uploads.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting global : 100 requêtes / 60 secondes par IP
    ThrottlerModule.forRoot([{
      name:    'global',
      ttl:     60000,  // 60 secondes
      limit:   100,
    }, {
      // Limite stricte pour les routes auth : 10 tentatives / minute
      name:    'auth',
      ttl:     60000,
      limit:   10,
    }]),

    PrismaModule,
    AuthModule,
    UsersModule,
    ReportsModule,
    CategoriesModule,
    UploadsModule,
    NotificationsModule,
  ],
  providers: [
    // Guard global appliqué à toutes les routes
    {
      provide:  APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
