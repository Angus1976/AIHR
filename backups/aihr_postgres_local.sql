--
-- PostgreSQL database dump
--

\restrict CDsUyYf4nyQZfhbGJNBOdYA2dDt68WhnjzYI7mdVNoXyWQ6fcMAKQmRX9ddfc2D

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."WxMiniUser" DROP CONSTRAINT IF EXISTS "WxMiniUser_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."WxMiniUser" DROP CONSTRAINT IF EXISTS "WxMiniUser_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserNotification" DROP CONSTRAINT IF EXISTS "UserNotification_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserNotification" DROP CONSTRAINT IF EXISTS "UserNotification_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserConsent" DROP CONSTRAINT IF EXISTS "UserConsent_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserConsent" DROP CONSTRAINT IF EXISTS "UserConsent_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."SmsOtp" DROP CONSTRAINT IF EXISTS "SmsOtp_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."ServiceStepInteraction" DROP CONSTRAINT IF EXISTS "ServiceStepInteraction_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."ServiceStepInteraction" DROP CONSTRAINT IF EXISTS "ServiceStepInteraction_stepId_fkey";
ALTER TABLE IF EXISTS ONLY public."ServiceStepInteraction" DROP CONSTRAINT IF EXISTS "ServiceStepInteraction_requestedById_fkey";
ALTER TABLE IF EXISTS ONLY public."ServiceProduct" DROP CONSTRAINT IF EXISTS "ServiceProduct_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."ServicePaymentMilestone" DROP CONSTRAINT IF EXISTS "ServicePaymentMilestone_planId_fkey";
ALTER TABLE IF EXISTS ONLY public."ServicePaymentMilestone" DROP CONSTRAINT IF EXISTS "ServicePaymentMilestone_orderId_fkey";
ALTER TABLE IF EXISTS ONLY public."SeekerServiceStep" DROP CONSTRAINT IF EXISTS "SeekerServiceStep_planId_fkey";
ALTER TABLE IF EXISTS ONLY public."SeekerServicePlan" DROP CONSTRAINT IF EXISTS "SeekerServicePlan_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."SeekerServicePlan" DROP CONSTRAINT IF EXISTS "SeekerServicePlan_seekerUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."RefundRequest" DROP CONSTRAINT IF EXISTS "RefundRequest_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."RefundRequest" DROP CONSTRAINT IF EXISTS "RefundRequest_requestedById_fkey";
ALTER TABLE IF EXISTS ONLY public."RefundRequest" DROP CONSTRAINT IF EXISTS "RefundRequest_orderId_fkey";
ALTER TABLE IF EXISTS ONLY public."PartnerApplication" DROP CONSTRAINT IF EXISTS "PartnerApplication_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."PartnerApplication" DROP CONSTRAINT IF EXISTS "PartnerApplication_submittedById_fkey";
ALTER TABLE IF EXISTS ONLY public."Order" DROP CONSTRAINT IF EXISTS "Order_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."Order" DROP CONSTRAINT IF EXISTS "Order_payerUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."MockInterviewSession" DROP CONSTRAINT IF EXISTS "MockInterviewSession_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."MockInterviewSession" DROP CONSTRAINT IF EXISTS "MockInterviewSession_servicePlanId_fkey";
ALTER TABLE IF EXISTS ONLY public."MockInterviewSession" DROP CONSTRAINT IF EXISTS "MockInterviewSession_seekerUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."JobSeekerProfile" DROP CONSTRAINT IF EXISTS "JobSeekerProfile_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."JobSeekerProfile" DROP CONSTRAINT IF EXISTS "JobSeekerProfile_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."JobPosting" DROP CONSTRAINT IF EXISTS "JobPosting_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."JobPosting" DROP CONSTRAINT IF EXISTS "JobPosting_enterpriseId_fkey";
ALTER TABLE IF EXISTS ONLY public."JobApplication" DROP CONSTRAINT IF EXISTS "JobApplication_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."JobApplication" DROP CONSTRAINT IF EXISTS "JobApplication_seekerUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."JobApplication" DROP CONSTRAINT IF EXISTS "JobApplication_jobPostingId_fkey";
ALTER TABLE IF EXISTS ONLY public."InterviewOpportunity" DROP CONSTRAINT IF EXISTS "InterviewOpportunity_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."InterviewOpportunity" DROP CONSTRAINT IF EXISTS "InterviewOpportunity_seekerUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."InterviewOpportunity" DROP CONSTRAINT IF EXISTS "InterviewOpportunity_pushedById_fkey";
ALTER TABLE IF EXISTS ONLY public."InterviewOpportunity" DROP CONSTRAINT IF EXISTS "InterviewOpportunity_jobPostingId_fkey";
ALTER TABLE IF EXISTS ONLY public."Enterprise" DROP CONSTRAINT IF EXISTS "Enterprise_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."EnterpriseConfirmation" DROP CONSTRAINT IF EXISTS "EnterpriseConfirmation_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."EnterpriseConfirmation" DROP CONSTRAINT IF EXISTS "EnterpriseConfirmation_performedById_fkey";
ALTER TABLE IF EXISTS ONLY public."EnterpriseConfirmation" DROP CONSTRAINT IF EXISTS "EnterpriseConfirmation_enterpriseId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAgreement" DROP CONSTRAINT IF EXISTS "ContractAgreement_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAgreement" DROP CONSTRAINT IF EXISTS "ContractAgreement_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAgreement" DROP CONSTRAINT IF EXISTS "ContractAgreement_templateId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAgreement" DROP CONSTRAINT IF EXISTS "ContractAgreement_orderId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAgreement" DROP CONSTRAINT IF EXISTS "ContractAgreement_jobApplicationId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAgreement" DROP CONSTRAINT IF EXISTS "ContractAgreement_enterpriseId_fkey";
ALTER TABLE IF EXISTS ONLY public."ComplianceTemplate" DROP CONSTRAINT IF EXISTS "ComplianceTemplate_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_performedById_fkey";
ALTER TABLE IF EXISTS ONLY public."AiPromptTemplate" DROP CONSTRAINT IF EXISTS "AiPromptTemplate_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."AiLlmRoute" DROP CONSTRAINT IF EXISTS "AiLlmRoute_tenantId_fkey";
DROP INDEX IF EXISTS public."WxMiniUser_tenantId_openid_key";
DROP INDEX IF EXISTS public."User_tenantId_phone_key";
DROP INDEX IF EXISTS public."User_tenantId_email_key";
DROP INDEX IF EXISTS public."UserNotification_tenantId_userId_readAt_createdAt_idx";
DROP INDEX IF EXISTS public."UserConsent_tenantId_userId_purpose_createdAt_idx";
DROP INDEX IF EXISTS public."Tenant_wxMiniAppId_key";
DROP INDEX IF EXISTS public."Tenant_slug_key";
DROP INDEX IF EXISTS public."SmsOtp_phone_purpose_createdAt_idx";
DROP INDEX IF EXISTS public."ServiceStepInteraction_tenantId_stepId_createdAt_idx";
DROP INDEX IF EXISTS public."ServiceStepInteraction_tenantId_requestedById_createdAt_idx";
DROP INDEX IF EXISTS public."ServiceProduct_tenantId_code_key";
DROP INDEX IF EXISTS public."ServiceProduct_tenantId_audience_enabled_idx";
DROP INDEX IF EXISTS public."ServicePaymentMilestone_planId_sortOrder_idx";
DROP INDEX IF EXISTS public."ServicePaymentMilestone_planId_key_key";
DROP INDEX IF EXISTS public."SeekerServiceStep_planId_sortOrder_idx";
DROP INDEX IF EXISTS public."SeekerServiceStep_planId_key_key";
DROP INDEX IF EXISTS public."SeekerServicePlan_tenantId_status_updatedAt_idx";
DROP INDEX IF EXISTS public."SeekerServicePlan_tenantId_seekerUserId_key";
DROP INDEX IF EXISTS public."RefundRequest_tenantId_requestedById_createdAt_idx";
DROP INDEX IF EXISTS public."RefundRequest_tenantId_orderId_status_idx";
DROP INDEX IF EXISTS public."PartnerApplication_tenantId_submittedById_idx";
DROP INDEX IF EXISTS public."PartnerApplication_tenantId_status_createdAt_idx";
DROP INDEX IF EXISTS public."Order_outTradeNo_key";
DROP INDEX IF EXISTS public."MockInterviewSession_tenantId_status_idx";
DROP INDEX IF EXISTS public."MockInterviewSession_tenantId_seekerUserId_createdAt_idx";
DROP INDEX IF EXISTS public."JobSeekerProfile_userId_key";
DROP INDEX IF EXISTS public."JobApplication_tenantId_seekerUserId_idx";
DROP INDEX IF EXISTS public."JobApplication_tenantId_jobPostingId_idx";
DROP INDEX IF EXISTS public."JobApplication_jobPostingId_seekerUserId_key";
DROP INDEX IF EXISTS public."InterviewOpportunity_tenantId_seekerUserId_status_createdAt_idx";
DROP INDEX IF EXISTS public."InterviewOpportunity_tenantId_jobPostingId_status_idx";
DROP INDEX IF EXISTS public."InterviewOpportunity_jobPostingId_seekerUserId_key";
DROP INDEX IF EXISTS public."ContractAgreement_tenantId_userId_status_createdAt_idx";
DROP INDEX IF EXISTS public."ContractAgreement_tenantId_enterpriseId_status_createdAt_idx";
DROP INDEX IF EXISTS public."ComplianceTemplate_tenantId_purpose_version_key";
DROP INDEX IF EXISTS public."ComplianceTemplate_tenantId_purpose_enabled_idx";
DROP INDEX IF EXISTS public."AiPromptTemplate_tenantId_key_key";
DROP INDEX IF EXISTS public."AiLlmRoute_tenantId_scenario_enabled_idx";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."WxMiniUser" DROP CONSTRAINT IF EXISTS "WxMiniUser_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."UserNotification" DROP CONSTRAINT IF EXISTS "UserNotification_pkey";
ALTER TABLE IF EXISTS ONLY public."UserConsent" DROP CONSTRAINT IF EXISTS "UserConsent_pkey";
ALTER TABLE IF EXISTS ONLY public."Tenant" DROP CONSTRAINT IF EXISTS "Tenant_pkey";
ALTER TABLE IF EXISTS ONLY public."SmsOtp" DROP CONSTRAINT IF EXISTS "SmsOtp_pkey";
ALTER TABLE IF EXISTS ONLY public."ServiceStepInteraction" DROP CONSTRAINT IF EXISTS "ServiceStepInteraction_pkey";
ALTER TABLE IF EXISTS ONLY public."ServiceProduct" DROP CONSTRAINT IF EXISTS "ServiceProduct_pkey";
ALTER TABLE IF EXISTS ONLY public."ServicePaymentMilestone" DROP CONSTRAINT IF EXISTS "ServicePaymentMilestone_pkey";
ALTER TABLE IF EXISTS ONLY public."SeekerServiceStep" DROP CONSTRAINT IF EXISTS "SeekerServiceStep_pkey";
ALTER TABLE IF EXISTS ONLY public."SeekerServicePlan" DROP CONSTRAINT IF EXISTS "SeekerServicePlan_pkey";
ALTER TABLE IF EXISTS ONLY public."RefundRequest" DROP CONSTRAINT IF EXISTS "RefundRequest_pkey";
ALTER TABLE IF EXISTS ONLY public."PartnerApplication" DROP CONSTRAINT IF EXISTS "PartnerApplication_pkey";
ALTER TABLE IF EXISTS ONLY public."Order" DROP CONSTRAINT IF EXISTS "Order_pkey";
ALTER TABLE IF EXISTS ONLY public."MockInterviewSession" DROP CONSTRAINT IF EXISTS "MockInterviewSession_pkey";
ALTER TABLE IF EXISTS ONLY public."JobSeekerProfile" DROP CONSTRAINT IF EXISTS "JobSeekerProfile_pkey";
ALTER TABLE IF EXISTS ONLY public."JobPosting" DROP CONSTRAINT IF EXISTS "JobPosting_pkey";
ALTER TABLE IF EXISTS ONLY public."JobApplication" DROP CONSTRAINT IF EXISTS "JobApplication_pkey";
ALTER TABLE IF EXISTS ONLY public."InterviewOpportunity" DROP CONSTRAINT IF EXISTS "InterviewOpportunity_pkey";
ALTER TABLE IF EXISTS ONLY public."Enterprise" DROP CONSTRAINT IF EXISTS "Enterprise_pkey";
ALTER TABLE IF EXISTS ONLY public."EnterpriseConfirmation" DROP CONSTRAINT IF EXISTS "EnterpriseConfirmation_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractAgreement" DROP CONSTRAINT IF EXISTS "ContractAgreement_pkey";
ALTER TABLE IF EXISTS ONLY public."ComplianceTemplate" DROP CONSTRAINT IF EXISTS "ComplianceTemplate_pkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_pkey";
ALTER TABLE IF EXISTS ONLY public."AiPromptTemplate" DROP CONSTRAINT IF EXISTS "AiPromptTemplate_pkey";
ALTER TABLE IF EXISTS ONLY public."AiLlmRoute" DROP CONSTRAINT IF EXISTS "AiLlmRoute_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."WxMiniUser";
DROP TABLE IF EXISTS public."UserNotification";
DROP TABLE IF EXISTS public."UserConsent";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Tenant";
DROP TABLE IF EXISTS public."SmsOtp";
DROP TABLE IF EXISTS public."ServiceStepInteraction";
DROP TABLE IF EXISTS public."ServiceProduct";
DROP TABLE IF EXISTS public."ServicePaymentMilestone";
DROP TABLE IF EXISTS public."SeekerServiceStep";
DROP TABLE IF EXISTS public."SeekerServicePlan";
DROP TABLE IF EXISTS public."RefundRequest";
DROP TABLE IF EXISTS public."PartnerApplication";
DROP TABLE IF EXISTS public."Order";
DROP TABLE IF EXISTS public."MockInterviewSession";
DROP TABLE IF EXISTS public."JobSeekerProfile";
DROP TABLE IF EXISTS public."JobPosting";
DROP TABLE IF EXISTS public."JobApplication";
DROP TABLE IF EXISTS public."InterviewOpportunity";
DROP TABLE IF EXISTS public."EnterpriseConfirmation";
DROP TABLE IF EXISTS public."Enterprise";
DROP TABLE IF EXISTS public."ContractAgreement";
DROP TABLE IF EXISTS public."ComplianceTemplate";
DROP TABLE IF EXISTS public."AuditLog";
DROP TABLE IF EXISTS public."AiPromptTemplate";
DROP TABLE IF EXISTS public."AiLlmRoute";
DROP TYPE IF EXISTS public."SmsOtpPurpose";
DROP TYPE IF EXISTS public."ServiceProviderType";
DROP TYPE IF EXISTS public."SeekerServiceStepStatus";
DROP TYPE IF EXISTS public."SeekerServiceStepKey";
DROP TYPE IF EXISTS public."SeekerServicePlanStatus";
DROP TYPE IF EXISTS public."RefundRequestStatus";
DROP TYPE IF EXISTS public."PlatformRole";
DROP TYPE IF EXISTS public."PaymentMilestoneStatus";
DROP TYPE IF EXISTS public."PaymentMilestoneKey";
DROP TYPE IF EXISTS public."PartnerApplicationStatus";
DROP TYPE IF EXISTS public."OrderStatus";
DROP TYPE IF EXISTS public."OrderKind";
DROP TYPE IF EXISTS public."MockInterviewTransport";
DROP TYPE IF EXISTS public."MockInterviewSessionStatus";
DROP TYPE IF EXISTS public."MockInterviewSceneMode";
DROP TYPE IF EXISTS public."JobApplicationStatus";
DROP TYPE IF EXISTS public."InterviewOpportunityStatus";
DROP TYPE IF EXISTS public."EnterpriseConfirmationType";
DROP TYPE IF EXISTS public."ContractStatus";
DROP TYPE IF EXISTS public."AuditActorType";
--
-- Name: AuditActorType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuditActorType" AS ENUM (
    'PLATFORM_USER',
    'SYSTEM'
);


