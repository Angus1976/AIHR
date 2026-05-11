import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  MockInterviewSceneMode,
  MockInterviewTransport,
  PlatformRole,
} from '@prisma/client';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { TencentMeetingService } from '../integrations/tencent-meeting.service';
import { TencentTrtcService } from '../integrations/tencent-trtc.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMockInterviewDto } from './dto/create-mock-interview.dto';

@Injectable()
export class MockInterviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tencentMeeting: TencentMeetingService,
    private readonly tencentTrtc: TencentTrtcService,
  ) {}

  async listMine(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.JOB_SEEKER) throw new ForbiddenException();
    return this.listForSeeker(actor, actor.sub);
  }

  async listForSeeker(actor: JwtAccessPayload, seekerUserId: string) {
    const isOwner = actor.role === PlatformRole.JOB_SEEKER && actor.sub === seekerUserId;
    const isStaff = actor.role === PlatformRole.ADMIN || actor.role === PlatformRole.TEACHER;
    if (!isOwner && !isStaff) throw new ForbiddenException();
    return this.prisma.mockInterviewSession.findMany({
      where: { tenantId: actor.tenantId, seekerUserId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async create(actor: JwtAccessPayload, dto: CreateMockInterviewDto) {
    if (actor.role !== PlatformRole.JOB_SEEKER) throw new ForbiddenException();
    return this.createForSeeker(actor, actor.sub, dto);
  }

  async createForSeeker(actor: JwtAccessPayload, seekerUserId: string, dto: CreateMockInterviewDto) {
    const isOwner = actor.role === PlatformRole.JOB_SEEKER && actor.sub === seekerUserId;
    const isStaff = actor.role === PlatformRole.ADMIN || actor.role === PlatformRole.TEACHER;
    if (!isOwner && !isStaff) throw new ForbiddenException();

    if (dto.servicePlanId?.trim()) {
      const plan = await this.prisma.seekerServicePlan.findFirst({
        where: {
          id: dto.servicePlanId.trim(),
          tenantId: actor.tenantId,
          seekerUserId,
        },
      });
      if (!plan) throw new NotFoundException('服务计划不存在或不属于当前用户');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: seekerUserId, tenantId: actor.tenantId },
    });
    if (!user) throw new NotFoundException('用户不存在');

    const transport = dto.transport ?? MockInterviewTransport.TENCENT_MEETING;
    const sceneMode = dto.sceneMode ?? MockInterviewSceneMode.STANDARD;
    const interviewerRole =
      dto.interviewerRole?.trim() || '业务面试官';
    const interviewerRequirements =
      dto.interviewerRequirements?.trim() ||
      '围绕岗位匹配、项目经历、表达结构与稳定性进行追问，保持专业、客观和节奏感。';
    const evaluationFocus = (dto.evaluationFocus?.length
      ? dto.evaluationFocus
      : ['岗位理解', '项目复盘', '表达结构', '临场沟通'])
      .map((x) => String(x).trim())
      .filter(Boolean)
      .slice(0, 8);
    const antiAssistRules = (dto.antiAssistRules?.length
      ? dto.antiAssistRules
      : [
          '保持摄像头开启并独立作答',
          '不在作答区展示实时答案或外部提示',
          '回答以个人经历和现场思考为准',
        ])
      .map((x) => String(x).trim())
      .filter(Boolean)
      .slice(0, 8);
    const subject = `职得 Jobde · 模拟面试 · ${user.displayName}`;
    const m = await this.tencentMeeting.createMockInterviewMeeting({
      subject,
      seekerDisplayName: user.displayName,
    });
    const trtc =
      transport === MockInterviewTransport.TRTC ||
      transport === MockInterviewTransport.HYBRID
        ? await this.tencentTrtc.createInterviewRoom({
            tenantId: actor.tenantId,
            seekerUserId,
            sceneMode,
            vrSceneKey: dto.vrSceneKey?.trim() || null,
            vrSceneName: dto.vrSceneName?.trim() || null,
          })
        : null;

    return this.prisma.mockInterviewSession.create({
      data: {
        tenantId: actor.tenantId,
        seekerUserId,
        servicePlanId: dto.servicePlanId?.trim() || null,
        meetingId: m.meetingId,
        joinUrl: m.joinUrl,
        subject,
        startTime: m.startTime,
        endTime: m.endTime,
        robotSideNote: m.robotSideNote,
        provider:
          transport === MockInterviewTransport.TRTC
            ? 'TENCENT_TRTC'
            : transport === MockInterviewTransport.HYBRID
              ? 'TENCENT_MEETING_TRTC'
              : 'TENCENT_MEETING',
        transport,
        sceneMode,
        interviewerRole,
        interviewerRequirements,
        evaluationFocus,
        antiAssistRules,
        trtcRoomId: trtc?.roomId ?? null,
        trtcUserSig: trtc?.userSig ?? null,
        trtcSdkAppId: trtc?.sdkAppId ?? null,
        vrSceneKey: trtc?.sceneConfig?.vrSceneKey
          ? String(trtc.sceneConfig.vrSceneKey)
          : dto.vrSceneKey?.trim() || null,
        vrSceneName: trtc?.sceneConfig?.vrSceneName
          ? String(trtc.sceneConfig.vrSceneName)
          : dto.vrSceneName?.trim() || null,
        sceneConfig: {
          ...(trtc?.sceneConfig ?? {}),
          interviewerRole,
          interviewerRequirements,
          evaluationFocus,
          antiAssistRules,
        },
        rawResponse: { meeting: m, trtc },
      },
    });
  }
}
