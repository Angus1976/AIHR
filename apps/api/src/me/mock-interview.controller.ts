import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateMockInterviewDto } from './dto/create-mock-interview.dto';
import { MockInterviewService } from './mock-interview.service';

@Controller('mock-interviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MockInterviewController {
  constructor(private readonly mockInterview: MockInterviewService) {}

  @Get('users/:userId/sessions')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  listForUser(
    @CurrentUser() user: JwtAccessPayload,
    @Param('userId') userId: string,
  ) {
    return this.mockInterview.listForSeeker(user, userId);
  }

  @Post('users/:userId/sessions')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  createForUser(
    @CurrentUser() user: JwtAccessPayload,
    @Param('userId') userId: string,
    @Body() dto: CreateMockInterviewDto,
  ) {
    return this.mockInterview.createForSeeker(user, userId, dto);
  }
}
