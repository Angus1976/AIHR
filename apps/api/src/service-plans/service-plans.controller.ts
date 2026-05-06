import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { EnsureServicePlanDto } from './dto/ensure-service-plan.dto';
import { FeedbackServiceStepDto } from './dto/feedback-service-step.dto';
import { RequestServiceStepDto } from './dto/request-service-step.dto';
import { UpdatePaymentMilestoneDto } from './dto/update-payment-milestone.dto';
import { UpdateServiceStepDto } from './dto/update-service-step.dto';
import { ServicePlansService } from './service-plans.service';

@Controller('service-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicePlansController {
  constructor(private readonly servicePlans: ServicePlansService) {}

  @Get()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  list(@CurrentUser() user: JwtAccessPayload) {
    return this.servicePlans.list(user);
  }

  @Get('me')
  @Roles(PlatformRole.JOB_SEEKER)
  getMine(@CurrentUser() user: JwtAccessPayload) {
    return this.servicePlans.getMine(user);
  }

  @Post('me/ensure')
  @Roles(PlatformRole.JOB_SEEKER)
  ensureMine(@CurrentUser() user: JwtAccessPayload, @Body() dto: EnsureServicePlanDto) {
    return this.servicePlans.ensureMine(user, dto);
  }

  @Post('users/:userId/ensure')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  ensureForUser(
    @CurrentUser() user: JwtAccessPayload,
    @Param('userId') userId: string,
    @Body() dto: EnsureServicePlanDto,
  ) {
    return this.servicePlans.ensureForUser(user, userId, dto);
  }

  @Get('users/:userId')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  getForUser(@CurrentUser() user: JwtAccessPayload, @Param('userId') userId: string) {
    return this.servicePlans.getForUser(user, userId);
  }

  @Patch(':planId/steps/:stepId')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  updateStep(
    @CurrentUser() user: JwtAccessPayload,
    @Param('planId') planId: string,
    @Param('stepId') stepId: string,
    @Body() dto: UpdateServiceStepDto,
  ) {
    return this.servicePlans.updateStep(user, planId, stepId, dto);
  }

  @Post(':planId/steps/:stepId/request')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER, PlatformRole.JOB_SEEKER)
  requestStepService(
    @CurrentUser() user: JwtAccessPayload,
    @Param('planId') planId: string,
    @Param('stepId') stepId: string,
    @Body() dto: RequestServiceStepDto,
  ) {
    return this.servicePlans.requestStepService(user, planId, stepId, dto);
  }

  @Post(':planId/steps/:stepId/confirm')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER, PlatformRole.JOB_SEEKER)
  confirmStep(
    @CurrentUser() user: JwtAccessPayload,
    @Param('planId') planId: string,
    @Param('stepId') stepId: string,
  ) {
    return this.servicePlans.confirmStep(user, planId, stepId);
  }

  @Patch(':planId/steps/:stepId/interactions/:interactionId/feedback')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER, PlatformRole.JOB_SEEKER)
  feedbackStepInteraction(
    @CurrentUser() user: JwtAccessPayload,
    @Param('planId') planId: string,
    @Param('stepId') stepId: string,
    @Param('interactionId') interactionId: string,
    @Body() dto: FeedbackServiceStepDto,
  ) {
    return this.servicePlans.feedbackStepInteraction(user, planId, stepId, interactionId, dto);
  }

  @Patch(':planId/milestones/:milestoneId')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  updateMilestone(
    @CurrentUser() user: JwtAccessPayload,
    @Param('planId') planId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdatePaymentMilestoneDto,
  ) {
    return this.servicePlans.updateMilestone(user, planId, milestoneId, dto);
  }
}
