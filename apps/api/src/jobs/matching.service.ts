import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';

const PUBLISHED = 'PUBLISHED';

function tokenizeCorpus(text: string): Set<string> {
  const out = new Set<string>();
  const lower = text.toLowerCase();
  for (const m of lower.matchAll(/[a-z0-9]{2,}/g)) {
    out.add(m[0]);
  }
  const han = lower.replace(/[^\u4e00-\u9fff]/g, '');
  for (let i = 0; i + 1 < han.length; i++) {
    out.add(han.slice(i, i + 2));
  }
  if (han.length === 1) out.add(han);
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) {
    if (b.has(t)) inter++;
  }
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function scoreProfile(params: {
  jobTitle: string;
  jdMarkdown?: string | null;
  headline?: string | null;
  skillsText?: string | null;
  resumeMarkdown?: string | null;
}) {
  const jobText = `${params.jobTitle}\n${params.jdMarkdown ?? ''}`;
  const jobTok = tokenizeCorpus(jobText);
  const seekerText = [
    params.headline,
    params.skillsText,
    params.resumeMarkdown,
  ]
    .filter(Boolean)
    .join('\n');
  const seekerTok = tokenizeCorpus(seekerText);
  const score = jaccard(jobTok, seekerTok);
  const matched: string[] = [];
  for (const t of seekerTok) {
    if (jobTok.has(t)) matched.push(t);
  }
  matched.sort();
  return {
    score: Math.round(score * 1000) / 1000,
    profileFilled: Boolean(seekerText.trim()),
    matchedTokens: matched.slice(0, 40),
    matchedTokenCount: matched.length,
  };
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  private assertStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
  }

  async matchPreview(actor: JwtAccessPayload, jobId: string) {
    if (actor.role !== PlatformRole.JOB_SEEKER) {
      throw new ForbiddenException('仅求职者可查看匹配预览');
    }
    const job = await this.prisma.jobPosting.findFirst({
      where: { id: jobId, tenantId: actor.tenantId, status: PUBLISHED },
      select: { id: true, title: true, jdMarkdown: true },
    });
    if (!job) {
      throw new NotFoundException('岗位不存在或未发布');
    }
    const profile = await this.prisma.jobSeekerProfile.findUnique({
      where: { userId: actor.sub },
    });
    const match = scoreProfile({
      jobTitle: job.title,
      jdMarkdown: job.jdMarkdown,
      headline: profile?.headline,
      skillsText: profile?.skillsText,
      resumeMarkdown: profile?.resumeMarkdown,
    });
    return {
      jobId: job.id,
      ...match,
    };
  }

  async listApplicationMatchesForJob(actor: JwtAccessPayload, jobId: string) {
    this.assertStaff(actor);
    const job = await this.prisma.jobPosting.findFirst({
      where: { id: jobId, tenantId: actor.tenantId },
      select: { id: true, title: true, jdMarkdown: true },
    });
    if (!job) {
      throw new NotFoundException('岗位不存在');
    }
    const rows = await this.prisma.jobApplication.findMany({
      where: { jobPostingId: job.id, tenantId: actor.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        seeker: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            email: true,
            role: true,
            jobSeekerProfile: {
              select: {
                headline: true,
                skillsText: true,
                resumeMarkdown: true,
              },
            },
          },
        },
      },
    });
    return rows
      .map((row) => {
        const profile = row.seeker.jobSeekerProfile;
        const { jobSeekerProfile: _profile, ...seeker } = row.seeker;
        return {
          ...row,
          seeker,
          match: scoreProfile({
            jobTitle: job.title,
            jdMarkdown: job.jdMarkdown,
            headline: profile?.headline,
            skillsText: profile?.skillsText,
            resumeMarkdown: profile?.resumeMarkdown,
          }),
        };
      })
      .sort((a, b) => b.match.score - a.match.score);
  }

  async listApplicationMatchesForEnterprise(actor: JwtAccessPayload, enterpriseId: string) {
    this.assertStaff(actor);
    const enterprise = await this.prisma.enterprise.findFirst({
      where: { id: enterpriseId, tenantId: actor.tenantId },
      select: { id: true },
    });
    if (!enterprise) {
      throw new NotFoundException('企业不存在');
    }
    const rows = await this.prisma.jobApplication.findMany({
      where: {
        tenantId: actor.tenantId,
        jobPosting: { enterpriseId: enterprise.id },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            status: true,
            jdMarkdown: true,
          },
        },
        seeker: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            email: true,
            role: true,
            jobSeekerProfile: {
              select: {
                headline: true,
                skillsText: true,
                resumeMarkdown: true,
              },
            },
          },
        },
      },
    });
    return rows
      .map((row) => {
        const profile = row.seeker.jobSeekerProfile;
        const { jobSeekerProfile: _profile, ...seeker } = row.seeker;
        const { jdMarkdown: _jdMarkdown, ...jobPosting } = row.jobPosting;
        return {
          ...row,
          jobPosting,
          seeker,
          match: scoreProfile({
            jobTitle: row.jobPosting.title,
            jdMarkdown: row.jobPosting.jdMarkdown,
            headline: profile?.headline,
            skillsText: profile?.skillsText,
            resumeMarkdown: profile?.resumeMarkdown,
          }),
        };
      })
      .sort((a, b) => {
        const byJob = a.jobPosting.title.localeCompare(b.jobPosting.title, 'zh-Hans-CN');
        if (byJob !== 0) return byJob;
        return b.match.score - a.match.score;
      });
  }
}
