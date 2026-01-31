import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Bot } from 'grammy';
import { BotService } from '../bot.service';
import type { BotContext } from '../bot.context';

@Injectable()
export class StartUpdate {
  private readonly logger = new Logger(StartUpdate.name);

  constructor(
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
  ) {}

  register(bot: Bot<BotContext>): void {
    bot.command('start', (ctx) => this.start(ctx));
  }

  async start(ctx: BotContext): Promise<void> {
    await this.botService.onStart(ctx);
  }
}
