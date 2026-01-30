import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);

    // ConfigService ni to'g'ri type bilan olish
    const configService = app.get<ConfigService<AllConfigType>>(ConfigService);
    
    // Config ma'lumotlarini type-safe usulda olish
    const port = configService.get('app.port', { infer: true }) ?? 3000;
    const appBaseUrl = configService.get('app.appBaseUrl', { infer: true });
    const apiPrefix = configService.get('app.apiPrefix', { infer: true });
    const nodeEnv = configService.get('app.nodeEnv', { infer: true });

    // API prefix qo'shish
    if (apiPrefix) {
      app.setGlobalPrefix(apiPrefix);
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
