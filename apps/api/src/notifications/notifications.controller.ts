import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('me')
  listMine(@CurrentUser() user: JwtAccessPayload) {
    return this.notifications.listMine(user);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: JwtAccessPayload) {
    return this.notifications.unreadCount(user);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    return this.notifications.markRead(user, id);
  }
}
