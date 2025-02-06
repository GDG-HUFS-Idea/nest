import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 모든 api들이 "/api"로 시작하도록 설정
  app.setGlobalPrefix('api');

  // cors 개방
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: '*',
    credentials: true,
  });

  await app.listen(process.env.APP_PORT!);
}
bootstrap();
