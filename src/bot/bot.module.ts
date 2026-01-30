import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { AllConfigType } from '../config';
import { StartUpdate } from './updates/start.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const token = configService.get('tg.tgBotToken', { infer: true });
        return {
          token: token!,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [BotService, StartUpdate],
})
export class BotModule {}