--
-- Name: ContractStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractStatus" AS ENUM (
    'DRAFT',
    'SIGNED',
    'CANCELLED'
);


--
-- Name: EnterpriseConfirmationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EnterpriseConfirmationType" AS ENUM (
    'INTERVIEW',
    'ONBOARD'
);


--
-- Name: InterviewOpportunityStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InterviewOpportunityStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'CANCELLED'
);


--
-- Name: JobApplicationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."JobApplicationStatus" AS ENUM (
    'SUBMITTED',
    'REVIEWING',
    'INTERVIEW',
    'OFFER',
    'REJECTED',
    'WITHDRAWN'
);


--
-- Name: MockInterviewSceneMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MockInterviewSceneMode" AS ENUM (
    'STANDARD',
    'VR'
);


--
-- Name: MockInterviewSessionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MockInterviewSessionStatus" AS ENUM (
    'SCHEDULED',
    'LIVE',
    'ENDED',
    'CANCELLED'
);


--
-- Name: MockInterviewTransport; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MockInterviewTransport" AS ENUM (
    'TENCENT_MEETING',
    'TRTC',
    'HYBRID'
);


--
-- Name: OrderKind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderKind" AS ENUM (
    'SEEKER_SERVICE_FEE',
    'ENTERPRISE_SUBSCRIPTION',
    'OTHER'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'CLOSED',
    'FAILED'
);


--
-- Name: PartnerApplicationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PartnerApplicationStatus" AS ENUM (
    'SUBMITTED',
    'REVIEWING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: PaymentMilestoneKey; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMilestoneKey" AS ENUM (
    'SIGN_CONTRACT',
    'OFFER_DEPOSIT',
    'MONTH_2_BALANCE',
    'MONTH_3_BALANCE',
    'REGULARIZATION_GIFT',
    'RENEWAL'
);


--
-- Name: PaymentMilestoneStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMilestoneStatus" AS ENUM (
    'LOCKED',
    'PAYABLE',
    'PAID',
    'WAIVED',
    'REFUNDED'
);


--
-- Name: PlatformRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PlatformRole" AS ENUM (
    'ADMIN',
    'TEACHER',
    'PARTNER',
    'JOB_SEEKER',
    'ENTERPRISE_USER'
);


--
-- Name: RefundRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RefundRequestStatus" AS ENUM (
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'REFUNDED'
);


--
-- Name: SeekerServicePlanStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SeekerServicePlanStatus" AS ENUM (
    'ACTIVE',
    'PAUSED',
    'COMPLETED'
);


--
-- Name: SeekerServiceStepKey; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SeekerServiceStepKey" AS ENUM (
    'PRE_CAREER_PLANNING',
    'RESUME_OPTIMIZATION',
    'INTERVIEW_COACHING',
    'INTERVIEW_CONFIRMATION',
    'POST_OFFER_COACHING',
    'POST_CONVERSION_PLANNING'
);


--
-- Name: SeekerServiceStepStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SeekerServiceStepStatus" AS ENUM (
    'LOCKED',
    'NOT_STARTED',
    'IN_PROGRESS',
    'DELIVERED',
    'CONFIRMED'
);


--
-- Name: ServiceProviderType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ServiceProviderType" AS ENUM (
    'PLATFORM',
    'PARTNER',
    'AI_ASSISTED',
    'HYBRID'
);


--
-- Name: SmsOtpPurpose; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SmsOtpPurpose" AS ENUM (
    'LOGIN_PHONE',
    'ENTERPRISE_CONTACT_VERIFY'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AiLlmRoute; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiLlmRoute" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    scenario text DEFAULT 'default'::text NOT NULL,
    provider text NOT NULL,
    "modelName" text NOT NULL,
    "baseUrl" text,
    "apiKeyEnv" text,
    weight integer DEFAULT 100 NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AiPromptTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiPromptTemplate" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    key text NOT NULL,
    title text,
    body text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "performedById" text,
    "actorType" public."AuditActorType" DEFAULT 'PLATFORM_USER'::public."AuditActorType" NOT NULL,
    "onBehalfOfType" text NOT NULL,
    "onBehalfOfId" text NOT NULL,
    action text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ComplianceTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ComplianceTemplate" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    purpose text NOT NULL,
    version text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "contentHash" text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContractAgreement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractAgreement" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text NOT NULL,
    "enterpriseId" text,
    "orderId" text,
    "jobApplicationId" text,
    "templateId" text,
    title text NOT NULL,
    "contentHash" text NOT NULL,
    status public."ContractStatus" DEFAULT 'DRAFT'::public."ContractStatus" NOT NULL,
    "signatureProvider" text,
    "signatureStatus" text,
    "signatureRef" text,
    "signedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Enterprise; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Enterprise" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    "contactEmail" text,
    "contactPhone" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: EnterpriseConfirmation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EnterpriseConfirmation" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "enterpriseId" text NOT NULL,
    type public."EnterpriseConfirmationType" NOT NULL,
    "jobPostingId" text,
    note text,
    "evidenceRef" text,
    "performedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: InterviewOpportunity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InterviewOpportunity" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "jobPostingId" text NOT NULL,
    "seekerUserId" text NOT NULL,
    "pushedById" text NOT NULL,
    status public."InterviewOpportunityStatus" DEFAULT 'PENDING'::public."InterviewOpportunityStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    note text,
    "respondedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: JobApplication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JobApplication" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "jobPostingId" text NOT NULL,
    "seekerUserId" text NOT NULL,
    status public."JobApplicationStatus" DEFAULT 'SUBMITTED'::public."JobApplicationStatus" NOT NULL,
    pitch text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: JobPosting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JobPosting" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "enterpriseId" text NOT NULL,
    title text NOT NULL,
    "jdMarkdown" text,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: JobSeekerProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JobSeekerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tenantId" text NOT NULL,
    headline text,
    "skillsText" text,
    "resumeMarkdown" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: MockInterviewSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MockInterviewSession" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "seekerUserId" text NOT NULL,
    "servicePlanId" text,
    "stepKey" public."SeekerServiceStepKey" DEFAULT 'INTERVIEW_COACHING'::public."SeekerServiceStepKey" NOT NULL,
    status public."MockInterviewSessionStatus" DEFAULT 'SCHEDULED'::public."MockInterviewSessionStatus" NOT NULL,
    "meetingId" text,
    "joinUrl" text,
    subject text,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    "robotSideNote" text,
    provider text DEFAULT 'TENCENT_MEETING'::text NOT NULL,
    "rawResponse" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "antiAssistRules" jsonb,
    "evaluationFocus" jsonb,
    "interviewerRequirements" text,
    "interviewerRole" text,
    "sceneConfig" jsonb,
    "sceneMode" public."MockInterviewSceneMode" DEFAULT 'STANDARD'::public."MockInterviewSceneMode" NOT NULL,
    transport public."MockInterviewTransport" DEFAULT 'TENCENT_MEETING'::public."MockInterviewTransport" NOT NULL,
    "trtcRoomId" text,
    "trtcSdkAppId" text,
    "trtcUserSig" text,
    "vrSceneKey" text,
    "vrSceneName" text,
    "vrSceneUrl" text
);


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "payerUserId" text NOT NULL,
    kind public."OrderKind" NOT NULL,
    "amountFen" integer NOT NULL,
    currency text DEFAULT 'CNY'::text NOT NULL,
    description text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "outTradeNo" text NOT NULL,
    "wechatPrepayId" text,
    "wechatTransactionId" text,
    "wechatTradeState" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PartnerApplication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PartnerApplication" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "submittedById" text NOT NULL,
    "orgName" text NOT NULL,
    "contactName" text NOT NULL,
    "contactPhone" text,
    "contactEmail" text,
    category text NOT NULL,
    qualification text,
    "courseSummary" text,
    status public."PartnerApplicationStatus" DEFAULT 'SUBMITTED'::public."PartnerApplicationStatus" NOT NULL,
    "reviewNote" text,
    "reviewedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: RefundRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefundRequest" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "orderId" text NOT NULL,
    "requestedById" text NOT NULL,
    "amountFen" integer NOT NULL,
    reason text,
    status public."RefundRequestStatus" DEFAULT 'SUBMITTED'::public."RefundRequestStatus" NOT NULL,
    "reviewNote" text,
    "reviewedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SeekerServicePlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SeekerServicePlan" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "seekerUserId" text NOT NULL,
    status public."SeekerServicePlanStatus" DEFAULT 'ACTIVE'::public."SeekerServicePlanStatus" NOT NULL,
    "targetRole" text,
    "salaryMinFen" integer,
    "salaryMaxFen" integer,
    "signedContractId" text,
    summary text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SeekerServiceStep; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SeekerServiceStep" (
    id text NOT NULL,
    "planId" text NOT NULL,
    key public."SeekerServiceStepKey" NOT NULL,
    title text NOT NULL,
    "valueProposition" text NOT NULL,
    "providerType" public."ServiceProviderType" NOT NULL,
    status public."SeekerServiceStepStatus" DEFAULT 'NOT_STARTED'::public."SeekerServiceStepStatus" NOT NULL,
    "sortOrder" integer NOT NULL,
    checklist jsonb,
    "deliverableSummary" text,
    "partnerOrgName" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ServicePaymentMilestone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ServicePaymentMilestone" (
    id text NOT NULL,
    "planId" text NOT NULL,
    key public."PaymentMilestoneKey" NOT NULL,
    title text NOT NULL,
    "amountFen" integer NOT NULL,
    status public."PaymentMilestoneStatus" DEFAULT 'LOCKED'::public."PaymentMilestoneStatus" NOT NULL,
    "triggerText" text NOT NULL,
    "orderId" text,
    "sortOrder" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ServiceProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ServiceProduct" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    audience text NOT NULL,
    "orderKind" public."OrderKind" NOT NULL,
    "amountFen" integer NOT NULL,
    currency text DEFAULT 'CNY'::text NOT NULL,
    description text,
    enabled boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 100 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ServiceStepInteraction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ServiceStepInteraction" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "stepId" text NOT NULL,
    "requestedById" text NOT NULL,
    "promptKey" text NOT NULL,
    "inputText" text,
    "outputText" text NOT NULL,
    vendor text NOT NULL,
    "modelName" text,
    "routeId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "feedbackRating" integer,
    "feedbackText" text,
    "feedbackAt" timestamp(3) without time zone
);


