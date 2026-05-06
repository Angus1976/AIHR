import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { CreateInterviewOpportunityDto } from './dto/create-interview-opportunity.dto';
import { RespondInterviewOpportunityDto } from './dto/respond-interview-opportunity.dto';
import { InterviewOpportunitiesService } from './interview-opportunities.service';

@Controller('interview-opportunities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InterviewOpportunitiesController {
  constructor(private readonly opportunities: InterviewOpportunitiesService) {}

  @Get()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  list(@CurrentUser() user: JwtAccessPayload) {
    return this.opportunities.listForStaff(user);
  }

  @Post()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateInterviewOpportunityDto) {
    return this.opportunities.create(user, dto);
  }

  @Get('me')
  @Roles(PlatformRole.JOB_SEEKER)
  listMine(@CurrentUser() user: JwtAccessPayload) {
    return this.opportunities.listMine(user);
  }

  @Patch(':id/respond')
  @Roles(PlatformRole.JOB_SEEKER)
  respond(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: RespondInterviewOpportunityDto,
  ) {
    return this.opportunities.respond(user, id, dto);
  }
}
