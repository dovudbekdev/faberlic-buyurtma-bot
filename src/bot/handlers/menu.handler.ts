import { Bot } from 'grammy';
import { ProductService } from 'src/modules/product/product.service';
import { UserService } from 'src/modules/user/user.service';
import { OrderService } from 'src/modules/order/order.service';
import { getProductListInlineKeyboard } from '../keyboards';
import { categoryKeyboard } from '../keyboards/category.keyboard';
import {
  CATEGORY_FACE,
  CATEGORY_COSMETICS,
  CATEGORY_CART,
  CATEGORY_CONTACT,
  MAIN_MENU_ORDER_BUTTON,
  MAIN_MENU_CART_BUTTON,
  MAIN_MENU_MY_ORDERS_BUTTON,
  MAIN_MENU_INFO_BUTTON,
  BACK_MAIN_CALLBACK,
  CART_CONTINUE_CALLBACK,
  PRODUCTS_PER_PAGE,
} from '../constants';
import type { BotContext } from '../bot.context';
import type { CartService } from '../services/cart.service';
import { formatCartView } from '../messages/cart.view';
import { formatProductListMessage } from '../messages/product-list.view';
import { getCartKeyboard } from '../keyboards';
import { mainMenuKeyboard } from '../keyboards';

export function registerMenuHandlers(
  bot: Bot<BotContext>,
  productService: ProductService,
  cartService: CartService,
  userService: UserService,
  orderService: OrderService,
): void {
  const showProductList = async (ctx: BotContext, page = 0): Promise<void> => {
    const all = await productService.findAllInStock();
    const totalPages = Math.max(1, Math.ceil(all.length / PRODUCTS_PER_PAGE));
    const p = Math.max(0, Math.min(page, totalPages - 1));
    const start = p * PRODUCTS_PER_PAGE;
    const slice = all.slice(start, start + PRODUCTS_PER_PAGE);

    const cart = ctx.session.cart ?? [];
    const cartSummary =
      cart.length > 0 ? await cartService.getCartSummary(cart) : null;
    const text = formatProductListMessage(cartSummary, slice, p, totalPages);
    const keyboard = getProductListInlineKeyboard(slice, p, totalPages);
    await ctx.reply(text, { reply_markup: keyboard });
  };

  bot.callbackQuery(BACK_MAIN_CALLBACK, async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.reply('Asosiy menyu', { reply_markup: mainMenuKeyboard });
  });

  bot.callbackQuery(CART_CONTINUE_CALLBACK, async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    await showProductList(ctx, 0);
  });

  bot.hears(MAIN_MENU_ORDER_BUTTON, async (ctx) => showProductList(ctx, 0));
  bot.hears(CATEGORY_FACE, async (ctx) => showProductList(ctx, 0));
  bot.hears(CATEGORY_COSMETICS, async (ctx) => showProductList(ctx, 0));

  bot.hears(MAIN_MENU_CART_BUTTON, async (ctx) => {
    const cart = ctx.session.cart ?? [];
    if (!cart.length) {
      await ctx.reply('🛒 Savat bo\'sh.', { reply_markup: mainMenuKeyboard });
      return;
    }
    const payload = await cartService.buildCartViewPayload(cart);
    const text = formatCartView(payload);
    const keyboard = getCartKeyboard(cart.length > 0);
    await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: keyboard });
    await ctx.reply('Pastdagi tugmalardan foydalaning.', {
      reply_markup: mainMenuKeyboard,
    });
  });

  bot.hears(MAIN_MENU_MY_ORDERS_BUTTON, async (ctx) => {
    const tgId = ctx.from?.id;
    if (!tgId) {
      await ctx.reply('Xatolik.', { reply_markup: mainMenuKeyboard });
      return;
    }
    const user = await userService.findByTgId(tgId);
    if (!user) {
      await ctx.reply('Avval ro‘yxatdan o‘ting. /start', {
        reply_markup: mainMenuKeyboard,
      });
      return;
    }
    const orders = await orderService.findByUserId(user.id, { limit: 5 });
    if (!orders.length) {
      await ctx.reply('Sizda hali buyurtmalar yo‘q.', {
        reply_markup: mainMenuKeyboard,
      });
      return;
    }
    const lines = orders.map(
      (o, i) =>
        `${i + 1}. #${o.id} — ${Number(o.totalSum).toLocaleString()} so'm (${o.status})`,
    );
    await ctx.reply('📦 *Buyurtmalarim:*\n\n' + lines.join('\n'), {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard,
    });
  });

  bot.hears(MAIN_MENU_INFO_BUTTON, async (ctx) => {
    await ctx.reply(
      "ℹ️ *Ma'lumot*\n\nBot orqali buyurtma berishingiz mumkin. Savatdan foydalanib mahsulot tanlang va buyurtma bering.",
      { parse_mode: 'Markdown', reply_markup: mainMenuKeyboard },
    );
  });

  bot.hears(CATEGORY_CART, async (ctx) => {
    const cart = ctx.session.cart ?? [];
    if (!cart.length) {
      await ctx.reply('Savat bo‘sh.', { reply_markup: categoryKeyboard });
      return;
    }
    const payload = await cartService.buildCartViewPayload(cart);
    const text = formatCartView(payload);
    const keyboard = getCartKeyboard(cart.length > 0);
    await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: keyboard });
    await ctx.reply('Pastdagi tugmalardan foydalaning.', {
      reply_markup: categoryKeyboard,
    });
  });

  bot.hears(CATEGORY_CONTACT, async (ctx) => {
    await ctx.reply(
      '📞 Aloqa:\n\nBot orqali buyurtma berishingiz mumkin. Savatdan foydalanib mahsulot tanlang va buyurtma bering.',
      { reply_markup: categoryKeyboard },
    );
  });
}
