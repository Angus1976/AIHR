import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * 置于 CDN / Nginx / K8s Ingress 之后时开启，使 req.ip 与限流 key 使用真实客户端地址。
 * 可设为 1/2（代理层数）或 true/1/yes；勿在直连公网时误开，以免伪造 X-Forwarded-For 绕过限流。
 */
function setTrustProxy(app: NestExpressApplication) {
  const t = (process.env.TRUST_PROXY || '').trim().toLowerCase();
  if (!t || t === '0' || t === 'false' || t === 'no') {
    return;
  }
  const http = app.getHttpAdapter().getInstance() as { set?: (k: string, v: unknown) => void };
  if (typeof http?.set !== 'function') {
    return;
  }
  if (t === 'true' || t === 'yes' || t === '1') {
    http.set('trust proxy', 1);
    return;
  }
  const n = parseInt(t, 10);
  if (Number.isFinite(n) && n > 0) {
    http.set('trust proxy', n);
  } else {
    http.set('trust proxy', 1);
  }
}

/** 可设 `BODY_SIZE_LIMIT=2mb` 或 `BODY_SIZE_LIMIT_BYTES=2097152`（正整数，字节）。 */
function bodySizeLimit(): string | number {
  const rawBytes = (process.env.BODY_SIZE_LIMIT_BYTES || '').trim();
  if (rawBytes && /^\d+$/.test(rawBytes)) {
    return parseInt(rawBytes, 10);
  }
  return (process.env.BODY_SIZE_LIMIT || '2mb').trim() || '2mb';
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  setTrustProxy(app);
  const bodyLimit = bodySizeLimit();
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));
  const timeoutMs = Number((process.env.HTTP_SERVER_TIMEOUT_MS || '').trim());
  if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
    app.getHttpServer().setTimeout(timeoutMs);
  }
  app.enableShutdownHooks();
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',').filter(Boolean) ?? true,
    credentials: true,
  });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

bootstrap();