--
-- Name: SmsOtp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SmsOtp" (
    id text NOT NULL,
    "tenantId" text,
    phone text NOT NULL,
    purpose public."SmsOtpPurpose" NOT NULL,
    "codeHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "consumedAt" timestamp(3) without time zone,
    "verifyAttempts" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tenant" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "logoUrl" text,
    "primaryColor" text,
    "accentColor" text,
    "welcomeText" text,
    "wxMiniAppId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    email text,
    phone text,
    "passwordHash" text,
    "displayName" text NOT NULL,
    role public."PlatformRole" DEFAULT 'JOB_SEEKER'::public."PlatformRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserConsent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserConsent" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text NOT NULL,
    purpose text NOT NULL,
    version text NOT NULL,
    "contentHash" text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserNotification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserNotification" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    category text NOT NULL,
    metadata jsonb,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: WxMiniUser; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WxMiniUser" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text NOT NULL,
    openid text NOT NULL,
    unionid text,
    "sessionKey" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: AiLlmRoute; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiLlmRoute" (id, "tenantId", scenario, provider, "modelName", "baseUrl", "apiKeyEnv", weight, enabled, "createdAt", "updatedAt") FROM stdin;
cmodor6b30008196zi0xw17qs	cmodor6790000196zyooghdmp	default	stub	stub-local	\N	\N	100	t	2026-04-25 01:53:45.135	2026-04-25 01:53:45.135
cmotfpk8m000i11ko6rxn508y	cmodor6790000196zyooghdmp	service_step	stub	stub-service-step	\N	\N	100	t	2026-05-06 02:24:52.151	2026-05-06 02:24:52.151
\.


