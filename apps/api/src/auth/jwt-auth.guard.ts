import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlatformRole } from '@prisma/client';
import { Request } from 'express';
import { JwtAccessPayload } from './jwt-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: JwtAccessPayload }>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少 Authorization Bearer');
    }
    const token = header.slice('Bearer '.length).trim();
    try {
      const payload = this.jwt.verify<JwtAccessPayload>(token);
      if (!payload.sub || !payload.tenantId || !payload.role) {
        throw new UnauthorizedException('Token 无效');
      }
      req.user = {
        sub: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role as PlatformRole,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }
}
