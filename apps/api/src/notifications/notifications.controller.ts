import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class RegisterTokenDto {
  @IsString()
  token: string;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // POST /notifications/register-token
  @Post('register-token')
  registerToken(@CurrentUser() user: any, @Body() dto: RegisterTokenDto) {
    return this.notificationsService.registerToken(user.id, dto.token);
  }
}