--
-- Data for Name: AiPromptTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiPromptTemplate" (id, "tenantId", key, title, body, version, "createdAt", "updatedAt") FROM stdin;
cmogpxzpn0008jzt1t3o5l38u	cmodor6790000196zyooghdmp	service_step_RESUME_OPTIMIZATION	服务环节：简历优化（求职流程-材料准备）	你服务于「简历优化」环节，对应求职流程中：在方向确定后，将经历翻译为可投递的简历材料（与业务侧：原始稿诊断 → 用户确认建议 → 复核 → 定稿 对齐）。\n\n【对外表达】面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。\n\n【输出结构】\n1) 与目标岗位 JD 的匹配度一句话结论。\n2) 问题诊断分三条以内：每条约「问题点 + 对投递的影响 + 可执行的改法」。\n3) 关键词/经历改写建议：从上下文中的技能、项目摘要抽取，给出「可替换进简历的表述示例」（STAR 中突出 Result，避免假数据）。\n4) 多轮沟通提示：列 1～2 个建议用户继续与平台对齐的问题（如项目口径、空档期说明）。\n\n【约束】不虚构公司名、职级、数据；如简历文本缺失，明确提示先补充「经历模块」。	1	2026-04-27 04:50:21.324	2026-05-06 02:54:40.665
cmogpxzpp000ajzt16gwobnm1	cmodor6790000196zyooghdmp	service_step_INTERVIEW_COACHING	服务环节：面试辅导（求职流程-面试准备 + 腾讯会议模拟面试）	你服务于「面试辅导」环节。求职流程中本阶段含：学习题库/方法论 → 预约并在腾讯会议中完成「模拟面试」（音视频通信由腾讯会议承担；会中引导、记录与复盘说明通过会议侧能力承载，工程侧以会议号与会中说明为上下文，不输出实时信令细节）。\n\n【对外表达】面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。\n\n【输出结构】\n1) 针对目标岗位分两类准备：业务/专业面（2～3 个主问题 + 回答骨架）+ 行为面/HR 面（1～2 个主问题 + 要点）。\n2) 表达与非语言：语速、条理性、眼神/体态的简短可训练清单各 1～2 条（面向视频面试）。\n3) 与「腾讯会议模拟面试」衔接：若上下文中出现会议预约/会议号/会中说明，请明确写一句「与本轮模拟相关的练习重点」；若无会议记录，则提示先完成平台预约与入会。\n4) 复盘模板：用 5 行内给出用户可在模拟后自评的维度（内容相关性/结构/表达/非语言/改进一句）。\n\n【约束】不提供违法规避背调的建议；不承诺必过。	1	2026-04-27 04:50:21.325	2026-05-06 02:54:40.669
cmogpxzpq000cjzt1vuzmnik6	cmodor6790000196zyooghdmp	service_step_INTERVIEW_CONFIRMATION	服务环节：面试确认（求职流程-企业面试机会与决策）	你服务于「面试确认」环节，对应求职流程中：平台导入岗位面试机会 → 推送给求职者 → 求职者需决策是否参加（与 InterviewOpportunity 数据对应）。\n\n【对外表达】面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。\n\n【输出结构】\n1) 用两条以内概括「参加」与「暂不参加」各自适合的典型情形（不替用户做唯一结论）。\n2) 决策前检查清单：时间冲突、企业背景核实、与职业规划一致性、需向平台/企业澄清的问题，各至少 1 条。\n3) 沟通与礼仪：在小程序内点「参加/拒绝」之外，如需要补一句给企业或平台的礼貌话术，各给 1 条可直接改编的短模板（中性、专业）。\n4) 风险与心理：如岗位与预期偏差较大，如何向平台请求二次辅导或调整机会（1 段内）。\n\n【数据】若上下文中已给出待处理/已参加/已拒绝的条数，在开头用一句话点明，以辅助用户理解当前任务队列。	1	2026-04-27 04:50:21.326	2026-05-06 02:54:40.672
cmogpxzps000ejzt1nb42jzpw	cmodor6790000196zyooghdmp	service_step_POST_OFFER_COACHING	服务环节：职后辅导	请以职得就业服务口吻，围绕新员工角色适应、岗位职责理解、同事沟通、绩效达成和心态管理，给出试用期 2 周行动建议和遇到问题时的处理方式。面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师。	1	2026-04-27 04:50:21.328	2026-05-06 02:54:40.677
cmodor6b00006196zvjybxlyy	cmodor6790000196zyooghdmp	default_system	系统提示	你以「职得」就业服务口吻提供建议。回答须专业、合规、简洁，不编造候选人隐私；面向求职者时不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。	1	2026-04-25 01:53:45.132	2026-05-06 02:54:40.653
cmogpxzpv000gjzt1noazzwin	cmodor6790000196zyooghdmp	service_step_POST_CONVERSION_PLANNING	服务环节：职后规划	请以职得就业服务口吻，基于候选人的岗位方向，给出转正后的成长计划：技能提升、证书/课程、社交沟通、晋升机会和下一阶段岗位机会关注点。面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师。	1	2026-04-27 04:50:21.332	2026-05-06 02:54:40.681
cmogpxzpl0006jzt1j7andq01	cmodor6790000196zyooghdmp	service_step_PRE_CAREER_PLANNING	服务环节：职前规划（求职流程-建档与方向）	你服务于「职前规划」环节，对应典型求职流程中的：个人信息沉淀 → 职业兴趣/测评 → 服务沟通 → 方向与薪资初确认（工程侧已用档案与计划目标增强上下文）。\n\n【对外表达】面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。\n\n【输出结构】请严格按以下小节输出（可适度精简，但顺序保留）：\n1) 信息核对摘要：用要点列出用户已提供的关键教育/工作/项目经历与待补充项，勿编造不存在的机构或成绩。\n2) 职业竞争力三栏：优势（与目标岗位可验证）｜可改进点（可行动）｜与目标岗位的匹配度（高/中/低 + 一句理由）。\n3) 方向建议：在求职者意向基础上给出「建议深耕的行业/岗位类型」与「可并行关注的备选方向」，并各附一句行业/岗位前景说明；若信息不足，明确写出需要补充的测评或材料。\n4) 与求职流程衔接：说明「下一步」应落在简历优化/测评补全/服务沟通中的哪几项，用编号列表 2～4 条行动项，避免空话。\n\n【语气】专业、可落地、不承诺内推或包 offer；遇敏感薪酬仅给区间讨论框架，不替用户确定数字。	1	2026-04-27 04:50:21.321	2026-05-06 02:54:40.658
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "tenantId", "performedById", "actorType", "onBehalfOfType", "onBehalfOfId", action, metadata, "createdAt") FROM stdin;
cmodpa1wm0003g5rebmbvphsx	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	ENTERPRISE	cmodor6ay0004196znvtxio2i	JOB_CREATE	{"jobId": "cmodpa1wj0001g5re2fyfiv2w", "title": "冒烟测试岗位"}	2026-04-25 02:08:25.894
cmodpa1xq0005g5reyyyytqs0	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	ENTERPRISE	cmodor6ay0004196znvtxio2i	JOB_PUBLISH	{"jobId": "cmodpa1wj0001g5re2fyfiv2w", "title": "冒烟测试岗位"}	2026-04-25 02:08:25.934
cmodpxqpt0003zp3xkhq9ngru	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	USER	cmodor6aq0002196zitwpf1e8	CONTRACT_CREATE	{"title": "冒烟测试服务协议", "contractId": "cmodpxqpo0001zp3x6tt53isy", "templateId": "cmodpw3tq000auz6mhivanklm"}	2026-04-25 02:26:51.138
cmodpxqqr0007zp3x98cliyav	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	CONTRACT	cmodpxqpo0001zp3x6tt53isy	CONTRACT_SIGN_STUB	{"contractId": "cmodpxqpo0001zp3x6tt53isy", "signatureRef": "stub-cmodpxqpo0001zp3x6tt53isy"}	2026-04-25 02:26:51.171
cmofg64uu0003zk79kir6byu0	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	ENTERPRISE	cmofg64uo0001zk79mpxxixj2	ENTERPRISE_CREATE	{"name": "UI冒烟企业", "enterpriseId": "cmofg64uo0001zk79mpxxixj2"}	2026-04-26 07:28:58.902
cmofg64vs0005zk79f4ap9w07	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	ENTERPRISE	cmofg64uo0001zk79mpxxixj2	ENTERPRISE_UPDATE	{"name": "UI冒烟企业（已更新）", "enterpriseId": "cmofg64uo0001zk79mpxxixj2"}	2026-04-26 07:28:58.936
cmofh899r0003xp4x03r1ev07	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	USER	cmofh899n0001xp4x73grx4nb	USER_CREATE	{"role": "TEACHER", "userId": "cmofh899n0001xp4x73grx4nb"}	2026-04-26 07:58:37.552
cmofh89au0005xp4xmbjq91x9	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	USER	cmofh899n0001xp4x73grx4nb	USER_UPDATE	{"role": "TEACHER", "userId": "cmofh899n0001xp4x73grx4nb"}	2026-04-26 07:58:37.59
cmogk3hj100038ywwsuj22oih	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	USER	cmogk3hix00018ywwleyzpboa	USER_CREATE	{"role": "JOB_SEEKER", "userId": "cmogk3hix00018ywwleyzpboa"}	2026-04-27 02:06:39.997
cmogk3hk500078ywwubvscsnx	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	USER	cmogk3hix00018ywwleyzpboa	JOB_SEEKER_PROFILE_UPSERT_BY_STAFF	{"userId": "cmogk3hix00018ywwleyzpboa", "profileId": "cmogk3hjy00058ywwxnaifrtl"}	2026-04-27 02:06:40.037
cmogkm2wt0019maz9sr14mwb6	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-04-27 02:21:07.517
cmogl3b6n000fd9x1oq6p6r70	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-04-27 02:34:31.392
cmogm4bp40003s6p657gsibig	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	USER	cmogkm2tx0003maz9tm9jum1j	JOB_APPLY	{"enterpriseId": "cmogkm2uh000dmaz97t5wfn9q", "jobPostingId": "cmogkm2uu000hmaz98fz0vea3", "applicationId": "cmogm4boz0001s6p6vp4q8nmf"}	2026-04-27 03:03:18.328
cmognk88r00117n9fnva7st40	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-04-27 03:43:39.963
cmogp65k70011gsl0kfz28w01	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-04-27 04:28:42.535
cmogpht8500138xh3wr54i4vs	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-04-27 04:37:46.421
cmogpkh4900014rr1mngr4fmq	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	INTERVIEW_OPPORTUNITY	cmogpht6p000b8xh3e727hvcw	INTERVIEW_OPPORTUNITY_RESPOND	{"note": "冒烟确认参加面试", "status": "ACCEPTED", "opportunityId": "cmogpht6p000b8xh3e727hvcw"}	2026-04-27 04:39:50.697
cmogpy0by0013mwk1g102tlj3	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-04-27 04:50:22.126
cmogpztvq000314dmp4g4sret	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "PRE_CAREER_PLANNING", "stepId": "cmognk87u000f7n9frzrkkg19", "promptKey": "service_step_PRE_CAREER_PLANNING", "interactionId": "cmogpztvl000114dmgfj9lwkb"}	2026-04-27 04:51:47.078
cmogq8xol000714dm5rg6kb80	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "RESUME_OPTIMIZATION", "stepId": "cmognk87x000h7n9fiy2fdkuq", "promptKey": "service_step_RESUME_OPTIMIZATION", "interactionId": "cmogq8xog000514dmlpftd76r"}	2026-04-27 04:58:51.909
cmogqehcv000d14dme6r8jth3	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "PRE_CAREER_PLANNING", "stepId": "cmognk87u000f7n9frzrkkg19", "promptKey": "service_step_PRE_CAREER_PLANNING", "interactionId": "cmogqehcp000b14dmupnudg3s"}	2026-04-27 05:03:10.687
cmogqfxhy0013yylhx68i8ygf	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-04-27 05:04:18.263
cmogqfxmj00037u8gcofpavtk	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "PRE_CAREER_PLANNING", "stepId": "cmognk87u000f7n9frzrkkg19", "promptKey": "service_step_PRE_CAREER_PLANNING", "interactionId": "cmogqfxmf00017u8gmjqva5uy"}	2026-04-27 05:04:18.428
cmogqfxne00057u8gnpywt0rl	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_CONFIRM	{"key": "PRE_CAREER_PLANNING", "stepId": "cmognk87u000f7n9frzrkkg19", "unlockedNextStepId": "cmognk87x000h7n9fiy2fdkuq"}	2026-04-27 05:04:18.459
cmogqthlq00097u8gbd73b9bv	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "PRE_CAREER_PLANNING", "stepId": "cmognk87u000f7n9frzrkkg19", "promptKey": "service_step_PRE_CAREER_PLANNING", "interactionId": "cmogqthlk00077u8g566rvt3l"}	2026-04-27 05:14:50.847
cmogqtih3000d7u8g92wgghwa	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "PRE_CAREER_PLANNING", "stepId": "cmognk87u000f7n9frzrkkg19", "promptKey": "service_step_PRE_CAREER_PLANNING", "interactionId": "cmogqtigy000b7u8g4p36r72t"}	2026-04-27 05:14:51.975
cmogqtw8m000f7u8gq6amhzti	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_CONFIRM	{"key": "RESUME_OPTIMIZATION", "stepId": "cmognk87x000h7n9fiy2fdkuq", "unlockedNextStepId": "cmognk87z000j7n9fgmpxpfcv"}	2026-04-27 05:15:09.815
cmogqtzo0000j7u8g79r075in	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "INTERVIEW_COACHING", "stepId": "cmognk87z000j7n9fgmpxpfcv", "promptKey": "service_step_INTERVIEW_COACHING", "interactionId": "cmogqtznw000h7u8gep9plbrk"}	2026-04-27 05:15:14.257
cmogqu3ln000l7u8gxdzfnmae	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_CONFIRM	{"key": "INTERVIEW_COACHING", "stepId": "cmognk87z000j7n9fgmpxpfcv", "unlockedNextStepId": "cmognk880000l7n9fst68liv4"}	2026-04-27 05:15:19.356
cmogqu6f0000p7u8gcm583yc8	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "INTERVIEW_CONFIRMATION", "stepId": "cmognk880000l7n9fst68liv4", "promptKey": "service_step_INTERVIEW_CONFIRMATION", "interactionId": "cmogqu6ex000n7u8g7gwhhgxa"}	2026-04-27 05:15:23.004
cmogqub1m000r7u8g4w1sspq7	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_CONFIRM	{"key": "INTERVIEW_CONFIRMATION", "stepId": "cmognk880000l7n9fst68liv4", "unlockedNextStepId": "cmognk881000n7n9f5ar12lj4"}	2026-04-27 05:15:29.003
cmogqujrr000v7u8g5u9wd4xn	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "POST_OFFER_COACHING", "stepId": "cmognk881000n7n9f5ar12lj4", "promptKey": "service_step_POST_OFFER_COACHING", "interactionId": "cmogqujrn000t7u8g90yyjy0o"}	2026-04-27 05:15:40.311
cmogqumdb000x7u8gkg5ntu6c	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_CONFIRM	{"key": "POST_OFFER_COACHING", "stepId": "cmognk881000n7n9f5ar12lj4", "unlockedNextStepId": "cmognk882000p7n9f8vnie83k"}	2026-04-27 05:15:43.679
cmogqurgi00117u8g8nau7x0v	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "POST_CONVERSION_PLANNING", "stepId": "cmognk882000p7n9f8vnie83k", "promptKey": "service_step_POST_CONVERSION_PLANNING", "interactionId": "cmogqurge000z7u8gpd0an6su"}	2026-04-27 05:15:50.275
cmogquuce00137u8gzqlit8ou	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_CONFIRM	{"key": "POST_CONVERSION_PLANNING", "stepId": "cmognk882000p7n9f8vnie83k", "unlockedNextStepId": null}	2026-04-27 05:15:54.014
cmogqxs4m00131huvhu0uasdy	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-04-27 05:18:11.111
cmogqxsdl0001ki8fwql6w8us	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_PAYMENT_MILESTONE_UPDATE	{"key": "MONTH_2_BALANCE", "status": "PAYABLE", "milestoneId": "cmognk889000v7n9f1wt0xof4"}	2026-04-27 05:18:11.433
cmogqxsfn0005ki8f3312r3ei	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	USER	cmogkm2tx0003maz9tm9jum1j	ORDER_CREATE	{"kind": "SEEKER_SERVICE_FEE", "orderId": "cmogqxsfl0003ki8fi2xby48u", "amountFen": 19900, "productId": null, "outTradeNo": "O17772670915045f9cda59c843", "milestoneId": "cmognk889000v7n9f1wt0xof4"}	2026-04-27 05:18:11.507
cmogr1mdu0007ki8fg8kyv580	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	INTERVIEW_OPPORTUNITY	cmogpht6p000b8xh3e727hvcw	INTERVIEW_OPPORTUNITY_RESPOND	{"note": "本地模拟：确认参加面试", "status": "ACCEPTED", "opportunityId": "cmogpht6p000b8xh3e727hvcw"}	2026-04-27 05:21:10.291
cmogr8zuj0003b7q13pp28ecu	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_REQUEST	{"key": "PRE_CAREER_PLANNING", "stepId": "cmognk87u000f7n9frzrkkg19", "promptKey": "service_step_PRE_CAREER_PLANNING", "interactionId": "cmogr8zub0001b7q18xrlh3ur"}	2026-04-27 05:26:54.331
cmogr8zvp0005b7q150i4afas	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	SEEKER_SERVICE_PLAN	cmognk87q000d7n9fssq27w3q	SERVICE_STEP_FEEDBACK	{"key": "PRE_CAREER_PLANNING", "rating": 5, "stepId": "cmognk87u000f7n9frzrkkg19", "feedbackText": "建议清晰，有帮助", "interactionId": "cmogr8zub0001b7q18xrlh3ur"}	2026-04-27 05:26:54.373
cmogsml1u0013110i6qwgk23i	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-04-27 06:05:27.954
cmogsml9i0001lxex8a0sco46	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	ENTERPRISE	cmogkm2uh000dmaz97t5wfn9q	JOB_APPLICATION_STATUS_UPDATE	{"to": "OFFER", "from": "REVIEWING", "note": null, "jobPostingId": "cmogkm2ur000fmaz9uhj1pon7", "seekerUserId": "cmogkm2u40007maz9x8qiseza", "applicationId": "cmogkm2v0000lmaz9ra6n791b"}	2026-04-27 06:05:28.231
cmojggg060009odkh5qznocmt	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	USER	cmogkm2tx0003maz9tm9jum1j	JOB_APPLY	{"enterpriseId": "cmodor6ay0004196znvtxio2i", "jobPostingId": "cmodpa1wj0001g5re2fyfiv2w", "applicationId": "cmojggg030007odkhamkvfiid"}	2026-04-29 02:48:04.614
cmojgijor000jodkh0t5a2f36	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	PLATFORM_USER	INTERVIEW_OPPORTUNITY	cmogpht6p000b8xh3e727hvcw	INTERVIEW_OPPORTUNITY_RESPOND	{"note": "本地模拟：确认参加面试", "status": "ACCEPTED", "opportunityId": "cmogpht6p000b8xh3e727hvcw"}	2026-04-29 02:49:42.699
cmotfpl4z0013ry4cxytkx2ac	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-05-06 02:24:53.316
cmotgrxrt0013eh2pcfmv6tlg	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	PLATFORM_USER	TENANT	cmodor6790000196zyooghdmp	DEMO_SCENARIO_SEED	{"jobs": ["cmogkm2ur000fmaz9uhj1pon7", "cmogkm2uu000hmaz98fz0vea3"], "orderId": "cmogkm2v4000pmaz97pwq1bs1", "seekers": ["cmogkm2tx0003maz9tm9jum1j", "cmogkm2u00005maz9lh312ee5", "cmogkm2u40007maz9x8qiseza"], "enterpriseId": "cmogkm2uh000dmaz97t5wfn9q"}	2026-05-06 02:54:42.617
\.


--
-- Data for Name: ComplianceTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ComplianceTemplate" (id, "tenantId", purpose, version, title, content, "contentHash", enabled, "createdAt", "updatedAt") FROM stdin;
cmodpw3tq000auz6mhivanklm	cmodor6790000196zyooghdmp	SERVICE_PAYMENT	mvp-2026-04	服务付费与个人信息处理同意	我已阅读并同意职得服务说明、个人信息处理规则与支付相关条款，知晓当前为服务付费节点。	84e66975ba3b15837ef9f99e19438dc72578fb4060e39b1bb8dcac6c54e272c6	t	2026-04-25 02:25:34.814	2026-05-06 02:54:40.702
\.


--
-- Data for Name: ContractAgreement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractAgreement" (id, "tenantId", "userId", "enterpriseId", "orderId", "jobApplicationId", "templateId", title, "contentHash", status, "signatureProvider", "signatureStatus", "signatureRef", "signedAt", "createdAt", "updatedAt") FROM stdin;
cmodpxqpo0001zp3x6tt53isy	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	\N	\N	\N	cmodpw3tq000auz6mhivanklm	冒烟测试服务协议	84e66975ba3b15837ef9f99e19438dc72578fb4060e39b1bb8dcac6c54e272c6	SIGNED	tencent-signature-stub	SIGNED	stub-cmodpxqpo0001zp3x6tt53isy	2026-04-25 02:26:51.168	2026-04-25 02:26:51.133	2026-04-25 02:26:51.169
cmogkm2vo000tmaz99x4267ie	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	cmogkm2uh000dmaz97t5wfn9q	cmogkm2v4000pmaz97pwq1bs1	cmogkm2uw000jmaz97wkqcyby	cmodpw3tq000auz6mhivanklm	完整模拟 · 求职服务协议	84e66975ba3b15837ef9f99e19438dc72578fb4060e39b1bb8dcac6c54e272c6	SIGNED	tencent-signature-stub	SIGNED	demo-sign-cmogkm2vo000tmaz99x4267ie	2026-05-06 02:54:42.58	2026-04-27 02:21:07.476	2026-05-06 02:54:42.581
\.


