import { Injectable } from '@nestjs/common';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(actor: JwtAccessPayload) {
    return this.prisma.jobSeekerProfile.findUnique({
      where: { userId: actor.sub },
    });
  }

  async upsertProfile(actor: JwtAccessPayload, dto: UpdateProfileDto) {
    return this.prisma.jobSeekerProfile.upsert({
      where: { userId: actor.sub },
      create: {
        userId: actor.sub,
        tenantId: actor.tenantId,
        headline: dto.headline?.trim() || null,
        skillsText: dto.skillsText?.trim() || null,
        resumeMarkdown: dto.resumeMarkdown?.trim() || null,
      },
      update: {
        headline: dto.headline !== undefined ? dto.headline?.trim() || null : undefined,
        skillsText: dto.skillsText !== undefined ? dto.skillsText?.trim() || null : undefined,
        resumeMarkdown:
          dto.resumeMarkdown !== undefined ? dto.resumeMarkdown?.trim() || null : undefined,
      },
    });
  }

  async listMyApplications(actor: JwtAccessPayload) {
    return this.prisma.jobApplication.findMany({
      where: { tenantId: actor.tenantId, seekerUserId: actor.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            status: true,
            enterprise: { select: { name: true } },
          },
        },
      },
    });
  }
}
