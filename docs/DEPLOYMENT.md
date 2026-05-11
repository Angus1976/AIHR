# 部署说明：Docker 与微信小程序

## 1. 总原则

- **Docker**：运行 **API、Web 管理端、PostgreSQL、Redis**（及可选 Nginx、队列 Worker），对外提供 **HTTPS API** 与管理端站点。
- **微信小程序**：在微信公众平台配置服务器域名与商户号等；**构建产物上传微信**，不放入业务容器内运行。

## 2. 本地开发

### 2.1 依赖服务

```bash
cp .env.example .env
docker compose up -d
```

默认提供：

- PostgreSQL：持久化业务数据、AI 配置版本、审计日志索引等；宿主端口默认 **25432** → 容器 **5432**，容器名 `aihr-app-postgres`，volume `aihr-app-pgdata`。
- Redis：缓存、分布式锁、队列后端（若选用 Redis 作 broker）；宿主端口默认 **26379**，容器名 `aihr-app-redis`。
- 自定义网络 **aihr-app-internal**：`api` 通过主机名 `postgres` 访问数据库，与其他项目网络隔离。

### 2.1.1 Jobde 工程 Docker 实例常用命令

```bash
# 启动数据层
docker compose up -d postgres redis

# 启动全栈 API（默认 http://localhost:3300/v1/health）
docker compose up -d --build api

# 查看新实例容器
docker ps --filter name=aihr-app

# 进入本项目的 Postgres（容器名 aihr-app-postgres）
docker exec -it aihr-app-postgres psql -U aihr_app -d aihr_app

# 对新库执行迁移与种子（本地 apps/api 目录）
set -a && . ../../.env && set +a
npx prisma migrate deploy
npm run prisma:seed

# 写入完整端到端模拟数据
npm run prisma:demo
```

不要把本项目连接到旧实例 `aihr-postgres:15432` / `aihr-api:3000`；新实例统一使用 `aihr-app-*` 命名与 `25432` / `26379` / `3300` 端口。

管理端开发端口默认 **15174**，小程序 H5 模拟器默认 **15175**，避免占用 Vite 常见默认端口 `5173` / `5174`。如需调整，修改 `.env` 中 `VITE_ADMIN_WEB_PORT`、`VITE_MINIPROGRAM_SIM_PORT`，并同步 `CORS_ORIGINS`。

### 2.2 小程序联调

1. 在本机启动 API：`cd apps/api && npm run start:dev`，或使用 `docker compose up -d` 启动含 API 的全栈。
2. 使用 **HTTPS** 合法域名：本地可用内网穿透（如 ngrok、frp）将 `https://xxx` 映射到本地 API。
3. 登录 [微信公众平台](https://mp.weixin.qq.com/) → 开发 → 开发管理 → **服务器域名**，将 request/socket/upload/download 合法域名加入白名单。
4. 微信开发者工具：导入 `apps/miniprogram`（创建后），「本地设置」中按需关闭域名校验仅用于纯本地调试。

**注意**：真机预览、体验版、正式版均受合法域名与 HTTPS 约束。

### 2.3 本地 H5 小程序模拟器

为了在没有真实微信 AppID / AppSecret 的情况下完整试用移动端角色，本仓库提供 `apps/miniprogram-sim`：

```bash
cd apps/miniprogram-sim
npm install
npm run dev
```

访问 `http://localhost:15175`。模拟器通过 `/v1/auth/dev/login` 获取本地 JWT，可切换求职者、伙伴机构和企业联系人。该接口仅在 `LOCAL_SIMULATOR_ENABLED=true` 时可用，生产环境必须关闭。

## 3. 服务器 Docker 部署（建议流程）

1. 准备主机：安装 Docker 与 Docker Compose v2。
2. 配置 `.env`：生产级数据库密码、`JWT` 密钥、微信 `AppSecret`、LLM Key 等**绝不**提交 Git。
3. 启动数据层（或与 API 一并启动）：

   ```bash
   docker compose -f docker-compose.yml up -d postgres redis
   ```

   全栈（含 API 镜像构建）：`docker compose up -d --build`。首次建库后执行：`docker exec aihr-app-api npx prisma db seed`。

4. 启动应用镜像：

   - `api`：默认 **3000**，健康检查 `GET /v1/health`。
   - `admin-web`：静态资源由 Nginx 提供，或同一反向代理路径 `/` 与 `/api` 分流。

5. 前置 **TLS 终止**：可用云 LB、Caddy 或 Nginx，证书自动续期。

6. 将公网 `https://api.example.com` 填入：微信公众平台服务器域名、小程序 `app.json` 或构建时环境变量。

## 4. 微信小程序「部署」含义

| 步骤 | 执行方 | 说明 |
|------|--------|------|
| 代码编译上传 | CI 或开发者 | 使用微信开发者工具或 `miniprogram-ci` |
| 提交审核 | 管理员 | 公众平台提交版本 |
| 发布 | 管理员 | 审核通过后全量/分阶段发布 |
| 版本回滚 | 管理员 | 使用平台提供的版本管理 |

建议在仓库中增加：

- `apps/miniprogram/project.config.json`：合法配置 `appid`、目录结构。
- CI 变量：`MINIPROGRAM_PRIVATE_KEY`（上传密钥）、版本号规则。

**Docker 与 CI**：可在 GitHub Actions / GitLab CI 中用容器执行 node 依赖安装与上传，但**上传目标仍是微信服务器**，不是自托管容器。

## 5. 与 PRD 相关的集成清单（上线前）

- 微信：登录、（如需）手机号、支付、订阅消息。
- 企微：就业老师通知、工单（若做）。
- 腾讯会议：预约与回调（若做深度集成）。
- 电子签：CA 与合同状态回调。
- 对象存储：简历、证件类**最小必要**存储与加密策略。

## 6. 文档版本

| 版本 | 日期 | 说明 |
|------|------|------|
| 0.1 | 2026-04-24 | 初版：Docker + 小程序职责分离与联调要点 |
| 0.2 | 2026-04-25 | Docker 数据层改为 `aihr-app-*` 独立实例、端口与 volume，避免与其他项目冲突 |
