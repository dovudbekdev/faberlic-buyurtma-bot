import { Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import type { Conversation } from '@grammyjs/conversations';
import { createConversation } from '@grammyjs/conversations';
import { phoneKeyboard, mainMenuKeyboard } from '../keyboards';
import { UserService } from 'src/modules/user/user.service';
import type { BotContext } from '../bot.context';

@Injectable()
export class RegisterScene {
  private readonly logger = new Logger(RegisterScene.name);

  constructor(private readonly userService: UserService) {}

  register(bot: Bot<BotContext>): void {
    const userService = this.userService;
    const logger = this.logger;

    async function registerConversation(
      conversation: Conversation<BotContext, BotContext>,
      ctx: BotContext,
    ): Promise<void> {
      const from = ctx.from;
      const tgId = from?.id;
      const tgUsername = from?.username ?? `user_${from?.id ?? 0}`;

      await ctx.reply('Iltimos, ismingizni kiriting 👤');

      const nameCtx = await conversation.waitFor('message:text');
      const name = nameCtx.message.text;
      if (!name?.trim()) return;

      await ctx.reply('Iltimos, telefon raqamingizni kiriting 📱', {
        reply_markup: phoneKeyboard,
      });

      const contactCtx = await conversation.waitFor('message:contact');
      const contact = contactCtx.message.contact;
      if (!contact?.phone_number) {
        await ctx.reply(
          'Iltimos, 📲 tugmasini bosing va telefon raqamingizni yuboring.',
        );
        return;
      }

      const phone = contact.phone_number.startsWith('+')
        ? contact.phone_number
        : `+${contact.phone_number}`;

      if (!tgId) return;

      await conversation.external(async () => {
        await userService.create({
          name: name.trim(),
          phone,
          tgId,
          tgUsername,
        });
      });

      logger.log(`Foydalanuvchi ro'yxatdan o'tdi: ${name.trim()}, ${phone}`);

      await ctx.reply(
        `Muvaffaqiyatli ro'yxatdan o'tdingiz, ${name.trim()}! 🎉`,
        {
          reply_markup: mainMenuKeyboard,
        },
      );
    }

    bot.use(createConversation(registerConversation, 'register'));
  }
}
