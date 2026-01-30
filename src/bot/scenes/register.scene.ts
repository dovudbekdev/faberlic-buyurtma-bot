import { Scenes } from 'telegraf';
import { phoneKeyboard, mainMenuKeyboard } from '../keyboards';
import { Injectable, Logger } from "@nestjs/common";
import { On, Scene, SceneEnter } from "nestjs-telegraf";
import { UserService } from "src/modules/user/user.service";

interface RegisterSceneState {
    name?: string;
    phone?: string;
    tgId?: number;
    tgUsername?: string;
}

@Scene('register')
@Injectable()
export class RegisterScene {
    private readonly logger = new Logger(RegisterScene.name);

    constructor(private readonly userService: UserService) { }

    @SceneEnter()
    async enter(ctx: Scenes.SceneContext) {
        const from = ctx.from;
        ctx.scene.state = {
            tgId: from?.id,
            tgUsername: from?.username ?? `user_${from?.id ?? 0}`,
        } as RegisterSceneState;

        await ctx.reply('Iltimos, ismingizni kiriting 👤');
    }

    @On('text')
    async onName(ctx: Scenes.SceneContext) {
        const state = ctx.scene.state as RegisterSceneState;

        if (!state.name && ctx.message && 'text' in ctx.message) {
            state.name = ctx.message.text;
            this.logger.log(`Ism: ${state.name}`);
            await ctx.reply('Iltimos, telefon raqamingizni kiriting 📱', phoneKeyboard);
            return;
        }
    }

    @On('message')
    async onContact(ctx: Scenes.SceneContext) {
        const state = ctx.scene.state as RegisterSceneState;
        const message = ctx.message;

        if (!message || !('contact' in message) || !message.contact) {
            if (state.name && !state.phone) {
                await ctx.reply('Iltimos, 📲 tugmasini bosing va telefon raqamingizni yuboring.');
            }
            return;
        }

        if (!state.name || !state.tgId || !state.tgUsername) {
            await ctx.reply('Iltimos, avval ismingizni kiriting.');
            return;
        }

        const phone = message.contact.phone_number.startsWith('+')
            ? message.contact.phone_number
            : `+${message.contact.phone_number}`;
        state.phone = phone;

        await this.userService.create({
            name: state.name,
            phone: state.phone,
            tgId: state.tgId,
            tgUsername: state.tgUsername,
        });

        this.logger.log(`Foydalanuvchi ro'yxatdan o'tdi: ${state.name}, ${state.phone}`);
        await ctx.reply(
            `Muvaffaqiyatli ro'yxatdan o'tdingiz, ${state.name}! 🎉`,
            { reply_markup: mainMenuKeyboard.reply_markup },
        );
        await ctx.scene.leave();
    }
}
