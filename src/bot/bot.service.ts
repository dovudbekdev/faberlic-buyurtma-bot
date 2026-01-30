import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { Context } from "telegraf";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";

@Injectable()
export class BotService implements OnModuleInit {
    private readonly logger = new Logger(BotService.name);

    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>
    ) {}

    async onModuleInit() {
        try {
            const botInfo = await this.bot.telegram.getMe();
            this.logger.log('='.repeat(50));
            this.logger.log('🤖 Bot muvaffaqiyatli ishga tushdi!');
            this.logger.log('='.repeat(50));
            this.logger.log(`Bot ID: ${botInfo.id}`);
            this.logger.log(`Bot Username: @${botInfo.username}`);
            this.logger.log('='.repeat(50));
        } catch (error) {
            this.logger.error('Bot ma\'lumotlarini olishda xatolik:', error);
        }
    }

    async onStart(ctx: Context){
        await ctx.reply("Bot ishga tushdi!");
    }
}