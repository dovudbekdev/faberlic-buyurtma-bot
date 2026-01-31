import { Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { UserService } from 'src/modules/user/user.service';
import { OrderService } from 'src/modules/order/order.service';
import { ProductService } from 'src/modules/product/product.service';
import { CartService } from '../services/cart.service';
import { formatCartView } from '../messages/cart.view';
import { getCartKeyboard } from '../keyboards';
import { mainMenuKeyboard } from '../keyboards';
import {
  CART_MENU_BUTTON,
  CART_MENU_BUTTON_LEGACY,
  CART_ADD_BUTTON,
  CART_CLEAR_CALLBACK,
  CART_CHECKOUT_CALLBACK,
  VIEW_CART_CALLBACK,
} from '../constants';
import type { BotContext } from '../bot.context';

export function registerCartHandlers(
  bot: Bot<BotContext>,
  cartService: CartService,
  productService: ProductService,
  userService: UserService,
  orderService: OrderService,
): void {
  const logger = new Logger('CartHandler');

  const showCart = async (ctx: BotContext): Promise<void> => {
    const cart = ctx.session.cart ?? [];
    const payload = await cartService.buildCartViewPayload(cart);
    const text = formatCartView(payload);
    const keyboard = getCartKeyboard(cart.length > 0);
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
    await ctx.reply('Pastdagi tugmalardan foydalaning.', {
      reply_markup: mainMenuKeyboard,
    });
  };

  bot.hears([CART_MENU_BUTTON, CART_MENU_BUTTON_LEGACY, CART_ADD_BUTTON], async (ctx) => {
    const cart = ctx.session.cart ?? [];
    if (!cart.length) {
      await ctx.reply('Savat bo‘sh.', { reply_markup: mainMenuKeyboard });
      return;
    }
    await showCart(ctx);
  });

  bot.callbackQuery(VIEW_CART_CALLBACK, async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    await showCart(ctx);
  });

  bot.callbackQuery(CART_CLEAR_CALLBACK, async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    ctx.session.cart = cartService.clear();
    await ctx.reply('Savat tozalandi.', { reply_markup: mainMenuKeyboard });
  });

  bot.callbackQuery(CART_CHECKOUT_CALLBACK, async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});

    const userId = ctx.from?.id;
    if (!userId) {
      await ctx.reply('Xatolik: foydalanuvchi aniqlanmadi.', {
        reply_markup: mainMenuKeyboard,
      });
      return;
    }

    const user = await userService.findByTgId(userId);
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
      for (const item of cart) {
        const product = await productService.findOne(item.productId);
        const available = Number(product.quantity ?? 0);
        if (available < item.quantity) {
          await ctx.reply(
            `«${product.name}» dan yetarli omborda yo'q (sizda: ${item.quantity}, mavjud: ${available}). Savatni tahrirlang yoki mahsulotni olib tashlang.`,
            { reply_markup: mainMenuKeyboard },
          );
          return;
        }
      }

      const items: { productId: number; quantity: number; price: number }[] = [];
      for (const item of cart) {
        const product = await productService.findOne(item.productId);
        items.push({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(product.price),
        });
      }
      await orderService.createOrder(user.id, items);
      ctx.session.cart = cartService.clear();
      await ctx.reply('Buyurtma qabul qilindi. Tez orada siz bilan bog‘lanamiz.', {
        reply_markup: mainMenuKeyboard,
      });
    } catch (error) {
      logger.error('Buyurtma yozishda xatolik', error);
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.', {
        reply_markup: mainMenuKeyboard,
      });
    }
  });
}
