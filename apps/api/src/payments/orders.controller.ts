import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { ReviewRefundRequestDto } from './dto/review-refund-request.dto';
import { PaymentsService } from './payments.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  list(@CurrentUser() user: JwtAccessPayload) {
    return this.payments.listOrdersForStaff(user);
  }

  @Get('me')
  listMine(@CurrentUser() user: JwtAccessPayload) {
    return this.payments.listMyOrders(user);
  }

  @Post(':orderId/refund-requests')
  createRefundRequest(
    @CurrentUser() user: JwtAccessPayload,
    @Param('orderId') orderId: string,
    @Body() dto: CreateRefundRequestDto,
  ) {
    return this.payments.createRefundRequest(user, orderId, dto);
  }

  @Get('refund-requests')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  listRefundRequests(@CurrentUser() user: JwtAccessPayload) {
    return this.payments.listRefundRequestsForStaff(user);
  }

  @Get('refund-requests/me')
  listMyRefundRequests(@CurrentUser() user: JwtAccessPayload) {
    return this.payments.listMyRefundRequests(user);
  }

  @Patch('refund-requests/:id/review')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  reviewRefundRequest(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: ReviewRefundRequestDto,
  ) {
    return this.payments.reviewRefundRequest(user, id, dto);
  }
}
