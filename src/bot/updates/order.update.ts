import { Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { InlineKeyboard } from 'grammy';
import { ProductService } from 'src/modules/product/product.service';
import { UserService } from 'src/modules/user/user.service';
import { OrderService } from 'src/modules/order/order.service';
import {
  MAIN_MENU_ORDER_BUTTON,
  CART_MENU_BUTTON,
  ADD_CART_CALLBACK_REGEX,
  CART_CLEAR_CALLBACK,
  CART_CHECKOUT_CALLBACK,
  PRODUCTS_PER_PAGE,
} from '../constants';
import {
  getProductListInlineKeyboard,
  getProductDetailKeyboard,
  mainMenuKeyboard,
} from '../keyboards';
import { formatProductListMessage } from '../messages/product-list.view';
import {
  formatProductDetail,
} from '../helpers/product-formatter.helper';
import type { BotContext } from '../bot.context';

const PRODUCT_ACTION_REGEX = /^product:(\d+)$/;
const MAX_MEDIA_GROUP_SIZE = 10;
const CAPTION_MAX_LENGTH = 1024;

@Injectable()
export class OrderUpdate {
  private readonly logger = new Logger(OrderUpdate.name);

  constructor(
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly orderService: OrderService,
  ) {}

  register(bot: Bot<BotContext>): void {
    bot.hears(MAIN_MENU_ORDER_BUTTON, (ctx) => this.onOrder(ctx));
    bot.hears(CART_MENU_BUTTON, (ctx) => this.onCart(ctx));
    bot.callbackQuery(PRODUCT_ACTION_REGEX, (ctx) => this.onProductSelect(ctx));
    bot.callbackQuery(ADD_CART_CALLBACK_REGEX, (ctx) => this.onAddToCart(ctx));
    bot.callbackQuery(CART_CLEAR_CALLBACK, (ctx) => this.onCartClear(ctx));
    bot.callbackQuery(CART_CHECKOUT_CALLBACK, (ctx) => this.onCartCheckout(ctx));
  }

  async onOrder(ctx: BotContext): Promise<void> {
    try {
      const products = await this.productService.findAllInStock();
      if (!products.length) {
        await ctx.reply("Hozircha mahsulotlar yo'q.");
        return;
      }
      const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
      const slice = products.slice(0, PRODUCTS_PER_PAGE);
      const text = formatProductListMessage(null, slice, 0, totalPages);
      const keyboard = getProductListInlineKeyboard(slice, 0, totalPages);
      await ctx.reply(text, { reply_markup: keyboard });
    } catch (error) {
      this.logger.error("Mahsulotlar ro'yxatini yuborishda xatolik", error);
      await ctx.reply("Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
  }

  async onProductSelect(ctx: BotContext): Promise<void> {
    const data = ctx.callbackQuery?.data;
    if (!data || typeof data !== 'string') return;

    const match = data.match(PRODUCT_ACTION_REGEX);
    const productId = match ? parseInt(match[1], 10) : null;
    if (productId == null) return;

    await ctx.answerCallbackQuery().catch(() => {});

    try {
      const product = await this.productService.findOne(productId);
      const caption = formatProductDetail(product);
      const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat?.id;
      if (!chatId) {
        await ctx.reply('Xatolik: chat topilmadi.');
        return;
      }

      const images =
        product.images && Array.isArray(product.images) ? product.images : [];
      const validUrls = images.filter(
        (url): url is string => typeof url === 'string' && url.length > 0,
      );

      const detailKeyboard = getProductDetailKeyboard(productId);

      if (validUrls.length > 0) {
        const captionTrimmed =
          caption.length > CAPTION_MAX_LENGTH
            ? caption.slice(0, CAPTION_MAX_LENGTH - 3) + '...'
            : caption;
        const mediaSlice = validUrls
          .slice(0, MAX_MEDIA_GROUP_SIZE)
          .map((url, i) => ({
            type: 'photo' as const,
            media: url,
            caption: i === 0 ? captionTrimmed : undefined,
          }));
        await ctx.api.sendMediaGroup(chatId, mediaSlice);
        if (validUrls.length > MAX_MEDIA_GROUP_SIZE) {
          const rest = validUrls.slice(MAX_MEDIA_GROUP_SIZE);
          await ctx.api.sendMediaGroup(
            chatId,
            rest.map((url) => ({ type: 'photo' as const, media: url })),
          );
        }
        await ctx.api.sendMessage(chatId, 'Savatga qo‘shish uchun sonini tanlang:', {
          reply_markup: detailKeyboard,
        });
      } else {
        await ctx.api.sendMessage(chatId, caption, {
          reply_markup: detailKeyboard,
        });
      }
    } catch (error) {
      this.logger.warn(
        `Mahsulot topilmadi yoki xatolik: productId=${productId}`,
        error,
      );
      await ctx.reply('Mahsulot topilmadi.').catch(() => {});
    }
  }

  async onAddToCart(ctx: BotContext): Promise<void> {
    const data = ctx.callbackQuery?.data;
    if (!data || typeof data !== 'string') return;

    const match = data.match(ADD_CART_CALLBACK_REGEX);
    const productId = match ? parseInt(match[1], 10) : null;
    const quantity = match ? parseInt(match[2], 10) : 0;
    if (productId == null || quantity < 1) return;

    await ctx.answerCallbackQuery().catch(() => {});

    const cart = ctx.session.cart ?? [];
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    ctx.session.cart = cart;

    await ctx.reply(`${quantity} ta savatga qo'shildi.`, {
      reply_markup: mainMenuKeyboard,
    });
  }

  async onCart(ctx: BotContext): Promise<void> {
    const cart = ctx.session.cart ?? [];
    if (!cart.length) {
      await ctx.reply('Savat bo‘sh.', { reply_markup: mainMenuKeyboard });
      return;
    }

    let totalSum = 0;
    const lines: string[] = ['🛒 Savat:\n'];

    for (const item of cart) {
      try {
        const product = await this.productService.findOne(item.productId);
        const price = Number(product.price);
        const lineTotal = price * item.quantity;
        totalSum += lineTotal;
        lines.push(
          `• ${product.name}: ${item.quantity} × ${price.toLocaleString()} = ${lineTotal.toLocaleString()} so'm`,
        );
      } catch {
        lines.push(`• Mahsulot #${item.productId}: ${item.quantity} ta (topilmadi)`);
      }
    }

    lines.push(`\n💰 Jami: ${totalSum.toLocaleString()} so'm`);

    const keyboard = new InlineKeyboard()
      .text('Tozalash', CART_CLEAR_CALLBACK)
      .text('Buyurtma berish', CART_CHECKOUT_CALLBACK);

    await ctx.reply(lines.join('\n'), { reply_markup: keyboard });
  }

  async onCartClear(ctx: BotContext): Promise<void> {
    await ctx.answerCallbackQuery().catch(() => {});
    ctx.session.cart = [];
    await ctx.reply('Savat tozalandi.', { reply_markup: mainMenuKeyboard });
  }

  async onCartCheckout(ctx: BotContext): Promise<void> {
    await ctx.answerCallbackQuery().catch(() => {});

    const userId = ctx.from?.id;
    if (!userId) {
      await ctx.reply('Xatolik: foydalanuvchi aniqlanmadi.', {
        reply_markup: mainMenuKeyboard,
      });
      return;
    }

    const user = await this.userService.findByTgId(userId);
    if (!user) {
      await ctx.reply('Avval ro‘yxatdan o‘ting. /start bosing.', {
        reply_markup: mainMenuKeyboard,
      });
      return;
    }

    const cart = ctx.session.cart ?? [];
    if (!cart.length) {
      await ctx.reply('Savat bo‘sh.', { reply_markup: mainMenuKeyboard });
      return;
    }

    try {
      const items: { productId: number; quantity: number; price: number }[] = [];
      for (const item of cart) {
        const product = await this.productService.findOne(item.productId);
        items.push({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(product.price),
        });
      }

      await this.orderService.createOrder(user.id, items);
      ctx.session.cart = [];
      await ctx.reply('Buyurtma qabul qilindi. Tez orada siz bilan bog‘lanamiz.', {
        reply_markup: mainMenuKeyboard,
      });
    } catch (error) {
      this.logger.error('Buyurtma yozishda xatolik', error);
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.', {
        reply_markup: mainMenuKeyboard,
      });
    }
  }
}
