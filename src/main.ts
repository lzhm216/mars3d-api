import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局路由前缀
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3002',
      'http://localhost:3002',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  // 全局参数验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('Mars3D 后台管理系统 API')
    .setDescription('Mars3D 地理信息系统后台管理接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`服务已启动: http://localhost:${port}`);
  console.log(`Swagger 文档: http://localhost:${port}/api/docs`);
}

bootstrap();
