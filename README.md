<<<<<<< HEAD
# 职AI通（AIHR）— AI 赋能就业服务平台

本仓库承载 **职AI通** 产品工程：**原生微信小程序**（主入口）、**Vue 3 + Vite 管理端**（运营 / 就业老师 / 管理员）、**NestJS + Prisma API**（腾讯系能力绑定位 + 多 LLM 路由占位）。PRD 见 `docs/PRD-SUMMARY.md` 与 `PRD/`。

## 仓库结构

```
AIHR/
├── apps/
│   ├── miniprogram/      # 原生微信小程序
│   ├── miniprogram-sim/  # 本地 H5 小程序模拟器（角色切换 + 手机框）
│   ├── admin-web/        # Web 管理端（品牌色 + AI 面板占位）
│   └── api/              # NestJS API、Prisma、Dockerfile
├── docker-compose.yml    # Postgres + Redis + API（统一 bridge 网络）
├── docs/                 # 架构与部署
└── PRD/
```

**本地全量构建**（含 API、管理端、小程序模拟器 H5）：

```bash
npm run build:api    # 或
npm run build:admin
npm run build:sim
npm run build        # 依次执行以上三项
```

## 技术选型（已定稿）


| 层级  | 选型                                             |
| --- | ---------------------------------------------- |
| 小程序 | 原生（`wx.login` + `wx.request`）                  |
| 管理端 | Vue 3 + Vite + Vue Router                      |
| 后端  | Node 20 + NestJS 10 + Prisma 5 + PostgreSQL 16 |
| 支付  | 微信支付平台单一商户（`WechatPayService` 占位，类目：人才服务）      |
| 电子签 | 预留腾讯系/云厂商接口（`TencentSignatureService` 占位）      |
| LLM | 多厂商路由占位（`LlmRouterService`），可接混元与海外 API        |


## 本地开发

### 本地前端排障（连接被拒绝、API 404）

| 问题 | 原因 | 处理 |
|------|------|------|
| `127.0.0.1:15174` / `:15175` 拒绝连接 | 未启动对应进程：`docker compose` 会起 **admin-web** / **miniprogram-sim**（Nginx 静态页 + 反代 `/v1`）；若只用本机 Vite 调试则需分别 **`npm run dev:admin`**、`**npm run dev:sim**` | 在项目根执行 **`docker compose up -d`**（或 `**npm run docker:up**`），或按需单独起 Vite |
| 访问 `3300` 出现 `Cannot GET /v1/%E2%80%A6` | 地址里被带上了**省略号字符** `…`（不是合法路径） | 改用**完整路径**，例如 **`http://127.0.0.1:3300/v1/health`**，不要从文档里复制带「…」的占位 URL |
| 管理端/模拟器能开但接口失败 | API 未启动或代理端口不对 | `docker compose ps` 看 **api**；代理默认 **`http://127.0.0.1:3300`**，可用 **`VITE_API_PROXY_TARGET`** 改 |

**推荐一次起全栈**：`docker compose up -d --build`（或根目录 `**npm run docker:up**`）即包含 **API + Postgres + Redis + 管理端 + 小程序模拟器**；仅改前端热更新时再另开终端跑 `npm run dev:admin` / `**npm run dev:sim**`。

### 1. 依赖服务（Docker）

```bash
cp .env.example .env
docker compose up -d postgres redis
```

- PostgreSQL 默认映射宿主端口 **25432**，容器/volume/network 使用 `aihr-app-`* 命名，与其他项目隔离。
- Redis 默认映射 **26379**。

本地跑 API 时，在 `apps/api/.env` 或根目录 `.env` 中设置：

```bash
DATABASE_URL=postgresql://aihr_app:aihr_local_change_me@127.0.0.1:25432/aihr_app?schema=public
JWT_SECRET=你的随机串
WECHAT_MINI_APP_ID=你的小程序 AppID
WECHAT_MINI_APP_SECRET=你的 AppSecret
```

```bash
cd apps/api && npm install && npx prisma migrate deploy && npm run prisma:seed && npm run start:dev
```

种子管理员（可改 `.env` 中 `SEED_*` 后重新 seed）：

