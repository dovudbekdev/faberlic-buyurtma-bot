import { Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { ProductService } from 'src/modules/product/product.service';
import { formatProductCard, truncateCaption, CAPTION_MAX_LENGTH } from '../messages/product.card';
import { getProductListInlineKeyboard, getProductDetailKeyboardWithQty } from '../keyboards';
import {
  QTY_MINUS_REGEX,
  QTY_PLUS_REGEX,
  ADD_TO_CART_REGEX,
  BACK_LIST_CALLBACK,
  PRODUCTS_PER_PAGE,
  LIST_PAGE_REGEX,
} from '../constants';
import { PRODUCT_QTY_NOOP_REGEX } from '../keyboards/product-detail.keyboard';
import { LIST_PAGE_NOOP_REGEX } from '../keyboards/product-list.keyboard';
import { formatProductListMessage } from '../messages/product-list.view';
import type { BotContext } from '../bot.context';
import type { CartService } from '../services/cart.service';

const PRODUCT_ACTION_REGEX_LOCAL = /^product:(\d+)$/;

export function registerProductHandlers(
  bot: Bot<BotContext>,
  productService: ProductService,
  cartService: CartService,
  getProductList: () => Promise<import('src/modules/product/entities/product.entity').Product[]>,
): void {
  const logger = new Logger('ProductHandler');

  bot.callbackQuery(PRODUCT_ACTION_REGEX_LOCAL, async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if (!data || typeof data !== 'string') return;
    const match = data.match(PRODUCT_ACTION_REGEX_LOCAL);
    const productId = match ? parseInt(match[1], 10) : null;
    if (productId == null) return;
    await ctx.answerCallbackQuery().catch(() => {});

    try {
      const product = await productService.findOne(productId);
      const caption = formatProductCard({
        name: product.name,
        price: Number(product.price),
        stock: product.quantity ?? 0,
        description: product.description,
        selectedQty: 1,
      });
      const truncated = truncateCaption(caption, CAPTION_MAX_LENGTH);
      const keyboard = getProductDetailKeyboardWithQty(productId, 1);

      const images = product.images && Array.isArray(product.images) ? product.images : [];
      const validUrls = images.filter((u): u is string => typeof u === 'string' && u.length > 0);
      const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat?.id;
      if (!chatId) return;

      if (validUrls.length > 0) {
        await ctx.api.sendPhoto(chatId, validUrls[0], {
          caption: truncated,
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      } else {
        await ctx.reply(truncated, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      }
    } catch (e) {
      logger.warn(`Product ${productId} not found`, e);
      await ctx.reply('Mahsulot topilmadi.').catch(() => {});
    }
  });

  bot.callbackQuery(QTY_MINUS_REGEX, async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if (!data || typeof data !== 'string') return;
    const match = data.match(QTY_MINUS_REGEX);
    const productId = match ? parseInt(match[1], 10) : null;
    const currentQty = match ? parseInt(match[2], 10) : 1;
    if (productId == null) return;
    await ctx.answerCallbackQuery().catch(() => {});

    const newQty = Math.max(1, currentQty - 1);
    try {
      const product = await productService.findOne(productId);
      const caption = formatProductCard({
        name: product.name,
        price: Number(product.price),
        stock: product.quantity ?? 0,
        description: product.description,
        selectedQty: newQty,
      });
      const truncated = truncateCaption(caption, CAPTION_MAX_LENGTH);
      const keyboard = getProductDetailKeyboardWithQty(productId, newQty);
      const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat?.id;
      const msgId = ctx.callbackQuery?.message?.message_id;
      const msg = ctx.callbackQuery?.message;
      if (chatId == null || msgId == null || !msg) return;

      const hasPhoto =
        'photo' in msg && Array.isArray(msg.photo) && msg.photo.length > 0;
      if (hasPhoto) {
        await ctx.api.editMessageCaption(chatId, msgId, {
          caption: truncated,
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      } else {
        await ctx.api.editMessageText(chatId, msgId, truncated, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      }
    } catch {
      await ctx.answerCallbackQuery({ text: 'Xatolik' }).catch(() => {});
    }
  });

  bot.callbackQuery(QTY_PLUS_REGEX, async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if (!data || typeof data !== 'string') return;
    const match = data.match(QTY_PLUS_REGEX);
    const productId = match ? parseInt(match[1], 10) : null;
    const currentQty = match ? parseInt(match[2], 10) : 1;
    if (productId == null) return;
    await ctx.answerCallbackQuery().catch(() => {});

    const newQty = Math.min(99, currentQty + 1);
    try {
      const product = await productService.findOne(productId);
      const caption = formatProductCard({
        name: product.name,
        price: Number(product.price),
        stock: product.quantity ?? 0,
        description: product.description,
        selectedQty: newQty,
      });
      const truncated = truncateCaption(caption, CAPTION_MAX_LENGTH);
      const keyboard = getProductDetailKeyboardWithQty(productId, newQty);
      const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat?.id;
      const msgId = ctx.callbackQuery?.message?.message_id;
      const msg = ctx.callbackQuery?.message;
      if (chatId == null || msgId == null || !msg) return;

      const hasPhoto =
        'photo' in msg && Array.isArray(msg.photo) && msg.photo.length > 0;
      if (hasPhoto) {
        await ctx.api.editMessageCaption(chatId, msgId, {
          caption: truncated,
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      } else {
        await ctx.api.editMessageText(chatId, msgId, truncated, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      }
    } catch {
      await ctx.answerCallbackQuery({ text: 'Xatolik' }).catch(() => {});
    }
  });

  bot.callbackQuery(ADD_TO_CART_REGEX, async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if (!data || typeof data !== 'string') return;
    const match = data.match(ADD_TO_CART_REGEX);
    const productId = match ? parseInt(match[1], 10) : null;
    const qty = match ? parseInt(match[2], 10) : 1;
    if (productId == null || qty < 1) return;

    try {
      const product = await productService.findOne(productId);
      const cart = ctx.session.cart ?? [];
      const currentInCart =
        cart.find((i) => i.productId === productId)?.quantity ?? 0;
      const requestedTotal = currentInCart + qty;
      const available = Number(product.quantity ?? 0);

      if (available < requestedTotal) {
        await ctx
          .answerCallbackQuery({
            text: "Omborda yetarli mahsulot yo'q",
          })
          .catch(() => {});
        return;
      }

      ctx.session.cart = cartService.addItem({ cart, productId, quantity: qty });
      await ctx.answerCallbackQuery({ text: "Savatga qo'shildi" }).catch(() => {});
      await ctx.reply(`${qty} ta savatga qo'shildi.`);
    } catch {
      await ctx
        .answerCallbackQuery({ text: 'Mahsulot topilmadi' })
        .catch(() => {});
    }
  });

  bot.callbackQuery(PRODUCT_QTY_NOOP_REGEX, (ctx) => ctx.answerCallbackQuery().catch(() => {}));

  bot.callbackQuery(BACK_LIST_CALLBACK, async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    try {
      const all = await getProductList();
      const totalPages = Math.max(1, Math.ceil(all.length / PRODUCTS_PER_PAGE));
      const slice = all.slice(0, PRODUCTS_PER_PAGE);
      const cart = ctx.session.cart ?? [];
      const cartSummary =
        cart.length > 0 ? await cartService.getCartSummary(cart) : null;
      const text = formatProductListMessage(cartSummary, slice, 0, totalPages);
      const keyboard = getProductListInlineKeyboard(slice, 0, totalPages);
      const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat?.id;
      const msgId = ctx.callbackQuery?.message?.message_id;
      if (!chatId) return;
      if (msgId != null) {
        await ctx.api.deleteMessage(chatId, msgId).catch(() => {});
      }
      await ctx.reply(text, { reply_markup: keyboard });
    } catch {
      await ctx.reply("Ro'yxat yuklanmadi.").catch(() => {});
    }
  });

  bot.callbackQuery(LIST_PAGE_REGEX, async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if (!data || typeof data !== 'string') return;
    const match = data.match(LIST_PAGE_REGEX);
    const page = match ? parseInt(match[1], 10) : 0;
    await ctx.answerCallbackQuery().catch(() => {});

    const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat?.id;
    const msgId = ctx.callbackQuery?.message?.message_id;
    if (chatId == null || msgId == null) return;

    try {
      const all = await getProductList();
      const totalPages = Math.max(1, Math.ceil(all.length / PRODUCTS_PER_PAGE));
      const p = Math.max(0, Math.min(page, totalPages - 1));
      const start = p * PRODUCTS_PER_PAGE;
      const slice = all.slice(start, start + PRODUCTS_PER_PAGE);

      const cart = ctx.session.cart ?? [];
      const cartSummary =
        cart.length > 0 ? await cartService.getCartSummary(cart) : null;
      const text = formatProductListMessage(cartSummary, slice, p, totalPages);
      const keyboard = getProductListInlineKeyboard(slice, p, totalPages);
      await ctx.api.editMessageText(chatId, msgId, text, {
        reply_markup: keyboard,
      });
    } catch {
      await ctx.answerCallbackQuery({ text: 'Xatolik' }).catch(() => {});
    }
  });

  bot.callbackQuery(LIST_PAGE_NOOP_REGEX, (ctx) =>
    ctx.answerCallbackQuery().catch(() => {}),
  );
}
