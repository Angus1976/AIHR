import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { SignContractDto } from './dto/sign-contract.dto';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contracts: ContractsService) {}

  @Get()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  list(@CurrentUser() user: JwtAccessPayload) {
    return this.contracts.listForStaff(user);
  }

  @Post()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateContractDto) {
    return this.contracts.create(user, dto);
  }

  @Get('me')
  listMine(@CurrentUser() user: JwtAccessPayload) {
    return this.contracts.listMine(user);
  }

  @Post(':id/sign-stub')
  signStub(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: SignContractDto,
  ) {
    return this.contracts.signStub(user, id, dto);
  }
}