- 邮箱：`admin@example.com`
- 密码：`ChangeMe123!`

### 2. 管理端

```bash
cd apps/admin-web && npm install && npm run dev
```

管理端默认访问 `http://localhost:15174`；开发期通过 Vite 代理访问 `http://localhost:3300` 的 `/v1`（见 `apps/admin-web/vite.config.ts`，可用 `VITE_API_PROXY_TARGET` / `VITE_ADMIN_WEB_PORT` 覆盖）。

**Web 管理端能登录谁？** 后端接口 `POST /v1/auth/admin/login` **仅接受** 平台角色为 **管理员 (ADMIN)** 或 **就业老师 (TEACHER)** 的账号（邮箱 + 密码）。同一套登录页，不做「多角色切换」：

- **管理员**：种子数据默认 `admin@example.com` / `ChangeMe123!`（见上 `SEED_*`）。
- **老师**：执行 `npm run prisma:demo --prefix apps/api` 后，可用 `**teacher.demo@aihr.local`** / `**ChangeMe123!**` 登录管理端（与 demo 数据一起写入）；老师与管理员在部分接口上权限可能不同（如仅限 `ADMIN` 的租户设置）。

**求职者、伙伴机构、企业联系人** 没有管理端 Web 登录；他们走 **微信小程序**（`wx.login` → `/auth/wechat/mini`）或 **本地小程序模拟器**（`/auth/dev/login`）。

### 3. 微信小程序

用微信开发者工具打开 `apps/miniprogram`，修改 `project.config.json` 的 `appid` 与 `app.js` 中的 `globalData.apiBase`（HTTPS + 已在公众平台配置的合法域名）。页面能力：首页登录与健康检查、在招岗位列表、岗位详情（投递 + 登录后匹配参考）、**我的档案**、**我的投递**、**消息通知**、**服务与付费**、**我的协议**、**订单与退款**、**伙伴入驻**。

### 4. 本地小程序模拟器（推荐试用）

不依赖真实微信登录，使用 `POST /v1/auth/dev/login` 在本地模拟不同移动端角色。先启动 Docker API 并写入完整模拟数据：

```bash
docker compose up -d --build
cd apps/api && set -a && . ../../.env && set +a && npm run prisma:demo
```

根目录也可：

```bash
npm install --prefix apps/miniprogram-sim
npm run dev:sim
```

启动模拟器：

```bash
cd apps/miniprogram-sim
npm install
npm run dev
```

确保根目录 `.env` 中 `**LOCAL_SIMULATOR_ENABLED=true**`（与 `apps/api` 共用），且 API 已按上文启动；模拟器通过 Vite 将 `/v1` 代理到 `**http://127.0.0.1:3300**`（可用环境变量 `**VITE_API_PROXY_TARGET**` 覆盖）。

若使用 `docker compose`，直接在浏览器打开 **`http://127.0.0.1:15175/`**（与 `.env` 中 `MINIPROGRAM_SIM_PORT` 一致）。若仅跑本机 **`npm run dev:sim`**，则以终端打印的 http 地址为准（端口占满时 Vite 可能自动换端口）。点击 **本地模拟登录** 即调用 `POST /v1/auth/dev/login`（**勿**在请求头带旧 JWT；若见「未找到该角色的模拟用户」请先 `npm run prisma:demo`）。可切换：

**若页面无法打开或空白**

- 使用 **Docker** 时：先 `**docker compose up -d**`，再打开 `**http://127.0.0.1:15175/**`（需 **api** 为 healthy）。
- 使用本机 **Vite** 时：必须在 `apps/miniprogram-sim` 下执行 `**npm run dev`**（或根目录 `**npm run dev:sim**`），用 **http://** 打开；**不要**用资源管理器双击 `index.html`（`file://` 无法加载 Vite 的 ESM，会空白）。
- 构建后的 `dist/` 也不能直接双击 `index.html`，应执行 `**npm run preview --prefix apps/miniprogram-sim`**（或 `cd apps/miniprogram-sim && npm run preview`）。
- 从 **WSL / 容器** 访问时，请用终端里 **Network** 一段的 IP，并保证本机防火墙放行该端口。
- 代理 API 默认指向 `**http://127.0.0.1:3300`**（可用 `VITE_API_PROXY_TARGET` 覆盖）；API 未启动时页面能开，但登录会失败。
- 求职者：`陈一舟`（岗位、投递、档案、协议、订单、退款、通知）
- 伙伴机构：`南山职业训练营`（入驻申请、审核状态、通知）
- 企业联系人：`森禾科技 · HR 联系人`（企业侧移动入口占位与岗位可见性）

