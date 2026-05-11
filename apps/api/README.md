# 后端 API（职得 Jobde）

## 职责建议

- REST/GraphQL API：用户、租户、岗位、匹配、订单、伙伴入驻、代操作审计、AI 任务编排与回调。
- 与微信、支付、签章、LLM 等服务器端集成。

## 与 Docker

实现后应提供 **Dockerfile** 与（可选）`docker-compose` 中的 `api` 服务定义，镜像内不包含 `.env` 密钥，通过运行时注入环境变量。

## 数据连接

本地开发可连接 `docker compose` 启动的 PostgreSQL / Redis，连接串见根目录 `.env.example`。