--
-- Data for Name: Enterprise; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Enterprise" (id, "tenantId", name, "contactEmail", "contactPhone", "createdAt", "updatedAt") FROM stdin;
cmodor6ay0004196znvtxio2i	cmodor6790000196zyooghdmp	示例企业（可删）	hr@example.com	\N	2026-04-25 01:53:45.13	2026-04-25 01:53:45.13
cmofg64uo0001zk79mpxxixj2	cmodor6790000196zyooghdmp	UI冒烟企业（已更新）	ui-smoke@example.com	13900000000	2026-04-26 07:28:58.897	2026-04-26 07:28:58.935
cmogkm2uh000dmaz97t5wfn9q	cmodor6790000196zyooghdmp	完整模拟企业 · 森禾科技	hr@senhe.example	13800001111	2026-04-27 02:21:07.434	2026-05-06 02:54:42.55
\.


--
-- Data for Name: EnterpriseConfirmation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EnterpriseConfirmation" (id, "tenantId", "enterpriseId", type, "jobPostingId", note, "evidenceRef", "performedById", "createdAt") FROM stdin;
cmogkm2wb0011maz9m888nmnz	cmodor6790000196zyooghdmp	cmogkm2uh000dmaz97t5wfn9q	INTERVIEW	cmogkm2ur000fmaz9uhj1pon7	完整模拟：企业确认陈一舟进入技术面。	demo://interview-confirmation	cmogkm2ts0001maz9tof49f4l	2026-04-27 02:21:07.499
\.


--
-- Data for Name: InterviewOpportunity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InterviewOpportunity" (id, "tenantId", "jobPostingId", "seekerUserId", "pushedById", status, "scheduledAt", note, "respondedAt", "createdAt", "updatedAt") FROM stdin;
cmogpht6p000b8xh3e727hvcw	cmodor6790000196zyooghdmp	cmogkm2ur000fmaz9uhj1pon7	cmogkm2tx0003maz9tm9jum1j	cmogkm2ts0001maz9tof49f4l	PENDING	2026-05-08 02:54:42.567	完整模拟：森禾科技邀请你参加前端工程师岗位技术面。	\N	2026-04-27 04:37:46.369	2026-05-06 02:54:42.568
\.


--
-- Data for Name: JobApplication; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."JobApplication" (id, "tenantId", "jobPostingId", "seekerUserId", status, pitch, "createdAt", "updatedAt") FROM stdin;
cmogkm2uw000jmaz97wkqcyby	cmodor6790000196zyooghdmp	cmogkm2ur000fmaz9uhj1pon7	cmogkm2tx0003maz9tm9jum1j	INTERVIEW	我做过小程序和 Vue 后台，能快速接手岗位要求。	2026-04-27 02:21:07.448	2026-05-06 02:54:42.56
cmogm4boz0001s6p6vp4q8nmf	cmodor6790000196zyooghdmp	cmogkm2uu000hmaz98fz0vea3	cmogkm2tx0003maz9tm9jum1j	SUBMITTED	本地模拟：我对该岗位感兴趣，已提交投递。	2026-04-27 03:03:18.324	2026-04-27 03:03:18.324
cmogkm2v0000lmaz9ra6n791b	cmodor6790000196zyooghdmp	cmogkm2ur000fmaz9uhj1pon7	cmogkm2u40007maz9x8qiseza	REVIEWING	有一点前端基础，希望获得转岗机会。	2026-04-27 02:21:07.452	2026-05-06 02:54:42.564
cmogkm2v2000nmaz91y3nk6bi	cmodor6790000196zyooghdmp	cmogkm2uu000hmaz98fz0vea3	cmogkm2u00005maz9lh312ee5	OFFER	我熟悉就业服务 SOP 和候选人跟进节奏。	2026-04-27 02:21:07.454	2026-05-06 02:54:42.566
cmojggg030007odkhamkvfiid	cmodor6790000196zyooghdmp	cmodpa1wj0001g5re2fyfiv2w	cmogkm2tx0003maz9tm9jum1j	SUBMITTED	本地模拟：我对该岗位感兴趣，已提交投递。	2026-04-29 02:48:04.612	2026-04-29 02:48:04.612
\.


--
-- Data for Name: JobPosting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."JobPosting" (id, "tenantId", "enterpriseId", title, "jdMarkdown", status, "publishedAt", "createdAt", "updatedAt") FROM stdin;
cmodpa1wj0001g5re2fyfiv2w	cmodor6790000196zyooghdmp	cmodor6ay0004196znvtxio2i	冒烟测试岗位	Vue Nest PostgreSQL 小程序	PUBLISHED	2026-04-25 02:08:25.931	2026-04-25 02:08:25.891	2026-04-25 02:08:25.932
cmogkm2ur000fmaz9uhj1pon7	cmodor6790000196zyooghdmp	cmogkm2uh000dmaz97t5wfn9q	前端工程师 · 小程序与运营后台	负责微信小程序、Vue 管理端、组件化工程与 NestJS API 协作。要求 TypeScript、Vue、小程序、PostgreSQL 基础。	PUBLISHED	2026-05-06 02:54:42.554	2026-04-27 02:21:07.443	2026-05-06 02:54:42.555
cmogkm2uu000hmaz98fz0vea3	cmodor6790000196zyooghdmp	cmogkm2uh000dmaz97t5wfn9q	就业服务顾问 · 候选人跟进	负责候选人简历诊断、面试辅导、企业对接和入职跟踪。要求沟通能力、就业服务经验、数据记录意识。	PUBLISHED	2026-05-06 02:54:42.557	2026-04-27 02:21:07.447	2026-05-06 02:54:42.558
\.


--
-- Data for Name: JobSeekerProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."JobSeekerProfile" (id, "userId", "tenantId", headline, "skillsText", "resumeMarkdown", "createdAt", "updatedAt") FROM stdin;
cmogk3hjy00058ywwxnaifrtl	cmogk3hix00018ywwleyzpboa	cmodor6790000196zyooghdmp	冒烟候选人 · Vue 小程序	Vue, 小程序, NestJS	3年就业服务平台项目经验	2026-04-27 02:06:40.03	2026-04-27 02:06:40.03
cmogkm2u70009maz9nxgvsib2	cmogkm2tx0003maz9tm9jum1j	cmodor6790000196zyooghdmp	3 年前端工程师，熟悉 Vue、小程序、Node 服务端协作	Vue, TypeScript, 微信小程序, NestJS, PostgreSQL, UI 还原, 组件化	曾参与招聘平台与运营后台建设，负责小程序岗位详情、投递流程、管理端表格与权限页面。	2026-04-27 02:21:07.423	2026-05-06 02:54:42.545
cmogkm2uc000bmaz93pnqr4cs	cmogkm2u00005maz9lh312ee5	cmodor6790000196zyooghdmp	就业服务顾问，擅长简历诊断、面试辅导与企业沟通	就业指导, 简历优化, 面试辅导, 企业对接, 候选人跟进	服务过 200+ 名转岗学员，熟悉培训机构到企业岗位的转化路径。	2026-04-27 02:21:07.429	2026-05-06 02:54:42.548
\.


--
-- Data for Name: MockInterviewSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MockInterviewSession" (id, "tenantId", "seekerUserId", "servicePlanId", "stepKey", status, "meetingId", "joinUrl", subject, "startTime", "endTime", "robotSideNote", provider, "rawResponse", "createdAt", "updatedAt", "antiAssistRules", "evaluationFocus", "interviewerRequirements", "interviewerRole", "sceneConfig", "sceneMode", transport, "trtcRoomId", "trtcSdkAppId", "trtcUserSig", "vrSceneKey", "vrSceneName", "vrSceneUrl") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "tenantId", "payerUserId", kind, "amountFen", currency, description, status, "outTradeNo", "wechatPrepayId", "wechatTransactionId", "wechatTradeState", "createdAt", "updatedAt") FROM stdin;
cmogqxsfl0003ki8fi2xby48u	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	SEEKER_SERVICE_FEE	19900	CNY	第 2 月尾款	PAID	O17772670915045f9cda59c843	\N	\N	LOCAL_SIMULATOR_PAID	2026-04-27 05:18:11.505	2026-04-27 05:18:11.511
cmogkm2v4000pmaz97pwq1bs1	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	SEEKER_SERVICE_FEE	9900	CNY	完整模拟 · offer 后定金	PAID	DEMO_JOBDEE_0001	\N	demo-wechat-tx-0001	SUCCESS	2026-04-27 02:21:07.457	2026-05-06 02:54:42.571
\.


--
-- Data for Name: PartnerApplication; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PartnerApplication" (id, "tenantId", "submittedById", "orgName", "contactName", "contactPhone", "contactEmail", category, qualification, "courseSummary", status, "reviewNote", "reviewedById", "createdAt", "updatedAt") FROM stdin;
cmogkm2w5000zmaz9lgn6wy5y	cmodor6790000196zyooghdmp	cmogkm2vz000xmaz9dd4fgtxy	南山职业训练营	顾问王老师	13900002222	partner.demo@aihr.local	培训机构	具备职业技能培训资质，提供前端与数据分析课程。	联合包：8 周项目实训 + 就业推荐 + 面试辅导。	APPROVED	课程资质完整，允许进入联合服务包。	cmodor6aq0002196zitwpf1e8	2026-04-27 02:21:07.494	2026-05-06 02:54:42.61
\.


--
-- Data for Name: RefundRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RefundRequest" (id, "tenantId", "orderId", "requestedById", "amountFen", reason, status, "reviewNote", "reviewedById", "createdAt", "updatedAt") FROM stdin;
cmogkm2vu000vmaz9i28o0ysi	cmodor6790000196zyooghdmp	cmogkm2v4000pmaz97pwq1bs1	cmogkm2tx0003maz9tm9jum1j	990	完整模拟：服务节点调整，申请部分退款	APPROVED	完整模拟：同意部分退款，等待打款。	cmodor6aq0002196zitwpf1e8	2026-04-27 02:21:07.482	2026-05-06 02:54:42.606
\.


--
-- Data for Name: SeekerServicePlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SeekerServicePlan" (id, "tenantId", "seekerUserId", status, "targetRole", "salaryMinFen", "salaryMaxFen", "signedContractId", summary, "createdAt", "updatedAt") FROM stdin;
cmognk87q000d7n9fssq27w3q	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	ACTIVE	前端工程师 · 小程序与运营后台	1800000	2500000	cmogkm2vo000tmaz99x4267ie	完整模拟：求职者已完成职前规划与简历优化，正在面试辅导和企业面试确认阶段。	2026-04-27 03:43:39.926	2026-05-06 02:54:42.582
\.


--
-- Data for Name: SeekerServiceStep; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SeekerServiceStep" (id, "planId", key, title, "valueProposition", "providerType", status, "sortOrder", checklist, "deliverableSummary", "partnerOrgName", "updatedAt", "createdAt") FROM stdin;
cmognk87u000f7n9frzrkkg19	cmognk87q000d7n9fssq27w3q	PRE_CAREER_PLANNING	职前规划	填写经历、兴趣、测评并完成服务沟通，形成竞争力分析，确认岗位方向和薪资范围。	HYBRID	CONFIRMED	10	["个人信息表", "职业兴趣/性格/智商情商测评", "服务沟通", "竞争力分析报告", "求职方向确认书"]	已确认目标：前端工程师，期望薪资 18k-25k。	\N	2026-05-06 02:54:42.585	2026-04-27 03:43:39.93
cmognk87x000h7n9fiy2fdkuq	cmognk87q000d7n9fssq27w3q	RESUME_OPTIMIZATION	简历优化	基于新方向导入简历、诊断问题、复核优化稿，形成最终投递简历。	HYBRID	DELIVERED	20	["导入原始简历", "简历诊断报告", "确认修改建议", "复核优化稿", "求职者确认最终简历"]	已完成前端岗位简历优化，突出小程序、Vue 和 NestJS 协作经验。	\N	2026-05-06 02:54:42.588	2026-04-27 03:43:39.934
cmognk87z000j7n9fgmpxpfcv	cmognk87q000d7n9fssq27w3q	INTERVIEW_COACHING	面试辅导	完成题库视频学习、模拟面试和评估报告，提升回答内容、表达与非语言表现。	HYBRID	IN_PROGRESS	30	["人事/部门/笔试/软技能视频课", "预约视频模拟面试", "单次评分", "面试评估报告"]	已完成一次模拟面试，建议加强项目复盘和性能优化表达。	\N	2026-05-06 02:54:42.589	2026-04-27 03:43:39.935
cmognk880000l7n9fst68liv4	cmognk87q000d7n9fssq27w3q	INTERVIEW_CONFIRMATION	面试确认	平台导入并推送企业面试机会，求职者确认参加或拒绝。	PLATFORM	IN_PROGRESS	40	["导入面试岗位", "推送面试机会", "求职者确认参加/拒绝"]	森禾科技前端岗位已进入技术面确认阶段。	\N	2026-05-06 02:54:42.591	2026-04-27 03:43:39.936
cmognk881000n7n9f5ar12lj4	cmognk87q000d7n9fssq27w3q	POST_OFFER_COACHING	职后辅导	获得 offer 后提供试用期角色适应、职场答疑和心态管理陪伴。	HYBRID	NOT_STARTED	50	["新员工入职指南", "职场技能培训", "8:00-22:00 职场问题答疑", "试用期心态管理"]	Offer 后开启。	\N	2026-05-06 02:54:42.592	2026-04-27 03:43:39.938
cmognk882000p7n9f8vnie83k	cmognk87q000d7n9fssq27w3q	POST_CONVERSION_PLANNING	职后规划	转正后持续提供职业发展建议、社交能力提升、市场机会和学习资源。	PARTNER	LOCKED	60	["职业发展建议", "社交能力课程", "更优岗位机会推送", "持续学习推荐"]	转正后赠送并可续费。	南山职业训练营	2026-05-06 02:54:42.596	2026-04-27 03:43:39.939
\.


