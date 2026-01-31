import { Inject, Injectable, OnModuleInit, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { session } from 'grammy';
import { conversations } from '@grammyjs/conversations';
import { BotContext, type SessionData } from './bot.context';
import { AllConfigType } from '../config';
import { UserService } from 'src/modules/user/user.service';
import { ProductService } from 'src/modules/product/product.service';
import { OrderService } from 'src/modules/order/order.service';
import { CartService } from './services/cart.service';
import { mainMenuKeyboard } from './keyboards';
import { registerHandlers } from './handlers/bot.handlers';
import { StartUpdate } from './updates/start.update';
import { OrderUpdate } from './updates/order.update';
import { RegisterScene } from './scenes/register.scene';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private bot: Bot<BotContext> | null = null;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    @Inject(forwardRef(() => StartUpdate))
    private readonly startUpdate: StartUpdate,
    @Inject(forwardRef(() => OrderUpdate))
    private readonly orderUpdate: OrderUpdate,
    @Inject(forwardRef(() => RegisterScene))
    private readonly registerScene: RegisterScene,
  ) {}

  async onModuleInit(): Promise<void> {
    const tg = this.configService.get('tg', { infer: true });
    const token = tg?.tgBotToken;
    if (!token) {
      this.logger.error('TG_BOT_TOKEN topilmadi');
      return;
    }

    this.bot = new Bot<BotContext>(token);

    this.bot.use(
      session({
        initial: (): SessionData => ({ cart: [] }),
      }),
    );
    this.bot.use(conversations());

    this.registerScene.register(this.bot);
    registerHandlers(this.bot, {
      productService: this.productService,
      userService: this.userService,
      orderService: this.orderService,
      cartService: this.cartService,
    });
    this.startUpdate.register(this.bot);
    // OrderUpdate not registered: product/cart/checkout handled by handlers (product, cart, menu)

    this.bot.catch((err) => {
      this.logger.error('Bot xatolik:', err);
    });

    await this.bot.api
      .getMe()
      .then((me) => {
        this.logger.log('='.repeat(50));
        this.logger.log('Bot muvaffaqiyatli ishga tushdi!');
        this.logger.log('='.repeat(50));
        this.logger.log(`Bot ID: ${me.id}`);
        this.logger.log(`Bot Username: @${me.username}`);
        this.logger.log('='.repeat(50));
      })
      .catch((error) => {
        this.logger.error("Bot ma'lumotlarini olishda xatolik:", error);
      });

    void this.bot.start({
      onStart: (info) =>
        this.logger.log(`Long polling: ${info.username ?? info.id}`),
    });
  }

  async onStart(ctx: BotContext): Promise<void> {
    const user = ctx.from;
    if (!user?.id) {
      this.logger.warn("Foydalanuvchi ma'lumotlari mavjud emas");
      return;
    }

    const existingUser = await this.userService.findByTgId(user.id);
    if (!existingUser) {
      await ctx.conversation.enter('register');
      return;
    }

    const chatId = ctx.chat?.id;
    if (!chatId) return;

    await ctx.reply(`Salom, ${existingUser.name}!`, {
      reply_markup: mainMenuKeyboard,
    });
  }
}
