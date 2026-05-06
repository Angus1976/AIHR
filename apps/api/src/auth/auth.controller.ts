import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { DevLoginDto } from './dto/dev-login.dto';
import { WechatMiniLoginDto } from './dto/wechat-mini-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Post('wechat/mini')
  loginWeChatMini(@Body() dto: WechatMiniLoginDto) {
    return this.auth.loginWeChatMini(dto);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('admin/login')
  loginAdmin(@Body() dto: AdminLoginDto) {
    return this.auth.loginAdmin(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('dev/login')
  loginDev(@Body() dto: DevLoginDto) {
    return this.auth.loginDev(dto);
  }
}