--
-- Data for Name: ServicePaymentMilestone; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ServicePaymentMilestone" (id, "planId", key, title, "amountFen", status, "triggerText", "orderId", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmognk884000r7n9f51gqe67y	cmognk87q000d7n9fssq27w3q	SIGN_CONTRACT	签约确认	0	PAID	确认 6 步服务内容并签署服务协议	\N	10	2026-04-27 03:43:39.94	2026-05-06 02:54:42.598
cmognk886000t7n9fbn4sfcev	cmognk87q000d7n9fssq27w3q	OFFER_DEPOSIT	Offer 后定金	9900	PAID	获得 offer 后触发	cmogkm2v4000pmaz97pwq1bs1	20	2026-04-27 03:43:39.943	2026-05-06 02:54:42.6
cmognk889000v7n9f1wt0xof4	cmognk87q000d7n9fssq27w3q	MONTH_2_BALANCE	第 2 月尾款	19900	PAYABLE	入职满第 2 个月后触发	\N	30	2026-04-27 03:43:39.945	2026-05-06 02:54:42.601
cmognk88a000x7n9fmcxm8rh9	cmognk87q000d7n9fssq27w3q	MONTH_3_BALANCE	第 3 月尾款	19900	LOCKED	入职满第 3 个月后触发	\N	40	2026-04-27 03:43:39.946	2026-05-06 02:54:42.602
cmognk88b000z7n9fxvi5jnst	cmognk87q000d7n9fssq27w3q	REGULARIZATION_GIFT	转正后职后服务	0	LOCKED	转正后赠送，可选续费	\N	50	2026-04-27 03:43:39.948	2026-05-06 02:54:42.603
\.


--
-- Data for Name: ServiceProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ServiceProduct" (id, "tenantId", code, name, audience, "orderKind", "amountFen", currency, description, enabled, "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmodor6b5000a196zp316brnu	cmodor6790000196zyooghdmp	seeker-offer-deposit	求职服务 · offer 后定金	JOB_SEEKER	SEEKER_SERVICE_FEE	99	CNY	MVP 联调价格；正式金额由运营在管理端配置。	t	10	2026-04-25 01:53:45.137	2026-05-06 02:54:40.689
cmodor6b7000c196zab7gbj37	cmodor6790000196zyooghdmp	enterprise-subscription-basic	企业年费订阅 · 基础档	ENTERPRISE	ENTERPRISE_SUBSCRIPTION	19900	CNY	企业岗位代发与候选人服务基础订阅。	t	20	2026-04-25 01:53:45.139	2026-05-06 02:54:40.697
\.


--
-- Data for Name: ServiceStepInteraction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ServiceStepInteraction" (id, "tenantId", "stepId", "requestedById", "promptKey", "inputText", "outputText", vendor, "modelName", "routeId", "createdAt", "feedbackRating", "feedbackText", "feedbackAt") FROM stdin;
cmogpztvl000114dmgfj9lwkb	cmodor6790000196zyooghdmp	cmognk87u000f7n9frzrkkg19	cmogkm2tx0003maz9tm9jum1j	service_step_PRE_CAREER_PLANNING	请为我生成职前规划建议	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：职前规划\n服务价值：填写经历、兴趣、测评并连线职业顾问，生成竞争力分析，确认岗位方向和薪资范围。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 04:51:47.073	\N	\N	\N
cmogq8xog000514dmlpftd76r	cmodor6790000196zyooghdmp	cmognk87x000h7n9fiy2fdkuq	cmodor6aq0002196zitwpf1e8	service_step_RESUME_OPTIMIZATION	老师代生成简历优化建议	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：简历优化\n服务价值：基于新方向导入简历、诊断问题、老师确认优化稿，形成最终投递简历。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue、小程序、N	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 04:58:51.904	\N	\N	\N
cmogqehcp000b14dmupnudg3s	cmodor6790000196zyooghdmp	cmognk87u000f7n9frzrkkg19	cmogkm2tx0003maz9tm9jum1j	service_step_PRE_CAREER_PLANNING	本地模拟：请基于我的档案生成该环节的服务建议。	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：职前规划\n服务价值：填写经历、兴趣、测评并连线职业顾问，生成竞争力分析，确认岗位方向和薪资范围。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 05:03:10.681	\N	\N	\N
cmogqfxmf00017u8gmjqva5uy	cmodor6790000196zyooghdmp	cmognk87u000f7n9frzrkkg19	cmogkm2tx0003maz9tm9jum1j	service_step_PRE_CAREER_PLANNING	请生成服务建议	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：职前规划\n服务价值：填写经历、兴趣、测评并连线职业顾问，生成竞争力分析，确认岗位方向和薪资范围。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 05:04:18.423	\N	\N	\N
cmogqthlk00077u8g566rvt3l	cmodor6790000196zyooghdmp	cmognk87u000f7n9frzrkkg19	cmogkm2tx0003maz9tm9jum1j	service_step_PRE_CAREER_PLANNING	本地模拟：请基于我的档案生成该环节的服务建议。	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：职前规划\n服务价值：填写经历、兴趣、测评并连线职业顾问，生成竞争力分析，确认岗位方向和薪资范围。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 05:14:50.84	\N	\N	\N
cmogqtigy000b7u8g4p36r72t	cmodor6790000196zyooghdmp	cmognk87u000f7n9frzrkkg19	cmogkm2tx0003maz9tm9jum1j	service_step_PRE_CAREER_PLANNING	本地模拟：请基于我的档案生成该环节的服务建议。	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：职前规划\n服务价值：填写经历、兴趣、测评并连线职业顾问，生成竞争力分析，确认岗位方向和薪资范围。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 05:14:51.971	\N	\N	\N
cmogqtznw000h7u8gep9plbrk	cmodor6790000196zyooghdmp	cmognk87z000j7n9fgmpxpfcv	cmogkm2tx0003maz9tm9jum1j	service_step_INTERVIEW_COACHING	本地模拟：请基于我的档案生成该环节的服务建议。	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：面试辅导\n服务价值：完成题库视频学习、模拟面试和评估报告，提升回答内容、表达与非语言表现。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue、小程	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 05:15:14.253	\N	\N	\N
cmogqu6ex000n7u8g7gwhhgxa	cmodor6790000196zyooghdmp	cmognk880000l7n9fst68liv4	cmogkm2tx0003maz9tm9jum1j	service_step_INTERVIEW_CONFIRMATION	本地模拟：请基于我的档案生成该环节的服务建议。	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：面试确认\n服务价值：就业老师导入并推送企业面试机会，求职者确认参加或拒绝。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue、小程序、Node 服	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 05:15:23.001	\N	\N	\N
cmogqujrn000t7u8g90yyjy0o	cmodor6790000196zyooghdmp	cmognk881000n7n9f5ar12lj4	cmogkm2tx0003maz9tm9jum1j	service_step_POST_OFFER_COACHING	本地模拟：请基于我的档案生成该环节的服务建议。	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：职后辅导\n服务价值：获得 offer 后提供试用期角色适应、职场答疑和心态管理陪伴。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue、小程序、N	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 05:15:40.307	\N	\N	\N
cmogqurge000z7u8gpd0an6su	cmodor6790000196zyooghdmp	cmognk882000p7n9f8vnie83k	cmogkm2tx0003maz9tm9jum1j	service_step_POST_CONVERSION_PLANNING	本地模拟：请基于我的档案生成该环节的服务建议。	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：职后规划\n服务价值：转正后持续提供职业发展建议、社交能力提升、市场机会和学习资源。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue、小程序、No	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 05:15:50.27	\N	\N	\N
cmogr8zub0001b7q18xrlh3ur	cmodor6790000196zyooghdmp	cmognk87u000f7n9frzrkkg19	cmogkm2tx0003maz9tm9jum1j	service_step_PRE_CAREER_PLANNING	请生成服务建议并用于反馈测试	【占位·已读库路由】provider=stub model=stub-local scenario=default。用户末条摘要：服务环节：职前规划\n服务价值：填写经历、兴趣、测评并连线职业顾问，生成竞争力分析，确认岗位方向和薪资范围。\n目标岗位：前端工程师 · 小程序与运营后台\n期望薪资：1800000-2500000 分\n候选人亮点：3 年前端工程师，熟悉 Vue	stub	stub-local	cmodor6b30008196zi0xw17qs	2026-04-27 05:26:54.323	5	建议清晰，有帮助	2026-04-27 05:26:54.37
\.


--
-- Data for Name: SmsOtp; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SmsOtp" (id, "tenantId", phone, purpose, "codeHash", "expiresAt", "consumedAt", "verifyAttempts", "createdAt") FROM stdin;
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Tenant" (id, name, slug, "logoUrl", "primaryColor", "accentColor", "welcomeText", "wxMiniAppId", "createdAt", "updatedAt") FROM stdin;
cmodor6790000196zyooghdmp	职爱通	default	\N	#243F34	#B87932	从岗位匹配、协议签署到服务付费的一站式就业服务工作流		2026-04-25 01:53:44.997	2026-05-06 03:12:29.506
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, "tenantId", email, phone, "passwordHash", "displayName", role, "createdAt", "updatedAt") FROM stdin;
cmogkm2tx0003maz9tm9jum1j	cmodor6790000196zyooghdmp	\N	13600000001	\N	陈一舟	JOB_SEEKER	2026-04-27 02:21:07.413	2026-05-06 02:54:42.538
cmofh899n0001xp4x73grx4nb	cmodor6790000196zyooghdmp	teacher-smoke@example.com	\N	$2a$10$6FygWE4ZLLB3wNlI2CuIGOxeNuRfvusQ459ZGCmJNawO/Ia5VxRy2	冒烟就业老师（已更新）	TEACHER	2026-04-26 07:58:37.547	2026-04-26 07:58:37.587
cmogk3hix00018ywwleyzpboa	cmodor6790000196zyooghdmp	\N	13700000000	\N	冒烟候选人	JOB_SEEKER	2026-04-27 02:06:39.993	2026-04-27 02:06:39.993
cmogkm2u00005maz9lh312ee5	cmodor6790000196zyooghdmp	\N	13600000002	\N	周若宁	JOB_SEEKER	2026-04-27 02:21:07.417	2026-05-06 02:54:42.54
cmogkm2u40007maz9x8qiseza	cmodor6790000196zyooghdmp	\N	13600000003	\N	何明远	JOB_SEEKER	2026-04-27 02:21:07.42	2026-05-06 02:54:42.542
cmogl3b5q0005d9x1tklohj1t	cmodor6790000196zyooghdmp	enterprise.demo@aihr.local	\N	\N	森禾科技 · HR 联系人	ENTERPRISE_USER	2026-04-27 02:34:31.359	2026-05-06 02:54:42.552
cmogkm2vz000xmaz9dd4fgtxy	cmodor6790000196zyooghdmp	partner.demo@aihr.local	\N	\N	南山职业训练营	PARTNER	2026-04-27 02:21:07.488	2026-05-06 02:54:42.607
cmodor6aq0002196zitwpf1e8	cmodor6790000196zyooghdmp	admin@example.com	\N	$2a$10$vKdH1I.xPIw0ARJspAvi5uBs5aD2QoylgCjr04HH5mnRgx8.COvH6	系统管理员	ADMIN	2026-04-25 01:53:45.122	2026-05-06 02:54:42.401
cmogkm2ts0001maz9tof49f4l	cmodor6790000196zyooghdmp	teacher.demo@aihr.local	\N	$2a$10$YqajubYc9yQZX84u2WytkeYu7KJAQ8Qaa2b.4GgwqONcKv7aRKZ7y	林老师 · 就业运营	TEACHER	2026-04-27 02:21:07.408	2026-05-06 02:54:42.535
\.


