import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  list(@CurrentUser() user: JwtAccessPayload, @Query('role') role?: PlatformRole) {
    return this.users.list(user, role);
  }

  @Post()
  @Roles(PlatformRole.ADMIN)
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateUserDto) {
    return this.users.create(user, dto);
  }

  @Patch(':userId')
  @Roles(PlatformRole.ADMIN)
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(user, userId, dto);
  }

  @Get(':userId/profile')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  getProfile(@CurrentUser() user: JwtAccessPayload, @Param('userId') userId: string) {
    return this.users.getProfile(user, userId);
  }

  @Patch(':userId/profile')
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  upsertProfile(
    @CurrentUser() user: JwtAccessPayload,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.users.upsertProfile(user, userId, dto);
  }
}
