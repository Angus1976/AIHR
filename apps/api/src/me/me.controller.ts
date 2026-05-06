import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { CreateMockInterviewDto } from './dto/create-mock-interview.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MeService } from './me.service';
import { MockInterviewService } from './mock-interview.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly me: MeService,
    private readonly mockInterview: MockInterviewService,
  ) {}

  @Get('applications')
  myApplications(@CurrentUser() user: JwtAccessPayload) {
    return this.me.listMyApplications(user);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: JwtAccessPayload) {
    return this.me.getProfile(user);
  }

  @Put('profile')
  putProfile(@CurrentUser() user: JwtAccessPayload, @Body() dto: UpdateProfileDto) {
    return this.me.upsertProfile(user, dto);
  }

  /** 腾讯会议·模拟面试会话（通信能力对接会议；会中引导与记录由会议侧能力承载） */
  @Get('mock-interview/sessions')
  @UseGuards(RolesGuard)
  @Roles(PlatformRole.JOB_SEEKER)
  listMockInterviewSessions(@CurrentUser() user: JwtAccessPayload) {
    return this.mockInterview.listMine(user);
  }

  @Post('mock-interview/sessions')
  @UseGuards(RolesGuard)
  @Roles(PlatformRole.JOB_SEEKER)
  createMockInterviewSession(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateMockInterviewDto,
  ) {
    return this.mockInterview.create(user, dto);
  }
}