--
-- Data for Name: UserConsent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserConsent" (id, "tenantId", "userId", purpose, version, "contentHash", metadata, "createdAt") FROM stdin;
cmogkm2ve000rmaz9d5wgma7s	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	SERVICE_PAYMENT	demo-2026-04	9206c9089883a9bbb2a00c8ac674c6d7517503c01bf9a418357c11f9b7e77e0d	{"source": "demo-seed", "orderId": "cmogkm2v4000pmaz97pwq1bs1"}	2026-04-27 02:21:07.466
\.


--
-- Data for Name: UserNotification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserNotification" (id, "tenantId", "userId", title, body, category, metadata, "readAt", "createdAt") FROM stdin;
cmodpxqpv0005zp3xry4okni5	cmodor6790000196zyooghdmp	cmodor6aq0002196zitwpf1e8	待签署协议已生成	协议「冒烟测试服务协议」已生成，请在小程序查看。	CONTRACT	{"contractId": "cmodpxqpo0001zp3x6tt53isy"}	\N	2026-04-25 02:26:51.14
cmogkm2wi0013maz9sw8hi122	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	面试安排已更新	森禾科技前端工程师岗位已进入面试阶段。	JOB_APPLICATION	{"source": "demo-seed"}	\N	2026-04-27 02:21:07.506
cmogkm2wo0015maz9t9j8293q	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	服务协议已签署	完整模拟 · 求职服务协议已完成签署占位。	CONTRACT	{"source": "demo-seed"}	\N	2026-04-27 02:21:07.512
cmogkm2wq0017maz96uo2k896	cmodor6790000196zyooghdmp	cmogkm2vz000xmaz9dd4fgtxy	伙伴入驻已通过	南山职业训练营已通过平台审核。	PARTNER_APPLICATION	{"source": "demo-seed"}	\N	2026-04-27 02:21:07.515
cmogq8xoo000914dmgsb1jabj	cmodor6790000196zyooghdmp	cmogkm2tx0003maz9tm9jum1j	简历优化服务已更新	就业老师已为你生成新的服务建议，请在服务计划中查看。	SERVICE_PLAN	{"planId": "cmognk87q000d7n9fssq27w3q", "stepId": "cmognk87x000h7n9fiy2fdkuq", "interactionId": "cmogq8xog000514dmlpftd76r"}	\N	2026-04-27 04:58:51.913
cmogsml9l0003lxexu4ubloo3	cmodor6790000196zyooghdmp	cmogkm2u40007maz9x8qiseza	投递状态已更新	你投递的「前端工程师 · 小程序与运营后台」状态已更新为 OFFER	JOB_APPLICATION	{"status": "OFFER", "jobPostingId": "cmogkm2ur000fmaz9uhj1pon7", "applicationId": "cmogkm2v0000lmaz9ra6n791b"}	\N	2026-04-27 06:05:28.234
\.


--
-- Data for Name: WxMiniUser; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WxMiniUser" (id, "tenantId", "userId", openid, unionid, "sessionKey", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0db18673-dc7a-4514-b8ed-0fbe494183df	4b3766335bb92516ad268911da9b6708a156bdf7a0cc11e1f8137568d4f40b2a	2026-04-25 01:53:42.794533+00	20260424120000_init	\N	\N	2026-04-25 01:53:42.758823+00	1
a3a1109c-a2ca-47a1-9066-de4f092fa9eb	e5c7902a64de6886a016e796d6f8b017f75ce390eda8175d9eb2cafe3f5cdeff	2026-04-27 09:02:21.193239+00	20260428120000_mock_interview_sessions	\N	\N	2026-04-27 09:02:21.17381+00	1
f45b10f2-33e7-4c70-9234-eb7ce90a9212	6461601b4fe871c3ac78fd4e424fa9703dbcafa53540b67bf9df234568db7d99	2026-04-25 01:53:42.802645+00	20260424140000_order_and_pay	\N	\N	2026-04-25 01:53:42.795259+00	1
41b92ec6-9660-49df-9f11-c1f138698bb7	41254eb48190d10f724371b7a3650640258c380121888ff2f66d566ca3c55440	2026-04-25 01:53:42.812912+00	20260424160000_sms_otp	\N	\N	2026-04-25 01:53:42.803406+00	1
ae1c4396-940d-41fc-a7d2-bc7eab19fe52	42f04dcadb04f1e40c8e4423ff833e0becb69f18d782d1972f683560fabc57db	2026-04-25 01:53:42.828302+00	20260424180000_job_application	\N	\N	2026-04-25 01:53:42.813707+00	1
0fbbbbad-6613-4b01-9bd3-65deb8b9df78	f4c10070b121b00143fe6b9f7e43c59f773cba9f04b23533a4207fd0cd3c9971	2026-05-06 02:14:50.642599+00	20260506021450_mock_interview_trtc_vr_config	\N	\N	2026-05-06 02:14:50.626857+00	1
b6a5434d-60ed-4237-ace6-c8538fd353af	e599119b3381f2993ded2112fac8d02e12f16b8c5e9273942bbd533729c5002e	2026-04-25 01:53:42.848956+00	20260424210000_ai_seeker_profile	\N	\N	2026-04-25 01:53:42.829134+00	1
10c99070-6d73-4056-a886-8dc482a5bc86	77f3c7fdfc841d32b6b9be872a48bb73e6f3acbb32a500d9f209be7d180a5fac	2026-04-25 01:53:42.867096+00	20260425091000_pricing_and_consents	\N	\N	2026-04-25 01:53:42.850175+00	1
b83e7d64-2583-4fa9-850d-a57e869b3f14	5ec5b1f0031d14321f6626ff0945e8b8a687a68ec6f2b3ae64d9ad71aeaa0a68	2026-04-25 01:53:42.879187+00	20260425092000_partner_applications	\N	\N	2026-04-25 01:53:42.867916+00	1
7d162aec-2e2e-4802-8ca3-f2f7c5684916	5a67e824cd98fce6cf9538d8f47a848aa6502f1caf47ff50994d7d06be01fe53	2026-04-25 01:53:42.887047+00	20260425094000_user_notifications	\N	\N	2026-04-25 01:53:42.879904+00	1
0bd3c43e-72df-4cbb-a552-f6cc6da5b3b3	a545f5efc60831dee5be43b9934b98fc1fbc167be1696a1a656d3bf52c47c188	2026-04-25 02:25:33.178641+00	20260425101000_contracts_refunds_compliance	\N	\N	2026-04-25 02:25:33.14448+00	1
2544bdf6-d015-4db1-9064-6a7532a06479	f3733536de11b590b35dddf303c68bd8ec05977471a9f57b24f08c56828e950e	2026-04-27 03:43:36.8934+00	20260427112000_seeker_service_plan	\N	\N	2026-04-27 03:43:36.846015+00	1
95c8fc7e-41f1-4099-876a-9e9202432556	2e9f83d6fda59f792a06a0da153fe0c0f2fe9116b480dd094a7167be69ed30d2	2026-04-27 04:37:43.173051+00	20260427123000_interview_opportunities	\N	\N	2026-04-27 04:37:43.154318+00	1
2f3b1a95-0a5c-4879-a4d0-31a6feb488f3	a9259f31626985a84230ecb38ca2af9bcd68d2649a663aa95e94ca4f2212158a	2026-04-27 04:50:18.108992+00	20260427124000_service_step_interactions	\N	\N	2026-04-27 04:50:18.082933+00	1
914b364d-0e33-43e8-b70a-6965b8c2d106	255250b888240be5f9aad2f12bacadc9fceb6b068aeafa070b68df0c48bf6fb8	2026-04-27 05:24:59.383269+00	20260427130000_service_step_feedback	\N	\N	2026-04-27 05:24:59.372665+00	1
\.


--
-- Name: AiLlmRoute AiLlmRoute_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiLlmRoute"
    ADD CONSTRAINT "AiLlmRoute_pkey" PRIMARY KEY (id);


--
-- Name: AiPromptTemplate AiPromptTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiPromptTemplate"
    ADD CONSTRAINT "AiPromptTemplate_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: ComplianceTemplate ComplianceTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ComplianceTemplate"
    ADD CONSTRAINT "ComplianceTemplate_pkey" PRIMARY KEY (id);


--
-- Name: ContractAgreement ContractAgreement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAgreement"
    ADD CONSTRAINT "ContractAgreement_pkey" PRIMARY KEY (id);


--
-- Name: EnterpriseConfirmation EnterpriseConfirmation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EnterpriseConfirmation"
    ADD CONSTRAINT "EnterpriseConfirmation_pkey" PRIMARY KEY (id);


--
-- Name: Enterprise Enterprise_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Enterprise"
    ADD CONSTRAINT "Enterprise_pkey" PRIMARY KEY (id);


--
-- Name: InterviewOpportunity InterviewOpportunity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InterviewOpportunity"
    ADD CONSTRAINT "InterviewOpportunity_pkey" PRIMARY KEY (id);


--
-- Name: JobApplication JobApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobApplication"
    ADD CONSTRAINT "JobApplication_pkey" PRIMARY KEY (id);


--
-- Name: JobPosting JobPosting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobPosting"
    ADD CONSTRAINT "JobPosting_pkey" PRIMARY KEY (id);


--
-- Name: JobSeekerProfile JobSeekerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobSeekerProfile"
    ADD CONSTRAINT "JobSeekerProfile_pkey" PRIMARY KEY (id);


--
-- Name: MockInterviewSession MockInterviewSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MockInterviewSession"
    ADD CONSTRAINT "MockInterviewSession_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PartnerApplication PartnerApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PartnerApplication"
    ADD CONSTRAINT "PartnerApplication_pkey" PRIMARY KEY (id);


--
-- Name: RefundRequest RefundRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundRequest"
    ADD CONSTRAINT "RefundRequest_pkey" PRIMARY KEY (id);


--
-- Name: SeekerServicePlan SeekerServicePlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SeekerServicePlan"
    ADD CONSTRAINT "SeekerServicePlan_pkey" PRIMARY KEY (id);


--
-- Name: SeekerServiceStep SeekerServiceStep_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SeekerServiceStep"
    ADD CONSTRAINT "SeekerServiceStep_pkey" PRIMARY KEY (id);


--
-- Name: ServicePaymentMilestone ServicePaymentMilestone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServicePaymentMilestone"
    ADD CONSTRAINT "ServicePaymentMilestone_pkey" PRIMARY KEY (id);


--
-- Name: ServiceProduct ServiceProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceProduct"
    ADD CONSTRAINT "ServiceProduct_pkey" PRIMARY KEY (id);


--
-- Name: ServiceStepInteraction ServiceStepInteraction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceStepInteraction"
    ADD CONSTRAINT "ServiceStepInteraction_pkey" PRIMARY KEY (id);


--
-- Name: SmsOtp SmsOtp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SmsOtp"
    ADD CONSTRAINT "SmsOtp_pkey" PRIMARY KEY (id);


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: UserConsent UserConsent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserConsent"
    ADD CONSTRAINT "UserConsent_pkey" PRIMARY KEY (id);


--
-- Name: UserNotification UserNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserNotification"
    ADD CONSTRAINT "UserNotification_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WxMiniUser WxMiniUser_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WxMiniUser"
    ADD CONSTRAINT "WxMiniUser_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AiLlmRoute_tenantId_scenario_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiLlmRoute_tenantId_scenario_enabled_idx" ON public."AiLlmRoute" USING btree ("tenantId", scenario, enabled);


--
-- Name: AiPromptTemplate_tenantId_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AiPromptTemplate_tenantId_key_key" ON public."AiPromptTemplate" USING btree ("tenantId", key);


--
-- Name: ComplianceTemplate_tenantId_purpose_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ComplianceTemplate_tenantId_purpose_enabled_idx" ON public."ComplianceTemplate" USING btree ("tenantId", purpose, enabled);


--
-- Name: ComplianceTemplate_tenantId_purpose_version_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ComplianceTemplate_tenantId_purpose_version_key" ON public."ComplianceTemplate" USING btree ("tenantId", purpose, version);


--
-- Name: ContractAgreement_tenantId_enterpriseId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAgreement_tenantId_enterpriseId_status_createdAt_idx" ON public."ContractAgreement" USING btree ("tenantId", "enterpriseId", status, "createdAt");