## 一键 Docker（含 API）

```bash
docker compose up -d --build
```

- **API**：`http://127.0.0.1:3300/v1/health`（端口由 `.env` 中 `API_PORT` 控制）
- **管理端（生产构建 + Nginx）**：`http://127.0.0.1:15174`（`ADMIN_WEB_PORT`）
- **小程序 H5 模拟器**：`http://127.0.0.1:15175`（`MINIPROGRAM_SIM_PORT`）

上述两个前端容器会将浏览器同源的 **`/v1/*`** 反代到 **api** 服务，无需再配 `VITE_API_PROXY_TARGET`。

首次建库后建议注入种子数据：

```bash
docker exec aihr-app-api npx prisma db seed
```

完整端到端模拟数据（企业、岗位、候选人、投递、订单、合同、退款、伙伴、通知、审计）：

```bash
cd apps/api
set -a && . ../../.env && set +a
npm run prisma:demo
```

## 主要 API（前缀 `/v1`）

**请求体**：默认约 **2MB**（`BODY_SIZE_LIMIT` 或 `BODY_SIZE_LIMIT_BYTES`）。**HTTP 读超时** 仅当设置 `HTTP_SERVER_TIMEOUT_MS` 时套用到 Node 服务器。API 响应默认带 `**Cache-Control: no-store`** 等安全头。

**限流**：除 `/health` 外按 IP 限频（默认约 400 次/分钟，可改 `ThrottlerModule` 配置）；`/auth/*` 登录类接口单独更严；超额返回 **429**（体与客户端提示为「过于频繁…」）。置于 Nginx/Ingress 之后请设置环境变量 `**TRUST_PROXY=1`（或代理层数）**，否则限流会按到 Node 的地址而非真实客户端；直连公网勿误开。**多副本 / 多 Pod** 时设置 `**THROTTLER_REDIS_URL`**（或兼容的 `**REDIS_URL**`）指向同一 Redis，使限流状态跨实例共享；未设置时仅进程内计数。**Docker Compose** 中 API 服务默认 `THROTTLER_REDIS_URL=redis://redis:6379`；需纯进程内限流时在本机环境变量中显式置空覆盖。

**模拟面试**：管理端可在「服务计划」详情中创建在线模拟面试会话，配置面试角色、追问要求、评估重点、腾讯会议 / TRTC / 混合通信方式、VR 场景标识与防代答规则。求职者端仅展示平台安排、场景说明和独立作答要求，不强调 AI、模型或真人来源，也不提供实时答案提示。真实 TRTC 接入需实现 `TRTC_API_ENABLED=true` 下的 UserSig 签发、房间生命周期与客户端 SDK 初始化；未开启时返回可联调占位配置。


