import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import {
  AllConfigType,
  appConfig,
  dbConfig,
  tgConfig,
  i18nConfig,
  validationConfig,
} from './config';
import { ConfigService } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { HttpLoggerMiddleware } from './common/middlewares';
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import { UserModule } from './modules/user/user.module';
import { UserEntity } from './modules/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './modules/product/product.module';
import { Product } from './modules/product/entities/product.entity';
import { FileModule } from './modules/file/file.module';
import { OrderModule } from './modules/order/order.module';
import { Order } from './modules/order/entities/order.entity';
import { OrderItem } from './modules/order/entities/order-item.entity';

const envFilePath = (() => {
  const nodeEnv = process.env.NODE_ENV;
  switch (nodeEnv) {
    case 'development':
      return path.join(__dirname, '../.env.development');
    case 'production':
      return path.join(__dirname, '../.env.production');
    default:
      return path.join(__dirname, '../.env');
  }
})();

@Module({
  imports: [
    ConfigModule.forRoot<AllConfigType>({
      isGlobal: true,
      load: [appConfig, dbConfig, tgConfig, i18nConfig],
      validationSchema: validationConfig,
      envFilePath: envFilePath,
    }),

    // i18n
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const fallbackLanguage =
          configService.get('i18n.fallbackLanguage', { infer: true }) || 'uz';
        const nodeEnv = configService.get('app.nodeEnv', { infer: true });
        const isDevelopment = nodeEnv === 'development' || nodeEnv === 'local';

        return {
          fallbackLanguage,
          loaderOptions: {
            path: path.join(__dirname, '../i18n/'),
            watch: isDevelopment,
          },
          resolvers: [
            AcceptLanguageResolver,
            new QueryResolver(['lang', 'locale']),
          ],
        };
      },
      inject: [ConfigService],
    }),

    // Type ORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return {
          type: 'postgres',
          host: configService.get('db.dbHost', { infer: true }),
          port: configService.get('db.dbPort', { infer: true }),
          username: configService.get('db.dbUser', { infer: true }),
          password: configService.get('db.dbPassword', { infer: true }),
          database: configService.get('db.dbName', { infer: true }),
          entities: [UserEntity, Product, Order, OrderItem],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),

    BotModule,
    UserModule,
    ProductModule,
    OrderModule,
    FileModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
