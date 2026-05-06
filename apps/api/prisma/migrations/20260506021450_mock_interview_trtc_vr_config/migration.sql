-- CreateEnum
CREATE TYPE "MockInterviewTransport" AS ENUM ('TENCENT_MEETING', 'TRTC', 'HYBRID');

-- CreateEnum
CREATE TYPE "MockInterviewSceneMode" AS ENUM ('STANDARD', 'VR');

-- AlterTable
ALTER TABLE "MockInterviewSession" ADD COLUMN     "antiAssistRules" JSONB,
ADD COLUMN     "evaluationFocus" JSONB,
ADD COLUMN     "interviewerRequirements" TEXT,
ADD COLUMN     "interviewerRole" TEXT,
ADD COLUMN     "sceneConfig" JSONB,
ADD COLUMN     "sceneMode" "MockInterviewSceneMode" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "transport" "MockInterviewTransport" NOT NULL DEFAULT 'TENCENT_MEETING',
ADD COLUMN     "trtcRoomId" TEXT,
ADD COLUMN     "trtcSdkAppId" TEXT,
ADD COLUMN     "trtcUserSig" TEXT,
ADD COLUMN     "vrSceneKey" TEXT,
ADD COLUMN     "vrSceneName" TEXT,
ADD COLUMN     "vrSceneUrl" TEXT;
