import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlatformRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { JwtAccessPayload } from './jwt-payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<PlatformRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    if (required.length === 0) return true;
    const req = context.switchToHttp().getRequest<{ user: JwtAccessPayload }>();
    const user = req.user;
    if (!user) throw new ForbiddenException();
    if (!required.includes(user.role)) {
      throw new ForbiddenException('无权访问');
    }
    return true;
  }
}
