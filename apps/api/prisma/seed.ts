import { OrderKind, PrismaClient, PlatformRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    create: {
      slug: 'default',
      name: '职AI通',
      primaryColor: '#243F34',
      accentColor: '#B87932',
      welcomeText: '从岗位匹配、协议签署到服务付费的一站式就业服务工作流',
      wxMiniAppId: process.env.WECHAT_MINI_APP_ID ?? null,
    },
    update: {
      name: '职AI通',
      primaryColor: '#243F34',
      accentColor: '#B87932',
      welcomeText: '从岗位匹配、协议签署到服务付费的一站式就业服务工作流',
      wxMiniAppId: process.env.WECHAT_MINI_APP_ID ?? undefined,
    },
  });

  const adminEmail =
    process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const hash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: adminEmail.toLowerCase() },
    },
    create: {
      tenantId: tenant.id,
      email: adminEmail.toLowerCase(),
      displayName: '系统管理员',
      role: PlatformRole.ADMIN,
      passwordHash: hash,
    },
    update: {
      passwordHash: hash,
      role: PlatformRole.ADMIN,
    },
  });

  const demoName = '示例企业（可删）';
  const exists = await prisma.enterprise.findFirst({
    where: { tenantId: tenant.id, name: demoName },
  });
  if (!exists) {
    await prisma.enterprise.create({
      data: {
        tenantId: tenant.id,
        name: demoName,
        contactEmail: 'hr@example.com',
      },
    });
  }

  await prisma.aiPromptTemplate.upsert({
    where: { tenantId_key: { tenantId: tenant.id, key: 'default_system' } },
    create: {
      tenantId: tenant.id,
      key: 'default_system',
      title: '系统提示',
      body: '你以「职AI通」就业服务口吻提供建议。回答须专业、合规、简洁，不编造候选人隐私；面向求职者时不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。',
    },
    update: {
      title: '系统提示',
      body: '你以「职AI通」就业服务口吻提供建议。回答须专业、合规、简洁，不编造候选人隐私；面向求职者时不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。',
    },
  });

  const serviceStepPrompts = [
    {
      key: 'service_step_PRE_CAREER_PLANNING',
      title: '服务环节：职前规划（求职流程-建档与方向）',
      body: `你服务于「职前规划」环节，对应典型求职流程中的：个人信息沉淀 → 职业兴趣/测评 → 服务沟通 → 方向与薪资初确认（工程侧已用档案与计划目标增强上下文）。

【对外表达】面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。

【输出结构】请严格按以下小节输出（可适度精简，但顺序保留）：
1) 信息核对摘要：用要点列出用户已提供的关键教育/工作/项目经历与待补充项，勿编造不存在的机构或成绩。
2) 职业竞争力三栏：优势（与目标岗位可验证）｜可改进点（可行动）｜与目标岗位的匹配度（高/中/低 + 一句理由）。
3) 方向建议：在求职者意向基础上给出「建议深耕的行业/岗位类型」与「可并行关注的备选方向」，并各附一句行业/岗位前景说明；若信息不足，明确写出需要补充的测评或材料。
4) 与求职流程衔接：说明「下一步」应落在简历优化/测评补全/服务沟通中的哪几项，用编号列表 2～4 条行动项，避免空话。

【语气】专业、可落地、不承诺内推或包 offer；遇敏感薪酬仅给区间讨论框架，不替用户确定数字。`,
    },
    {
      key: 'service_step_RESUME_OPTIMIZATION',
      title: '服务环节：简历优化（求职流程-材料准备）',
      body: `你服务于「简历优化」环节，对应求职流程中：在方向确定后，将经历翻译为可投递的简历材料（与业务侧：原始稿诊断 → 用户确认建议 → 复核 → 定稿 对齐）。

【对外表达】面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。

【输出结构】
1) 与目标岗位 JD 的匹配度一句话结论。
2) 问题诊断分三条以内：每条约「问题点 + 对投递的影响 + 可执行的改法」。
3) 关键词/经历改写建议：从上下文中的技能、项目摘要抽取，给出「可替换进简历的表述示例」（STAR 中突出 Result，避免假数据）。
4) 多轮沟通提示：列 1～2 个建议用户继续与平台对齐的问题（如项目口径、空档期说明）。

【约束】不虚构公司名、职级、数据；如简历文本缺失，明确提示先补充「经历模块」。`,
    },
    {
      key: 'service_step_INTERVIEW_COACHING',
      title: '服务环节：面试辅导（求职流程-面试准备 + 腾讯会议模拟面试）',
      body: `你服务于「面试辅导」环节。求职流程中本阶段含：学习题库/方法论 → 预约并在腾讯会议中完成「模拟面试」（音视频通信由腾讯会议承担；会中引导、记录与复盘说明通过会议侧能力承载，工程侧以会议号与会中说明为上下文，不输出实时信令细节）。

【对外表达】面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。

【输出结构】
1) 针对目标岗位分两类准备：业务/专业面（2～3 个主问题 + 回答骨架）+ 行为面/HR 面（1～2 个主问题 + 要点）。
2) 表达与非语言：语速、条理性、眼神/体态的简短可训练清单各 1～2 条（面向视频面试）。
3) 与「腾讯会议模拟面试」衔接：若上下文中出现会议预约/会议号/会中说明，请明确写一句「与本轮模拟相关的练习重点」；若无会议记录，则提示先完成平台预约与入会。
4) 复盘模板：用 5 行内给出用户可在模拟后自评的维度（内容相关性/结构/表达/非语言/改进一句）。

【约束】不提供违法规避背调的建议；不承诺必过。`,
    },
    {
      key: 'service_step_INTERVIEW_CONFIRMATION',
      title: '服务环节：面试确认（求职流程-企业面试机会与决策）',
      body: `你服务于「面试确认」环节，对应求职流程中：平台导入岗位面试机会 → 推送给求职者 → 求职者需决策是否参加（与 InterviewOpportunity 数据对应）。

【对外表达】面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师，统一使用“平台”“服务团队”“服务建议”等中性表达。

【输出结构】
1) 用两条以内概括「参加」与「暂不参加」各自适合的典型情形（不替用户做唯一结论）。
2) 决策前检查清单：时间冲突、企业背景核实、与职业规划一致性、需向平台/企业澄清的问题，各至少 1 条。
3) 沟通与礼仪：在小程序内点「参加/拒绝」之外，如需要补一句给企业或平台的礼貌话术，各给 1 条可直接改编的短模板（中性、专业）。
4) 风险与心理：如岗位与预期偏差较大，如何向平台请求二次辅导或调整机会（1 段内）。

【数据】若上下文中已给出待处理/已参加/已拒绝的条数，在开头用一句话点明，以辅助用户理解当前任务队列。`,
    },
    {
      key: 'service_step_POST_OFFER_COACHING',
      title: '服务环节：职后辅导',
      body: '请以职AI通就业服务口吻，围绕新员工角色适应、岗位职责理解、同事沟通、绩效达成和心态管理，给出试用期 2 周行动建议和遇到问题时的处理方式。面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师。',
    },
    {
      key: 'service_step_POST_CONVERSION_PLANNING',
      title: '服务环节：职后规划',
      body: '请以职AI通就业服务口吻，基于候选人的岗位方向，给出转正后的成长计划：技能提升、证书/课程、社交沟通、晋升机会和下一阶段岗位机会关注点。面向求职者时，不说明建议来自 AI、模型、机器人、真人专家或老师。',
    },
  ];
  for (const p of serviceStepPrompts) {
    await prisma.aiPromptTemplate.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key: p.key } },
      create: { tenantId: tenant.id, key: p.key, title: p.title, body: p.body },
      update: { title: p.title, body: p.body },
    });
  }

  const stubRoute = await prisma.aiLlmRoute.findFirst({
    where: { tenantId: tenant.id, scenario: 'default', provider: 'stub' },
  });
  if (!stubRoute) {
    await prisma.aiLlmRoute.create({
      data: {
        tenantId: tenant.id,
        scenario: 'default',
        provider: 'stub',
        modelName: 'stub-local',
        weight: 100,
        enabled: true,
      },
    });
  }

  const serviceStepRoute = await prisma.aiLlmRoute.findFirst({
    where: { tenantId: tenant.id, scenario: 'service_step', provider: 'stub' },
  });
  if (!serviceStepRoute) {
    await prisma.aiLlmRoute.create({
      data: {
        tenantId: tenant.id,
        scenario: 'service_step',
        provider: 'stub',
        modelName: 'stub-service-step',
        weight: 100,
        enabled: true,
      },
    });
  }

  await prisma.serviceProduct.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'seeker-offer-deposit' } },
    create: {
      tenantId: tenant.id,
      code: 'seeker-offer-deposit',
      name: '求职服务 · offer 后定金',
      audience: 'JOB_SEEKER',
      orderKind: OrderKind.SEEKER_SERVICE_FEE,
      amountFen: 99,
      description: 'MVP 联调价格；正式金额由运营在管理端配置。',
      sortOrder: 10,
      enabled: true,
    },
    update: {
      name: '求职服务 · offer 后定金',
      audience: 'JOB_SEEKER',
      orderKind: OrderKind.SEEKER_SERVICE_FEE,
      amountFen: 99,
      description: 'MVP 联调价格；正式金额由运营在管理端配置。',
      sortOrder: 10,
      enabled: true,
    },
  });

  await prisma.serviceProduct.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'enterprise-subscription-basic' } },
    create: {
      tenantId: tenant.id,
      code: 'enterprise-subscription-basic',
      name: '企业年费订阅 · 基础档',
      audience: 'ENTERPRISE',
      orderKind: OrderKind.ENTERPRISE_SUBSCRIPTION,
      amountFen: 19900,
      description: '企业岗位代发与候选人服务基础订阅。',
      sortOrder: 20,
      enabled: true,
    },
    update: {
      name: '企业年费订阅 · 基础档',
      audience: 'ENTERPRISE',
      orderKind: OrderKind.ENTERPRISE_SUBSCRIPTION,
      amountFen: 19900,
      description: '企业岗位代发与候选人服务基础订阅。',
      sortOrder: 20,
      enabled: true,
    },
  });

  const defaultConsentContent =
    '我已阅读并同意职AI通服务说明、个人信息处理规则与支付相关条款，知晓当前为服务付费节点。';
  await prisma.complianceTemplate.upsert({
    where: {
      tenantId_purpose_version: {
        tenantId: tenant.id,
        purpose: 'SERVICE_PAYMENT',
        version: 'mvp-2026-04',
      },
    },
    create: {
      tenantId: tenant.id,
      purpose: 'SERVICE_PAYMENT',
      version: 'mvp-2026-04',
      title: '服务付费与个人信息处理同意',
      content: defaultConsentContent,
      contentHash: crypto.createHash('sha256').update(defaultConsentContent).digest('hex'),
      enabled: true,
    },
    update: {
      title: '服务付费与个人信息处理同意',
      content: defaultConsentContent,
      contentHash: crypto.createHash('sha256').update(defaultConsentContent).digest('hex'),
      enabled: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
