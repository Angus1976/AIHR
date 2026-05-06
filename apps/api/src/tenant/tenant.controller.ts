import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantService } from './tenant.service';

@Controller('tenant')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private readonly tenant: TenantService) {}

  @Get('current')
  current(@CurrentUser() user: JwtAccessPayload) {
    return this.tenant.current(user);
  }

  @Patch('current')
  updateCurrent(@CurrentUser() user: JwtAccessPayload, @Body() dto: UpdateTenantDto) {
    return this.tenant.updateCurrent(user, dto);
  }
}
