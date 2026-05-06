import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { CommerceService } from './commerce.service';
import { UpsertServiceProductDto } from './dto/upsert-service-product.dto';

@Controller('service-products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommerceController {
  constructor(private readonly commerce: CommerceService) {}

  @Get()
  list(@CurrentUser() user: JwtAccessPayload, @Query('audience') audience?: string) {
    return this.commerce.listProducts(user, audience);
  }

  @Post()
  @Roles(PlatformRole.ADMIN, PlatformRole.TEACHER)
  upsert(@CurrentUser() user: JwtAccessPayload, @Body() dto: UpsertServiceProductDto) {
    return this.commerce.upsertProduct(user, dto);
  }
}