--
-- Name: ContractAgreement_tenantId_userId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAgreement_tenantId_userId_status_createdAt_idx" ON public."ContractAgreement" USING btree ("tenantId", "userId", status, "createdAt");


--
-- Name: InterviewOpportunity_jobPostingId_seekerUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "InterviewOpportunity_jobPostingId_seekerUserId_key" ON public."InterviewOpportunity" USING btree ("jobPostingId", "seekerUserId");


--
-- Name: InterviewOpportunity_tenantId_jobPostingId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InterviewOpportunity_tenantId_jobPostingId_status_idx" ON public."InterviewOpportunity" USING btree ("tenantId", "jobPostingId", status);


--
-- Name: InterviewOpportunity_tenantId_seekerUserId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InterviewOpportunity_tenantId_seekerUserId_status_createdAt_idx" ON public."InterviewOpportunity" USING btree ("tenantId", "seekerUserId", status, "createdAt");


--
-- Name: JobApplication_jobPostingId_seekerUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "JobApplication_jobPostingId_seekerUserId_key" ON public."JobApplication" USING btree ("jobPostingId", "seekerUserId");


--
-- Name: JobApplication_tenantId_jobPostingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobApplication_tenantId_jobPostingId_idx" ON public."JobApplication" USING btree ("tenantId", "jobPostingId");


--
-- Name: JobApplication_tenantId_seekerUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobApplication_tenantId_seekerUserId_idx" ON public."JobApplication" USING btree ("tenantId", "seekerUserId");


--
-- Name: JobSeekerProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "JobSeekerProfile_userId_key" ON public."JobSeekerProfile" USING btree ("userId");


--
-- Name: MockInterviewSession_tenantId_seekerUserId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MockInterviewSession_tenantId_seekerUserId_createdAt_idx" ON public."MockInterviewSession" USING btree ("tenantId", "seekerUserId", "createdAt");


--
-- Name: MockInterviewSession_tenantId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MockInterviewSession_tenantId_status_idx" ON public."MockInterviewSession" USING btree ("tenantId", status);


--
-- Name: Order_outTradeNo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_outTradeNo_key" ON public."Order" USING btree ("outTradeNo");


--
-- Name: PartnerApplication_tenantId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PartnerApplication_tenantId_status_createdAt_idx" ON public."PartnerApplication" USING btree ("tenantId", status, "createdAt");


--
-- Name: PartnerApplication_tenantId_submittedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PartnerApplication_tenantId_submittedById_idx" ON public."PartnerApplication" USING btree ("tenantId", "submittedById");


--
-- Name: RefundRequest_tenantId_orderId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RefundRequest_tenantId_orderId_status_idx" ON public."RefundRequest" USING btree ("tenantId", "orderId", status);


--
-- Name: RefundRequest_tenantId_requestedById_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RefundRequest_tenantId_requestedById_createdAt_idx" ON public."RefundRequest" USING btree ("tenantId", "requestedById", "createdAt");


--
-- Name: SeekerServicePlan_tenantId_seekerUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SeekerServicePlan_tenantId_seekerUserId_key" ON public."SeekerServicePlan" USING btree ("tenantId", "seekerUserId");


--
-- Name: SeekerServicePlan_tenantId_status_updatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SeekerServicePlan_tenantId_status_updatedAt_idx" ON public."SeekerServicePlan" USING btree ("tenantId", status, "updatedAt");


--
-- Name: SeekerServiceStep_planId_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SeekerServiceStep_planId_key_key" ON public."SeekerServiceStep" USING btree ("planId", key);


--
-- Name: SeekerServiceStep_planId_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SeekerServiceStep_planId_sortOrder_idx" ON public."SeekerServiceStep" USING btree ("planId", "sortOrder");


--
-- Name: ServicePaymentMilestone_planId_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ServicePaymentMilestone_planId_key_key" ON public."ServicePaymentMilestone" USING btree ("planId", key);


--
-- Name: ServicePaymentMilestone_planId_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServicePaymentMilestone_planId_sortOrder_idx" ON public."ServicePaymentMilestone" USING btree ("planId", "sortOrder");


--
-- Name: ServiceProduct_tenantId_audience_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProduct_tenantId_audience_enabled_idx" ON public."ServiceProduct" USING btree ("tenantId", audience, enabled);


--
-- Name: ServiceProduct_tenantId_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ServiceProduct_tenantId_code_key" ON public."ServiceProduct" USING btree ("tenantId", code);


--
-- Name: ServiceStepInteraction_tenantId_requestedById_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceStepInteraction_tenantId_requestedById_createdAt_idx" ON public."ServiceStepInteraction" USING btree ("tenantId", "requestedById", "createdAt");


--
-- Name: ServiceStepInteraction_tenantId_stepId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceStepInteraction_tenantId_stepId_createdAt_idx" ON public."ServiceStepInteraction" USING btree ("tenantId", "stepId", "createdAt");


--
-- Name: SmsOtp_phone_purpose_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SmsOtp_phone_purpose_createdAt_idx" ON public."SmsOtp" USING btree (phone, purpose, "createdAt");


--
-- Name: Tenant_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Tenant_slug_key" ON public."Tenant" USING btree (slug);


--
-- Name: Tenant_wxMiniAppId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Tenant_wxMiniAppId_key" ON public."Tenant" USING btree ("wxMiniAppId");


--
-- Name: UserConsent_tenantId_userId_purpose_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserConsent_tenantId_userId_purpose_createdAt_idx" ON public."UserConsent" USING btree ("tenantId", "userId", purpose, "createdAt");


--
-- Name: UserNotification_tenantId_userId_readAt_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserNotification_tenantId_userId_readAt_createdAt_idx" ON public."UserNotification" USING btree ("tenantId", "userId", "readAt", "createdAt");


--
-- Name: User_tenantId_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_tenantId_email_key" ON public."User" USING btree ("tenantId", email);


--
-- Name: User_tenantId_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_tenantId_phone_key" ON public."User" USING btree ("tenantId", phone);


--
-- Name: WxMiniUser_tenantId_openid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WxMiniUser_tenantId_openid_key" ON public."WxMiniUser" USING btree ("tenantId", openid);


--
-- Name: AiLlmRoute AiLlmRoute_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiLlmRoute"
    ADD CONSTRAINT "AiLlmRoute_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AiPromptTemplate AiPromptTemplate_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiPromptTemplate"
    ADD CONSTRAINT "AiPromptTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_performedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ComplianceTemplate ComplianceTemplate_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ComplianceTemplate"
    ADD CONSTRAINT "ComplianceTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContractAgreement ContractAgreement_enterpriseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAgreement"
    ADD CONSTRAINT "ContractAgreement_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES public."Enterprise"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractAgreement ContractAgreement_jobApplicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAgreement"
    ADD CONSTRAINT "ContractAgreement_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES public."JobApplication"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractAgreement ContractAgreement_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAgreement"
    ADD CONSTRAINT "ContractAgreement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractAgreement ContractAgreement_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAgreement"
    ADD CONSTRAINT "ContractAgreement_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ComplianceTemplate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractAgreement ContractAgreement_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAgreement"
    ADD CONSTRAINT "ContractAgreement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContractAgreement ContractAgreement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAgreement"
    ADD CONSTRAINT "ContractAgreement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EnterpriseConfirmation EnterpriseConfirmation_enterpriseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EnterpriseConfirmation"
    ADD CONSTRAINT "EnterpriseConfirmation_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES public."Enterprise"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EnterpriseConfirmation EnterpriseConfirmation_performedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EnterpriseConfirmation"
    ADD CONSTRAINT "EnterpriseConfirmation_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EnterpriseConfirmation EnterpriseConfirmation_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EnterpriseConfirmation"
    ADD CONSTRAINT "EnterpriseConfirmation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Enterprise Enterprise_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Enterprise"
    ADD CONSTRAINT "Enterprise_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InterviewOpportunity InterviewOpportunity_jobPostingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InterviewOpportunity"
    ADD CONSTRAINT "InterviewOpportunity_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES public."JobPosting"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InterviewOpportunity InterviewOpportunity_pushedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InterviewOpportunity"
    ADD CONSTRAINT "InterviewOpportunity_pushedById_fkey" FOREIGN KEY ("pushedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InterviewOpportunity InterviewOpportunity_seekerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InterviewOpportunity"
    ADD CONSTRAINT "InterviewOpportunity_seekerUserId_fkey" FOREIGN KEY ("seekerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InterviewOpportunity InterviewOpportunity_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InterviewOpportunity"
    ADD CONSTRAINT "InterviewOpportunity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JobApplication JobApplication_jobPostingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobApplication"
    ADD CONSTRAINT "JobApplication_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES public."JobPosting"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JobApplication JobApplication_seekerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobApplication"
    ADD CONSTRAINT "JobApplication_seekerUserId_fkey" FOREIGN KEY ("seekerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JobApplication JobApplication_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobApplication"
    ADD CONSTRAINT "JobApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JobPosting JobPosting_enterpriseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobPosting"
    ADD CONSTRAINT "JobPosting_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES public."Enterprise"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JobPosting JobPosting_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobPosting"
    ADD CONSTRAINT "JobPosting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JobSeekerProfile JobSeekerProfile_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobSeekerProfile"
    ADD CONSTRAINT "JobSeekerProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JobSeekerProfile JobSeekerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobSeekerProfile"
    ADD CONSTRAINT "JobSeekerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MockInterviewSession MockInterviewSession_seekerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MockInterviewSession"
    ADD CONSTRAINT "MockInterviewSession_seekerUserId_fkey" FOREIGN KEY ("seekerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MockInterviewSession MockInterviewSession_servicePlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MockInterviewSession"
    ADD CONSTRAINT "MockInterviewSession_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES public."SeekerServicePlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MockInterviewSession MockInterviewSession_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MockInterviewSession"
    ADD CONSTRAINT "MockInterviewSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_payerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_payerUserId_fkey" FOREIGN KEY ("payerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PartnerApplication PartnerApplication_submittedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PartnerApplication"
    ADD CONSTRAINT "PartnerApplication_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PartnerApplication PartnerApplication_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PartnerApplication"
    ADD CONSTRAINT "PartnerApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RefundRequest RefundRequest_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundRequest"
    ADD CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RefundRequest RefundRequest_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundRequest"
    ADD CONSTRAINT "RefundRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefundRequest RefundRequest_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundRequest"
    ADD CONSTRAINT "RefundRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SeekerServicePlan SeekerServicePlan_seekerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SeekerServicePlan"
    ADD CONSTRAINT "SeekerServicePlan_seekerUserId_fkey" FOREIGN KEY ("seekerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SeekerServicePlan SeekerServicePlan_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SeekerServicePlan"
    ADD CONSTRAINT "SeekerServicePlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SeekerServiceStep SeekerServiceStep_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SeekerServiceStep"
    ADD CONSTRAINT "SeekerServiceStep_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."SeekerServicePlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServicePaymentMilestone ServicePaymentMilestone_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServicePaymentMilestone"
    ADD CONSTRAINT "ServicePaymentMilestone_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServicePaymentMilestone ServicePaymentMilestone_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServicePaymentMilestone"
    ADD CONSTRAINT "ServicePaymentMilestone_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."SeekerServicePlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceProduct ServiceProduct_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceProduct"
    ADD CONSTRAINT "ServiceProduct_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServiceStepInteraction ServiceStepInteraction_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceStepInteraction"
    ADD CONSTRAINT "ServiceStepInteraction_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceStepInteraction ServiceStepInteraction_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceStepInteraction"
    ADD CONSTRAINT "ServiceStepInteraction_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public."SeekerServiceStep"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceStepInteraction ServiceStepInteraction_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceStepInteraction"
    ADD CONSTRAINT "ServiceStepInteraction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SmsOtp SmsOtp_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SmsOtp"
    ADD CONSTRAINT "SmsOtp_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserConsent UserConsent_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserConsent"
    ADD CONSTRAINT "UserConsent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserConsent UserConsent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserConsent"
    ADD CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserNotification UserNotification_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserNotification"
    ADD CONSTRAINT "UserNotification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserNotification UserNotification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserNotification"
    ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WxMiniUser WxMiniUser_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WxMiniUser"
    ADD CONSTRAINT "WxMiniUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WxMiniUser WxMiniUser_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WxMiniUser"
    ADD CONSTRAINT "WxMiniUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict CDsUyYf4nyQZfhbGJNBOdYA2dDt68WhnjzYI7mdVNoXyWQ6fcMAKQmRX9ddfc2D

