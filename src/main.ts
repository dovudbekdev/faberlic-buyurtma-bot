import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config';
import { TransformInterceptor } from './common/interceptors';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // ConfigService ni to'g'ri type bilan olish
    const configService = app.get<ConfigService<AllConfigType>>(ConfigService);
    
    // Config ma'lumotlarini type-safe usulda olish
    const port = configService.get('app.port', { infer: true }) ?? 3000;
    const appBaseUrl = configService.get('app.appBaseUrl', { infer: true });
    const apiPrefix = configService.get('app.apiPrefix', { infer: true });
    const nodeEnv = configService.get('app.nodeEnv', { infer: true });
    const uploadDir = configService.get('app.uploadDir', { infer: true });
    const filesPublicPath = configService.get('app.filesPublicPath', {
      infer: true,
    });
    const enableSwagger = configService.get('app.enableSwagger', {
      infer: true,
    });
    const swaggerPath = configService.get('app.swaggerPath', { infer: true });

    // Static fayllar: GET /files/:filename rasmni qaytaradi
    const uploadPath = uploadDir ?? join(process.cwd(), 'uploads');
    app.use(`/${filesPublicPath}`, express.static(uploadPath));

    // API prefix qo'shish
    if (apiPrefix) {
      app.setGlobalPrefix(apiPrefix);
    }

    // Global response interceptor - barcha muvaffaqiyatli response'larni bir xil formatda qaytarish
    app.useGlobalInterceptors(new TransformInterceptor());

    // Swagger - faqat production bo'lmaganda yoki enableSwagger true bo'lsa
    if (enableSwagger && nodeEnv !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Faberlic Buyurtma Bot API')
        .setDescription('Faberlic buyurtma boti uchun REST API hujjati')
        .setVersion('1.0')
        .addTag('product')
        .addTag('user')
        .addTag('file')
        .build();
      const document = SwaggerModule.createDocument(app, config);
      const docsPath = apiPrefix
        ? `${apiPrefix}/${swaggerPath ?? 'docs'}`
        : (swaggerPath ?? 'docs');
      SwaggerModule.setup(docsPath, app, document);
    }

    // Server ishga tushirish
    await app.listen(port, () => {
      logger.log('='.repeat(50));
      logger.log(`🚀 Server muvaffaqiyatli ishga tushdi!`);
      logger.log('='.repeat(50));
      logger.log(`📍 Environment: ${nodeEnv}`);
      logger.log(`🌐 Base URL: ${appBaseUrl}`);
      logger.log(`🔗 API Prefix: /${apiPrefix}`);
      logger.log(`⚡ Port: ${port}`);
      logger.log('='.repeat(50));
    });

    // Graceful shutdown qo'shish
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM signal received: closing HTTP server');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT signal received: closing HTTP server');
      await app.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Server ishga tushirishda xatolik:', error);
    process.exit(1);
  }
}

bootstrap();