| 方法             | 路径                                                                                                                   | 说明                                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET            | `/health`                                                                                                            | 就绪探针：返回 `checks.database`、有 Redis 时 `checks.redis`（`up` / `skipped`）、`requestId`；**数据库** 或（已配置时）**限流 Redis** 不可连为 **503**。响应头含 `x-request-id`（可与网关/客户端透传） |
| POST           | `/auth/wechat/mini`                                                                                                  | 小程序 `code` 换 JWT                                                                                                                                          |
| POST           | `/auth/dev/login`                                                                                                    | 本地小程序模拟器角色登录（仅 `LOCAL_SIMULATOR_ENABLED=true`）                                                                                                            |
| POST           | `/auth/admin/login`                                                                                                  | 管理端邮箱密码登录                                                                                                                                                 |
| GET/POST/PATCH | `/users`、`/users/:userId`                                                                                            | 用户列表、创建与角色/资料维护（管理员）                                                                                                                                      |
| GET/PATCH      | `/users/:userId/profile`                                                                                             | 管理端代维护求职者档案（管理员/就业老师）                                                                                                                                     |
| GET/PATCH/POST | `/service-plans`、`/service-plans/me`、`POST /service-plans/me/ensure`（求职者自助初始化）、`/service-plans/users/:userId/ensure` | 求职者 6 步服务计划、服务环节和付款节点                                                                                                                                     |
| POST           | `/service-plans/:planId/steps/:stepId/request`                                                                       | 求职者/老师点击 6 步环节获取 AI 服务建议并留痕                                                                                                                               |
| POST           | `/service-plans/:planId/steps/:stepId/confirm`                                                                       | 求职者/老师确认环节交付成果并推进下一步                                                                                                                                      |
| PATCH          | `/service-plans/:planId/steps/:stepId/interactions/:interactionId/feedback`                                          | 对某次服务输出提交评分与反馈，用于优化提示词和服务效果                                                                                                                               |
| GET            | `/enterprises`                                                                                                       | 企业列表（管理员/就业老师）                                                                                                                                            |
| POST/PATCH     | `/enterprises`、`/enterprises/:enterpriseId`                                                                          | 企业创建与资料维护（管理员/就业老师）                                                                                                                                       |
| POST           | `/enterprises/confirmations`                                                                                         | 企业面试/入职确认（代点留痕）                                                                                                                                           |
| GET            | `/jobs`                                                                                                              | 岗位列表，查询参数 `status`、`enterpriseId`                                                                                                                         |
| GET            | `/jobs/:id`                                                                                                          | 岗位详情                                                                                                                                                      |
| POST           | `/jobs`                                                                                                              | 创建草稿（代发布）                                                                                                                                                 |
| PATCH          | `/jobs/:id`                                                                                                          | 编辑草稿                                                                                                                                                      |
| POST           | `/jobs/:id/publish`                                                                                                  | 发布岗位                                                                                                                                                      |
| POST           | `/payments/wechat/jsapi`                                                                                             | 小程序预下单（支持服务产品与服务计划付款节点；本地模拟器走 stub 支付）                                                                                                                    |
| POST           | `/payments/wechat/notify`                                                                                            | 微信支付异步通知（公网 URL，无 JWT）                                                                                                                                    |
| GET            | `/orders`                                                                                                            | 订单列表（管理员/就业老师）                                                                                                                                            |
| GET            | `/dashboard/summary`                                                                                                 | 管理端运营总览指标                                                                                                                                                 |
| GET/PATCH      | `/tenant/current`                                                                                                    | 当前租户白标配置读取与更新                                                                                                                                             |
| GET            | `/audit-logs`                                                                                                        | 审计日志列表（可按 `action` 过滤）                                                                                                                                    |
| GET            | `/orders/me`                                                                                                         | 我的订单                                                                                                                                                      |
| POST           | `/orders/:orderId/refund-requests`                                                                                   | 创建退款申请                                                                                                                                                    |
| GET/PATCH      | `/orders/refund-requests`、`/orders/refund-requests/:id/review`                                                       | 退款申请列表与审核                                                                                                                                                 |
| POST           | `/auth/sms/send`                                                                                                     | 发送短信验证码（公开；60s 频控）                                                                                                                                        |
| POST           | `/auth/sms/verify`                                                                                                   | 校验验证码                                                                                                                                                     |
| POST           | `/enterprises/:enterpriseId/contact-sms/send`                                                                        | 向企业联系人手机发码（管理员/就业老师 + JWT）                                                                                                                                |
| GET            | `/jobs/published`                                                                                                    | 已发布岗位列表（任意登录用户）                                                                                                                                           |
| GET            | `/jobs/:id/public`                                                                                                   | 已发布岗位详情（求职者）                                                                                                                                              |
| POST           | `/jobs/:id/applications`                                                                                             | 求职者投递（`JOB_SEEKER`）                                                                                                                                       |
| GET            | `/jobs/:id/applications`                                                                                             | 岗位投递列表（管理员/就业老师）                                                                                                                                          |
| PATCH          | `/jobs/applications/:applicationId/status`                                                                           | 投递状态流转（管理员/就业老师）                                                                                                                                          |
| GET            | `/me/applications`                                                                                                   | 我的投递记录                                                                                                                                                    |
| GET            | `/me/profile`                                                                                                        | 求职者档案（无则返回 `null`）                                                                                                                                        |
| PUT            | `/me/profile`                                                                                                        | 创建或更新求职者档案                                                                                                                                                |
| GET/POST       | `/me/mock-interview/sessions`                                                                                        | 求职者模拟面试会话：支持腾讯会议、TRTC、VR 场景配置；候选人端仅展示平台安排与独立作答规则                                                                                                             |
| GET/POST       | `/mock-interviews/users/:userId/sessions`                                                                            | 管理端为求职者查看/创建模拟面试会话，可配置面试角色、追问要求、评估重点、TRTC/VR 场景与防代答规则                                                                                                           |
| GET            | `/jobs/:id/match-preview`                                                                                            | 求职者：JD 与档案关键词 Jaccard 粗匹配分                                                                                                                                |
| GET            | `/jobs/:id/matches`                                                                                                  | 岗位候选人匹配排序（管理员/就业老师）                                                                                                                                       |
| GET            | `/jobs/enterprise/:enterpriseId/matches`                                                                             | 企业下全部候选人匹配排序（管理员/就业老师）                                                                                                                                    |
| GET            | `/enterprises/:enterpriseId/job-applications`                                                                        | 企业下全部岗位投递（管理员/就业老师）                                                                                                                                       |
| GET/POST/PATCH | `/interview-opportunities`、`/interview-opportunities/me`、`/interview-opportunities/:id/respond`                      | 面试机会推送、求职者确认参加/拒绝                                                                                                                                         |
| GET/POST       | `/ai/prompts`                                                                                                        | 提示词列表 / upsert（管理员/就业老师）                                                                                                                                  |
| GET/POST/PATCH | `/ai/routes`、`/ai/routes/:id`                                                                                        | 模型路由列表、创建、局部更新                                                                                                                                            |
| POST           | `/ai/invoke-test`                                                                                                    | 走 `LlmRouterService` 的占位连通性测试                                                                                                                             |
| GET/POST       | `/ai/service-step-insights`、`/ai/service-step-prompts/:key/improve`                                                  | 6 步服务提示词反馈洞察与优化建议                                                                                                                                         |
| GET/POST       | `/service-products`                                                                                                  | 服务产品/定价列表与 upsert                                                                                                                                         |
| POST           | `/consents`                                                                                                          | 用户同意留痕（内容 SHA-256 存证）                                                                                                                                     |
| GET            | `/consents/me`                                                                                                       | 我的同意记录                                                                                                                                                    |
| GET/POST       | `/compliance/templates`                                                                                              | 合规模板列表与 upsert                                                                                                                                            |
| GET/POST       | `/contracts`                                                                                                         | 合同列表与创建                                                                                                                                                   |
| GET/POST       | `/contracts/me`、`/contracts/:id/sign-stub`                                                                           | 我的合同与签署占位                                                                                                                                                 |
| GET/POST/PATCH | `/partner-applications`、`/partner-applications/me`、`/partner-applications/:id/review`                                | 伙伴入驻提交、我的申请、平台审核                                                                                                                                          |
| GET/PATCH      | `/notifications/me`、`/notifications/:id/read`                                                                        | 我的站内通知与已读标记                                                                                                                                               |


## 文档索引


| 文档                                           | 说明                  |
| -------------------------------------------- | ------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 架构、数据域、**工程决策记录**   |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)     | Docker / 小程序发布 / 域名 |
| [docs/PRD-SUMMARY.md](docs/PRD-SUMMARY.md)   | PRD v1.1 与模块映射摘要    |


## 合规提示（中国地区）

涉及个人信息与电子协议时，须在上线前完成法务评审与 PIA；代码中仅为工程能力占位，不构成法律意见。

## 许可证

待定（由项目方指定）。
=======
# AIHR
>>>>>>> 2276722adc1bd1e7bfb95f83d795c24f8af31707
