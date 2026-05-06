import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { ApplyJobDto } from './dto/apply-job.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';
import { MatchingService } from './matching.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobs: JobsService,
    private readonly matching: MatchingService,
  ) {}

  @Get('published')
  @UseGuards(JwtAuthGuard)
  listPublished(@CurrentUser() user: JwtAccessPayload) {
    return this.jobs.listPublished(user);
  }

  @Get(':id/public')
  @UseGuards(JwtAuthGuard)
  getPublished(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    return this.jobs.getPublishedById(user, id);
  }

  @Post(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.JOB_SEEKER)
  apply(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: ApplyJobDto,
  ) {
    return this.jobs.apply(user, id, dto);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  listApplications(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
  ) {
    return this.jobs.listApplicationsForJob(user, id);
  }

  @Get(':id/matches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  listMatches(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    return this.matching.listApplicationMatchesForJob(user, id);
  }

  @Get('enterprise/:enterpriseId/matches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  listEnterpriseMatches(
    @CurrentUser() user: JwtAccessPayload,
    @Param('enterpriseId') enterpriseId: string,
  ) {
    return this.matching.listApplicationMatchesForEnterprise(user, enterpriseId);
  }

  @Get(':id/match-preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.JOB_SEEKER)
  matchPreview(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    return this.matching.matchPreview(user, id);
  }

  @Patch('applications/:applicationId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  updateApplicationStatus(
    @CurrentUser() user: JwtAccessPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.jobs.updateApplicationStatus(user, applicationId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  list(
    @CurrentUser() user: JwtAccessPayload,
    @Query('status') status?: string,
    @Query('enterpriseId') enterpriseId?: string,
  ) {
    return this.jobs.list(user, { status, enterpriseId });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateJobDto) {
    return this.jobs.create(user, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobs.update(user, id, dto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  publish(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    return this.jobs.publish(user, id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  get(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    return this.jobs.getById(user, id);
  }
}
