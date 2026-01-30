import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotService } from './bot.service';
import { AllConfigType } from '../config';
import { StartUpdate } from './updates/start.update';
import { OrderUpdate } from './updates/order.update';
import { UserModule } from 'src/modules/user/user.module';
import { ProductModule } from 'src/modules/product/product.module';
import { RegisterScene } from './scenes/register.scene';

@Module({
  imports: [
    // Telegraf
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AllConfigType>) => {
        const token = configService.get('tg.tgBotToken', { infer: true });
        return {
          token: token!,
          middlewares: [session()],
        };
      },
      inject: [ConfigService],
    }),

    // Modules
    UserModule,
    ProductModule,
  ],
  providers: [BotService, StartUpdate, OrderUpdate, RegisterScene],
  exports: [BotService],
})
export class BotModule {}
