import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { ComplianceService } from './compliance.service';
import { CreateConsentDto } from './dto/create-consent.dto';

@Controller('consents')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly compliance: ComplianceService) {}

  @Post()
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateConsentDto) {
    return this.compliance.createConsent(user, dto);
  }

  @Get('me')
  listMe(@CurrentUser() user: JwtAccessPayload) {
    return this.compliance.listMyConsents(user);
  }
}
