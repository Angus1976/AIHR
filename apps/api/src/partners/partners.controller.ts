import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { ReviewPartnerApplicationDto } from './dto/review-partner-application.dto';
import { PartnersService } from './partners.service';

@Controller('partner-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartnersController {
  constructor(private readonly partners: PartnersService) {}

  @Post()
  create(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreatePartnerApplicationDto,
  ) {
    return this.partners.createApplication(user, dto);
  }

  @Get('me')
  listMine(@CurrentUser() user: JwtAccessPayload) {
    return this.partners.listMine(user);
  }

  @Get()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  list(@CurrentUser() user: JwtAccessPayload, @Query('status') status?: string) {
    return this.partners.listForStaff(user, status);
  }

  @Patch(':id/review')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  review(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: ReviewPartnerApplicationDto,
  ) {
    return this.partners.review(user, id, dto);
  }
}
