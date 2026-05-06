import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { ComplianceService } from './compliance.service';
import { UpsertComplianceTemplateDto } from './dto/upsert-compliance-template.dto';

@Controller('compliance/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplianceTemplatesController {
  constructor(private readonly compliance: ComplianceService) {}

  @Get()
  list(@CurrentUser() user: JwtAccessPayload, @Query('purpose') purpose?: string) {
    return this.compliance.listTemplates(user, purpose);
  }

  @Post()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  upsert(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: UpsertComplianceTemplateDto,
  ) {
    return this.compliance.upsertTemplate(user, dto);
  }
}
