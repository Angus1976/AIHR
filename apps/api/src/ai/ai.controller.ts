import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { AiService } from './ai.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { ImproveServicePromptDto } from './dto/improve-service-prompt.dto';
import { InvokeTestDto } from './dto/invoke-test.dto';
import { PatchRouteDto } from './dto/patch-route.dto';
import { UpsertPromptDto } from './dto/upsert-prompt.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('prompts')
  listPrompts(@CurrentUser() user: JwtAccessPayload) {
    return this.ai.listPrompts(user);
  }

  @Post('prompts')
  upsertPrompt(@CurrentUser() user: JwtAccessPayload, @Body() dto: UpsertPromptDto) {
    return this.ai.upsertPrompt(user, dto);
  }

  @Get('routes')
  listRoutes(@CurrentUser() user: JwtAccessPayload, @Query('scenario') scenario?: string) {
    return this.ai.listRoutes(user, scenario);
  }

  @Post('routes')
  createRoute(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateRouteDto) {
    return this.ai.createRoute(user, dto);
  }

  @Patch('routes/:id')
  patchRoute(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: PatchRouteDto,
  ) {
    return this.ai.patchRoute(user, id, dto);
  }

  @Post('invoke-test')
  invokeTest(@CurrentUser() user: JwtAccessPayload, @Body() dto: InvokeTestDto) {
    return this.ai.invokeTest(user, dto);
  }

  @Get('service-step-insights')
  serviceStepInsights(@CurrentUser() user: JwtAccessPayload) {
    return this.ai.serviceStepInsights(user);
  }

  @Post('service-step-prompts/:key/improve')
  improveServicePrompt(
    @CurrentUser() user: JwtAccessPayload,
    @Param('key') key: string,
    @Body() dto: ImproveServicePromptDto,
  ) {
    return this.ai.improveServicePrompt(user, key, dto);
  }
}
