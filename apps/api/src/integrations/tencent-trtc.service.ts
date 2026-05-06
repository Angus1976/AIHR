import { Injectable, Logger } from '@nestjs/common';

export type TrtcInterviewRoom = {
  roomId: string;
  sdkAppId?: string;
  userSig?: string;
  sceneConfig: Record<string, string | string[]>;
};

@Injectable()
export class TencentTrtcService {
  private readonly logger = new Logger(TencentTrtcService.name);

  /**
   * TRTC 真实接入需要 UserSig 签发、房间生命周期与客户端 SDK 初始化。
   * 当前返回稳定的本地配置，保证端到端数据结构先跑通，生产只需替换签发逻辑。
   */
  async createInterviewRoom(params: {
    tenantId: string;
    seekerUserId: string;
    sceneMode: 'STANDARD' | 'VR';
    vrSceneKey?: string | null;
    vrSceneName?: string | null;
  }): Promise<TrtcInterviewRoom> {
    const sdkAppId = process.env.TRTC_SDK_APP_ID?.trim();
    const enabled = process.env.TRTC_API_ENABLED === 'true';
    if (!enabled) {
      this.logger.log('TRTC_API_ENABLED!=true，返回 TRTC 本地占位配置');
    }
    const roomId = `trtc-${params.tenantId.slice(0, 6)}-${Date.now()}`;
    return {
      roomId,
      sdkAppId,
      userSig: enabled ? undefined : 'stub-user-sig',
      sceneConfig: {
        mode: params.sceneMode,
        vrSceneKey: params.vrSceneKey || 'interview-room-classic',
        vrSceneName:
          params.vrSceneName ||
          (params.sceneMode === 'VR' ? '沉浸式面试间' : '标准视频面试间'),
        cameraPolicy: 'front_camera_required',
        screenPolicy: 'candidate_screen_hidden',
        assistPrevention: [
          '请保持摄像头开启并独立作答',
          '作答过程不展示实时答案提示',
          '如需记录，仅展示问题与计时信息',
        ],
      },
    };
  }
}
