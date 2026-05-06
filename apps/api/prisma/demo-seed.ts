import {
  ContractStatus,
  EnterpriseConfirmationType,
  InterviewOpportunityStatus,
  JobApplicationStatus,
  OrderKind,
  OrderStatus,
  PaymentMilestoneKey,
  PaymentMilestoneStatus,
  PartnerApplicationStatus,
  PlatformRole,
  PrismaClient,
  RefundRequestStatus,
  SeekerServiceStepKey,
  SeekerServiceStepStatus,
  ServiceProviderType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hash(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

const demoSteps = [
  {
    key: SeekerServiceStepKey.PRE_CAREER_PLANNING,
    title: '职前规划',
    valueProposition: '填写经历、兴趣、测评并完成服务沟通，形成竞争力分析，确认岗位方向和薪资范围。',
    providerType: ServiceProviderType.HYBRID,
    status: SeekerServiceStepStatus.CONFIRMED,
    sortOrder: 10,
    checklist: ['个人信息表', '职业兴趣/性格/智商情商测评', '服务沟通', '竞争力分析报告', '求职方向确认书'],
    deliverableSummary: '已确认目标：前端工程师，期望薪资 18k-25k。',
  },
  {
    key: SeekerServiceStepKey.RESUME_OPTIMIZATION,
    title: '简历优化',
    valueProposition: '基于新方向导入简历、诊断问题、复核优化稿，形成最终投递简历。',
    providerType: ServiceProviderType.HYBRID,
    status: SeekerServiceStepStatus.DELIVERED,
    sortOrder: 20,
    checklist: ['导入原始简历', '简历诊断报告', '确认修改建议', '复核优化稿', '求职者确认最终简历'],
    deliverableSummary: '已完成前端岗位简历优化，突出小程序、Vue 和 NestJS 协作经验。',
  },
  {
    key: SeekerServiceStepKey.INTERVIEW_COACHING,
    title: '面试辅导',
    valueProposition: '完成题库视频学习、模拟面试和评估报告，提升回答内容、表达与非语言表现。',
    providerType: ServiceProviderType.HYBRID,
    status: SeekerServiceStepStatus.IN_PROGRESS,
    sortOrder: 30,
    checklist: ['人事/部门/笔试/软技能视频课', '预约视频模拟面试', '单次评分', '面试评估报告'],
    deliverableSummary: '已完成一次模拟面试，建议加强项目复盘和性能优化表达。',
  },
  {
    key: SeekerServiceStepKey.INTERVIEW_CONFIRMATION,
    title: '面试确认',
    valueProposition: '平台导入并推送企业面试机会，求职者确认参加或拒绝。',
    providerType: ServiceProviderType.PLATFORM,
    status: SeekerServiceStepStatus.IN_PROGRESS,
    sortOrder: 40,
    checklist: ['导入面试岗位', '推送面试机会', '求职者确认参加/拒绝'],
    deliverableSummary: '森禾科技前端岗位已进入技术面确认阶段。',
  },
  {
    key: SeekerServiceStepKey.POST_OFFER_COACHING,
    title: '职后辅导',
    valueProposition: '获得 offer 后提供试用期角色适应、职场答疑和心态管理陪伴。',
    providerType: ServiceProviderType.HYBRID,
    status: SeekerServiceStepStatus.NOT_STARTED,
    sortOrder: 50,
    checklist: ['新员工入职指南', '职场技能培训', '8:00-22:00 职场问题答疑', '试用期心态管理'],
    deliverableSummary: 'Offer 后开启。',
  },
  {
    key: SeekerServiceStepKey.POST_CONVERSION_PLANNING,
    title: '职后规划',
    valueProposition: '转正后持续提供职业发展建议、社交能力提升、市场机会和学习资源。',
    providerType: ServiceProviderType.PARTNER,
    status: SeekerServiceStepStatus.LOCKED,
    sortOrder: 60,
    checklist: ['职业发展建议', '社交能力课程', '更优岗位机会推送', '持续学习推荐'],
    partnerOrgName: '南山职业训练营',
    deliverableSummary: '转正后赠送并可续费。',
  },
];

const demoMilestones = [
  { key: PaymentMilestoneKey.SIGN_CONTRACT, title: '签约确认', amountFen: 0, status: PaymentMilestoneStatus.PAID, triggerText: '确认 6 步服务内容并签署服务协议', sortOrder: 10 },
  { key: PaymentMilestoneKey.OFFER_DEPOSIT, title: 'Offer 后定金', amountFen: 9900, status: PaymentMilestoneStatus.PAID, triggerText: '获得 offer 后触发', sortOrder: 20 },
  { key: PaymentMilestoneKey.MONTH_2_BALANCE, title: '第 2 月尾款', amountFen: 19900, status: PaymentMilestoneStatus.PAYABLE, triggerText: '入职满第 2 个月后触发', sortOrder: 30 },
  { key: PaymentMilestoneKey.MONTH_3_BALANCE, title: '第 3 月尾款', amountFen: 19900, status: PaymentMilestoneStatus.LOCKED, triggerText: '入职满第 3 个月后触发', sortOrder: 40 },
  { key: PaymentMilestoneKey.REGULARIZATION_GIFT, title: '转正后职后服务', amountFen: 0, status: PaymentMilestoneStatus.LOCKED, triggerText: '转正后赠送，可选续费', sortOrder: 50 },
];

async function user(params: {
  tenantId: string;
  displayName: string;
  role: PlatformRole;
  phone?: string;
  email?: string;
  password?: string;
}) {
  const existing = await prisma.user.findFirst({
    where: {
      tenantId: params.tenantId,
      OR: [
        ...(params.phone ? [{ phone: params.phone }] : []),
        ...(params.email ? [{ email: params.email.toLowerCase() }] : []),
      ],
    },
  });
  const data = {
    displayName: params.displayName,
    role: params.role,
    phone: params.phone ?? null,
    email: params.email?.toLowerCase() ?? null,
    passwordHash: params.password ? await bcrypt.hash(params.password, 10) : null,
  };
  if (existing) {
    return prisma.user.update({ where: { id: existing.id }, data });
  }
  return prisma.user.create({ data: { tenantId: params.tenantId, ...data } });
}

async function job(params: {
  tenantId: string;
  enterpriseId: string;
  title: string;
  jdMarkdown: string;
}) {
  const existing = await prisma.jobPosting.findFirst({
    where: { tenantId: params.tenantId, enterpriseId: params.enterpriseId, title: params.title },
  });
  const data = {
    jdMarkdown: params.jdMarkdown,
    status: 'PUBLISHED',
    publishedAt: new Date(),
  };
  if (existing) {
    return prisma.jobPosting.update({ where: { id: existing.id }, data });
  }
  return prisma.jobPosting.create({
    data: {
      tenantId: params.tenantId,
      enterpriseId: params.enterpriseId,
      title: params.title,
      ...data,
    },
  });
}

async function main() {
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { slug: 'default' } });

  const admin = await user({
    tenantId: tenant.id,
    displayName: '系统管理员',
    role: PlatformRole.ADMIN,
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!',
  });
  const teacher = await user({
    tenantId: tenant.id,
    displayName: '林老师 · 就业运营',
    role: PlatformRole.TEACHER,
    email: 'teacher.demo@aihr.local',
    password: 'ChangeMe123!',
  });
  const seekerA = await user({
    tenantId: tenant.id,
    displayName: '陈一舟',
    role: PlatformRole.JOB_SEEKER,
    phone: '13600000001',
  });
  const seekerB = await user({
    tenantId: tenant.id,
    displayName: '周若宁',
    role: PlatformRole.JOB_SEEKER,
    phone: '13600000002',
  });
  const seekerC = await user({
    tenantId: tenant.id,
    displayName: '何明远',
    role: PlatformRole.JOB_SEEKER,
    phone: '13600000003',
  });

  await prisma.jobSeekerProfile.upsert({
    where: { userId: seekerA.id },
    create: {
      tenantId: tenant.id,
      userId: seekerA.id,
      headline: '3 年前端工程师，熟悉 Vue、小程序、Node 服务端协作',
      skillsText: 'Vue, TypeScript, 微信小程序, NestJS, PostgreSQL, UI 还原, 组件化',
      resumeMarkdown: '曾参与招聘平台与运营后台建设，负责小程序岗位详情、投递流程、管理端表格与权限页面。',
    },
    update: {
      headline: '3 年前端工程师，熟悉 Vue、小程序、Node 服务端协作',
      skillsText: 'Vue, TypeScript, 微信小程序, NestJS, PostgreSQL, UI 还原, 组件化',
      resumeMarkdown: '曾参与招聘平台与运营后台建设，负责小程序岗位详情、投递流程、管理端表格与权限页面。',
    },
  });
  await prisma.jobSeekerProfile.upsert({
    where: { userId: seekerB.id },
    create: {
      tenantId: tenant.id,
      userId: seekerB.id,
      headline: '就业服务顾问，擅长简历诊断、面试辅导与企业沟通',
      skillsText: '就业指导, 简历优化, 面试辅导, 企业对接, 候选人跟进',
      resumeMarkdown: '服务过 200+ 名转岗学员，熟悉培训机构到企业岗位的转化路径。',
    },
    update: {
      headline: '就业服务顾问，擅长简历诊断、面试辅导与企业沟通',
      skillsText: '就业指导, 简历优化, 面试辅导, 企业对接, 候选人跟进',
      resumeMarkdown: '服务过 200+ 名转岗学员，熟悉培训机构到企业岗位的转化路径。',
    },
  });

  const existingEnterprise = await prisma.enterprise.findFirst({
    where: { tenantId: tenant.id, name: '完整模拟企业 · 森禾科技' },
  });
  const enterprise =
    existingEnterprise ?
      await prisma.enterprise.update({
        where: { id: existingEnterprise.id },
        data: {
          contactEmail: 'hr@senhe.example',
          contactPhone: '13800001111',
        },
      })
    : await prisma.enterprise.create({
      data: {
        tenantId: tenant.id,
        name: '完整模拟企业 · 森禾科技',
        contactEmail: 'hr@senhe.example',
        contactPhone: '13800001111',
      },
    });

  await user({
    tenantId: tenant.id,
    displayName: '森禾科技 · HR 联系人',
    role: PlatformRole.ENTERPRISE_USER,
    email: 'enterprise.demo@aihr.local',
  });

  const frontendJob = await job({
    tenantId: tenant.id,
    enterpriseId: enterprise.id,
    title: '前端工程师 · 小程序与运营后台',
    jdMarkdown: '负责微信小程序、Vue 管理端、组件化工程与 NestJS API 协作。要求 TypeScript、Vue、小程序、PostgreSQL 基础。',
  });
  const consultantJob = await job({
    tenantId: tenant.id,
    enterpriseId: enterprise.id,
    title: '就业服务顾问 · 候选人跟进',
    jdMarkdown: '负责候选人简历诊断、面试辅导、企业对接和入职跟踪。要求沟通能力、就业服务经验、数据记录意识。',
  });

  const appA = await prisma.jobApplication.upsert({
    where: { jobPostingId_seekerUserId: { jobPostingId: frontendJob.id, seekerUserId: seekerA.id } },
    create: {
      tenantId: tenant.id,
      jobPostingId: frontendJob.id,
      seekerUserId: seekerA.id,
      status: JobApplicationStatus.INTERVIEW,
      pitch: '我做过小程序和 Vue 后台，能快速接手岗位要求。',
    },
    update: { status: JobApplicationStatus.INTERVIEW, pitch: '我做过小程序和 Vue 后台，能快速接手岗位要求。' },
  });
  await prisma.jobApplication.upsert({
    where: { jobPostingId_seekerUserId: { jobPostingId: frontendJob.id, seekerUserId: seekerC.id } },
    create: {
      tenantId: tenant.id,
      jobPostingId: frontendJob.id,
      seekerUserId: seekerC.id,
      status: JobApplicationStatus.REVIEWING,
      pitch: '有一点前端基础，希望获得转岗机会。',
    },
    update: { status: JobApplicationStatus.REVIEWING },
  });
  await prisma.jobApplication.upsert({
    where: { jobPostingId_seekerUserId: { jobPostingId: consultantJob.id, seekerUserId: seekerB.id } },
    create: {
      tenantId: tenant.id,
      jobPostingId: consultantJob.id,
      seekerUserId: seekerB.id,
      status: JobApplicationStatus.OFFER,
      pitch: '我熟悉就业服务 SOP 和候选人跟进节奏。',
    },
    update: { status: JobApplicationStatus.OFFER },
  });

  await prisma.interviewOpportunity.upsert({
    where: { jobPostingId_seekerUserId: { jobPostingId: frontendJob.id, seekerUserId: seekerA.id } },
    create: {
      tenantId: tenant.id,
      jobPostingId: frontendJob.id,
      seekerUserId: seekerA.id,
      pushedById: teacher.id,
      status: InterviewOpportunityStatus.PENDING,
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      note: '完整模拟：森禾科技邀请你参加前端工程师岗位技术面。',
    },
    update: {
      status: InterviewOpportunityStatus.PENDING,
      pushedById: teacher.id,
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      note: '完整模拟：森禾科技邀请你参加前端工程师岗位技术面。',
      respondedAt: null,
    },
  });

  const order = await prisma.order.upsert({
    where: { outTradeNo: 'DEMO_AIHR_0001' },
    create: {
      tenantId: tenant.id,
      payerUserId: seekerA.id,
      kind: OrderKind.SEEKER_SERVICE_FEE,
      amountFen: 9900,
      description: '完整模拟 · offer 后定金',
      status: OrderStatus.PAID,
      outTradeNo: 'DEMO_AIHR_0001',
      wechatTradeState: 'SUCCESS',
      wechatTransactionId: 'demo-wechat-tx-0001',
    },
    update: {
      status: OrderStatus.PAID,
      wechatTradeState: 'SUCCESS',
      wechatTransactionId: 'demo-wechat-tx-0001',
    },
  });

  const consentContent = '完整模拟：用户同意职AI通服务说明、个人信息处理规则和支付相关条款。';
  const existingConsent = await prisma.userConsent.findFirst({
    where: { tenantId: tenant.id, userId: seekerA.id, purpose: 'SERVICE_PAYMENT', version: 'demo-2026-04' },
  });
  if (!existingConsent) {
    await prisma.userConsent.create({
      data: {
        tenantId: tenant.id,
        userId: seekerA.id,
        purpose: 'SERVICE_PAYMENT',
        version: 'demo-2026-04',
        contentHash: hash(consentContent),
        metadata: { source: 'demo-seed', orderId: order.id },
      },
    });
  }

  const template = await prisma.complianceTemplate.findFirst({
    where: { tenantId: tenant.id, purpose: 'SERVICE_PAYMENT', enabled: true },
  });
  const contract = await prisma.contractAgreement.findFirst({
    where: { tenantId: tenant.id, userId: seekerA.id, title: '完整模拟 · 求职服务协议' },
  });
  const signedContract = contract ?
    await prisma.contractAgreement.update({
      where: { id: contract.id },
      data: {
        status: ContractStatus.SIGNED,
        orderId: order.id,
        jobApplicationId: appA.id,
        signatureProvider: 'tencent-signature-stub',
        signatureStatus: 'SIGNED',
        signatureRef: `demo-sign-${contract.id}`,
        signedAt: new Date(),
      },
    })
  : await prisma.contractAgreement.create({
      data: {
        tenantId: tenant.id,
        userId: seekerA.id,
        enterpriseId: enterprise.id,
        orderId: order.id,
        jobApplicationId: appA.id,
        templateId: template?.id ?? null,
        title: '完整模拟 · 求职服务协议',
        contentHash: template?.contentHash ?? hash(consentContent),
        status: ContractStatus.SIGNED,
        signatureProvider: 'tencent-signature-stub',
        signatureStatus: 'SIGNED',
        signatureRef: 'demo-sign-contract',
        signedAt: new Date(),
      },
    });

  const servicePlan = await prisma.seekerServicePlan.upsert({
    where: { tenantId_seekerUserId: { tenantId: tenant.id, seekerUserId: seekerA.id } },
    create: {
      tenantId: tenant.id,
      seekerUserId: seekerA.id,
      targetRole: '前端工程师 · 小程序与运营后台',
      salaryMinFen: 1800000,
      salaryMaxFen: 2500000,
      signedContractId: signedContract.id,
      summary: '完整模拟：求职者已完成职前规划与简历优化，正在面试辅导和企业面试确认阶段。',
    },
    update: {
      targetRole: '前端工程师 · 小程序与运营后台',
      salaryMinFen: 1800000,
      salaryMaxFen: 2500000,
      signedContractId: signedContract.id,
      summary: '完整模拟：求职者已完成职前规划与简历优化，正在面试辅导和企业面试确认阶段。',
    },
  });

  for (const step of demoSteps) {
    await prisma.seekerServiceStep.upsert({
      where: { planId_key: { planId: servicePlan.id, key: step.key } },
      create: { planId: servicePlan.id, ...step },
      update: {
        title: step.title,
        valueProposition: step.valueProposition,
        providerType: step.providerType,
        status: step.status,
        sortOrder: step.sortOrder,
        checklist: step.checklist,
        deliverableSummary: step.deliverableSummary,
        partnerOrgName: step.partnerOrgName ?? null,
      },
    });
  }

  for (const milestone of demoMilestones) {
    await prisma.servicePaymentMilestone.upsert({
      where: { planId_key: { planId: servicePlan.id, key: milestone.key } },
      create: {
        planId: servicePlan.id,
        ...milestone,
        orderId: milestone.key === PaymentMilestoneKey.OFFER_DEPOSIT ? order.id : null,
      },
      update: {
        title: milestone.title,
        amountFen: milestone.amountFen,
        status: milestone.status,
        triggerText: milestone.triggerText,
        sortOrder: milestone.sortOrder,
        orderId: milestone.key === PaymentMilestoneKey.OFFER_DEPOSIT ? order.id : null,
      },
    });
  }

  const refund = await prisma.refundRequest.findFirst({
    where: { tenantId: tenant.id, orderId: order.id, requestedById: seekerA.id },
  });
  if (refund) {
    await prisma.refundRequest.update({
      where: { id: refund.id },
      data: { status: RefundRequestStatus.APPROVED, reviewNote: '完整模拟：同意部分退款，等待打款。' },
    });
  } else {
    await prisma.refundRequest.create({
      data: {
        tenantId: tenant.id,
        orderId: order.id,
        requestedById: seekerA.id,
        amountFen: 990,
        reason: '完整模拟：服务节点调整，申请部分退款',
        status: RefundRequestStatus.APPROVED,
        reviewNote: '完整模拟：同意部分退款，等待打款。',
        reviewedById: admin.id,
      },
    });
  }

  const partnerUser = await user({
    tenantId: tenant.id,
    displayName: '南山职业训练营',
    role: PlatformRole.PARTNER,
    email: 'partner.demo@aihr.local',
  });
  const partnerApp = await prisma.partnerApplication.findFirst({
    where: { tenantId: tenant.id, orgName: '南山职业训练营' },
  });
  if (partnerApp) {
    await prisma.partnerApplication.update({
      where: { id: partnerApp.id },
      data: { status: PartnerApplicationStatus.APPROVED, reviewedById: admin.id, reviewNote: '课程资质完整，允许进入联合服务包。' },
    });
  } else {
    await prisma.partnerApplication.create({
      data: {
        tenantId: tenant.id,
        submittedById: partnerUser.id,
        orgName: '南山职业训练营',
        contactName: '顾问王老师',
        contactEmail: 'partner.demo@aihr.local',
        contactPhone: '13900002222',
        category: '培训机构',
        qualification: '具备职业技能培训资质，提供前端与数据分析课程。',
        courseSummary: '联合包：8 周项目实训 + 就业推荐 + 面试辅导。',
        status: PartnerApplicationStatus.APPROVED,
        reviewedById: admin.id,
        reviewNote: '课程资质完整，允许进入联合服务包。',
      },
    });
  }

  const confirmation = await prisma.enterpriseConfirmation.findFirst({
    where: {
      tenantId: tenant.id,
      enterpriseId: enterprise.id,
      jobPostingId: frontendJob.id,
      type: EnterpriseConfirmationType.INTERVIEW,
    },
  });
  if (!confirmation) {
    await prisma.enterpriseConfirmation.create({
      data: {
        tenantId: tenant.id,
        enterpriseId: enterprise.id,
        type: EnterpriseConfirmationType.INTERVIEW,
        jobPostingId: frontendJob.id,
        note: '完整模拟：企业确认陈一舟进入技术面。',
        evidenceRef: 'demo://interview-confirmation',
        performedById: teacher.id,
      },
    });
  }

  const notifications = [
    { userId: seekerA.id, title: '面试安排已更新', body: '森禾科技前端工程师岗位已进入面试阶段。', category: 'JOB_APPLICATION' },
    { userId: seekerA.id, title: '服务协议已签署', body: '完整模拟 · 求职服务协议已完成签署占位。', category: 'CONTRACT' },
    { userId: partnerUser.id, title: '伙伴入驻已通过', body: '南山职业训练营已通过平台审核。', category: 'PARTNER_APPLICATION' },
  ];
  for (const n of notifications) {
    const exists = await prisma.userNotification.findFirst({
      where: { tenantId: tenant.id, userId: n.userId, title: n.title },
    });
    if (!exists) {
      await prisma.userNotification.create({ data: { tenantId: tenant.id, ...n, metadata: { source: 'demo-seed' } } });
    }
  }

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      performedById: admin.id,
      onBehalfOfType: 'TENANT',
      onBehalfOfId: tenant.id,
      action: 'DEMO_SCENARIO_SEED',
      metadata: {
        enterpriseId: enterprise.id,
        jobs: [frontendJob.id, consultantJob.id],
        seekers: [seekerA.id, seekerB.id, seekerC.id],
        orderId: order.id,
      },
    },
  });

  console.log('完整模拟数据已写入：企业、岗位、候选人、投递、订单、合同、退款、伙伴、通知、审计。');
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
