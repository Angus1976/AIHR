import { Injectable, Logger } from '@nestjs/common';

/**
 * 腾讯会议：模拟面试通信能力（REST / 应用接入）。
 * 生产环境需配置 SDK 凭证与回调；会中引导、记录与复盘说明可通过腾讯会议开放平台应用能力承载。
 * @see https://cloud.tencent.com/document/product/1095 （以当前官方文档为准）
 */
@Injectable()
export class TencentMeetingService {
  private readonly logger = new Logger(TencentMeetingService.name);

  /**
   * 创建一场用于「面试辅导」的在线会议。
   * 未开启 TENCENT_MEETING_API_ENABLED 时返回可联调占位，便于前后端贯通。
   */
  async createMockInterviewMeeting(params: {
    subject: string;
    seekerDisplayName: string;
  }): Promise<{
    meetingId: string;
    joinUrl: string;
    startTime: Date;
    endTime: Date;
    robotSideNote: string;
  }> {
    const enabled = process.env.TENCENT_MEETING_API_ENABLED === 'true';
    const start = new Date();
    const end = new Date(start.getTime() + 45 * 60 * 1000);

    if (!enabled) {
      this.logger.log('TENCENT_MEETING_API_ENABLED!=true，返回模拟面试占位会议信息');
      return {
        meetingId: `stub-txm-${Date.now()}`,
        joinUrl:
          'https://meeting.tencent.com/v2/stub-placeholder?rel=aihr-mock-interview（配置真实 API 后替换为入会链接）',
        startTime: start,
        endTime: end,
        robotSideNote:
          '【工程占位】请使用腾讯会议客户端入会。会中引导、记录与复盘说明由会议侧配置能力承载；本段为产品说明，非会议内实时数据。',
      };
    }

    this.logger.warn('TENCENT_MEETING_API_ENABLED=true 但 HTTP 接入未实现，请先实现 create meeting 调用');
    return {
      meetingId: `pending-sdk-${Date.now()}`,
      joinUrl: 'https://meeting.tencent.com/',
      startTime: start,
      endTime: end,
      robotSideNote:
        '请在 TencentMeetingService 中接入「创建会议」「获取入会链接」接口，并在会中完成引导、记录与复盘说明配置。',
    };
  }
}
