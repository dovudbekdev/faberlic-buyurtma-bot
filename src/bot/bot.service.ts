import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Context, Scenes } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { RegisterScene } from './scenes/register.scene';
import { UserService } from 'src/modules/user/user.service';
import { mainMenuKeyboard } from './keyboards';

@Injectable()
export class BotService implements OnModuleInit {
    private readonly logger = new Logger(BotService.name);

    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly registerScene: RegisterScene,
        private readonly userService: UserService
    ) { }

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

    async onStart(ctx: Context | Scenes.SceneContext) {
        const user = ctx.from;
        if (!user?.id) {
            this.logger.warn('Foydalanuvchi ma\'lumotlari mavjud emas');
            return;
        }

        const existingUser = await this.userService.findByTgId(user.id);
        if (!existingUser) {
            if ('scene' in ctx) {
                return ctx.scene.enter('register');
            }
            this.logger.warn('Scene context mavjud emas');
            return;
        }
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.telegram.sendMessage(chatId, `Salom, ${existingUser.name}!`, {
            reply_markup: mainMenuKeyboard.reply_markup,
        });
        return;
    }
}