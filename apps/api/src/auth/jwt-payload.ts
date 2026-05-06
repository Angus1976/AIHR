import { PlatformRole } from '@prisma/client';

export type JwtAccessPayload = {
  sub: string;
  tenantId: string;
  role: PlatformRole;
};
