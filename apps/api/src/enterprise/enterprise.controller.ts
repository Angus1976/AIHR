import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { CreateEnterpriseConfirmationDto } from './dto/create-enterprise-confirmation.dto';
import { UpsertEnterpriseDto } from './dto/upsert-enterprise.dto';
import { EnterpriseService } from './enterprise.service';

@Controller('enterprises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnterpriseController {
  constructor(private readonly enterprise: EnterpriseService) {}

  @Get()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  list(@CurrentUser() user: JwtAccessPayload) {
    return this.enterprise.listForTenant(user);
  }

  @Post()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: UpsertEnterpriseDto) {
    return this.enterprise.create(user, dto);
  }

  @Patch(':enterpriseId')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('enterpriseId') enterpriseId: string,
    @Body() dto: UpsertEnterpriseDto,
  ) {
    return this.enterprise.update(user, enterpriseId, dto);
  }

  @Post('confirmations')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  createConfirmation(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateEnterpriseConfirmationDto,
  ) {
    return this.enterprise.createConfirmation(user, dto);
  }

  @Get(':enterpriseId/job-applications')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  listEnterpriseApplications(
    @CurrentUser() user: JwtAccessPayload,
    @Param('enterpriseId') enterpriseId: string,
  ) {
    return this.enterprise.listJobApplicationsForEnterprise(user, enterpriseId);
  }

  @Post(':enterpriseId/contact-sms/send')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  sendContactSms(
    @CurrentUser() user: JwtAccessPayload,
    @Param('enterpriseId') enterpriseId: string,
  ) {
    return this.enterprise.sendContactSms(user, enterpriseId);
  }
}
