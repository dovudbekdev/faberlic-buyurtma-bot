import { Logger } from '@nestjs/common';
import { Bot, InlineKeyboard } from 'grammy';
import { OrderService } from 'src/modules/order/order.service';
import { OrderStatus } from 'src/modules/order/constants/order-status.constant';
import {
  ADMIN_MENU_PENDING_ORDERS,
  ADMIN_MENU_ALL_ORDERS,
  ADMIN_MENU_COMPLETE_DELIVERED,
  ADMIN_ORDER_CONFIRM_REGEX,
  ADMIN_ORDER_COMPLETE_REGEX,
  ADMIN_ORDER_CANCEL_REGEX,
  getAdminOrderCompleteCallback,
} from '../constants/admin.constant';
import { adminMainKeyboard } from '../keyboards';
import { formatAdminOrderList } from '../messages/order-admin.view';
import type { BotContext } from '../bot.context';

export interface AdminHandlerDeps {
  orderService: OrderService;
  adminIds: number[];
}

const statusLabels: Record<string, string> = {
  [OrderStatus.CONFIRMED]: 'Tasdiqlandi',
  [OrderStatus.COMPLETED]: 'Yakunlandi',
  [OrderStatus.CANCELLED]: 'Bekor qilindi',
};

export function registerAdminHandlers(
  bot: Bot<BotContext>,
  deps: AdminHandlerDeps,
): void {
  const { orderService, adminIds } = deps;
  const logger = new Logger('AdminHandler');

  function isAdmin(tgId: number): boolean {
    return adminIds.includes(tgId);
  }

  bot.hears(ADMIN_MENU_PENDING_ORDERS, async (ctx) => {
    const fromId = ctx.from?.id;
    if (fromId == null || !isAdmin(fromId)) {
      await ctx.reply('Ruxsat yo‘q.').catch(() => {});
      return;
    }
    try {
      const orders = await orderService.findPending();
      const text = formatAdminOrderList(orders);
      await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: adminMainKeyboard,
      });
    } catch (err) {
      logger.error('findPending failed', err);
      await ctx.reply('Xatolik yuz berdi.', { reply_markup: adminMainKeyboard }).catch(() => {});
    }
  });

  bot.hears(ADMIN_MENU_ALL_ORDERS, async (ctx) => {
    const fromId = ctx.from?.id;
    if (fromId == null || !isAdmin(fromId)) {
      await ctx.reply('Ruxsat yo‘q.').catch(() => {});
      return;
    }
    try {
      const orders = await orderService.findAll();
      const text = formatAdminOrderList(orders);
      await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: adminMainKeyboard,
      });
    } catch (err) {
      logger.error('findAll failed', err);
      await ctx.reply('Xatolik yuz berdi.', { reply_markup: adminMainKeyboard }).catch(() => {});
    }
  });

  bot.hears(ADMIN_MENU_COMPLETE_DELIVERED, async (ctx) => {
    const fromId = ctx.from?.id;
    if (fromId == null || !isAdmin(fromId)) {
      await ctx.reply('Ruxsat yo‘q.').catch(() => {});
      return;
    }
    try {
      const orders = await orderService.findConfirmed();
      if (!orders.length) {
        await ctx.reply(
          "Tasdiqlangan buyurtma yo‘q. Egasiga topshirilgach shu tugma orqali yakunlashingiz mumkin.",
          { reply_markup: adminMainKeyboard },
        );
        return;
      }
      const text =
        '✅ *Topshirilganlarni yakunlash*\n\nQuyidagi buyurtmalardan egasiga topshirilganini yakunlash uchun tugmani bosing:';
      const keyboard = new InlineKeyboard();
      for (const order of orders) {
        keyboard.text(`Yakunlash #${order.id}`, getAdminOrderCompleteCallback(order.id)).row();
      }
      await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
      await ctx.reply('Pastdagi tugmalardan foydalaning.', {
        reply_markup: adminMainKeyboard,
      });
    } catch (err) {
      logger.error('findConfirmed failed', err);
      await ctx.reply('Xatolik yuz berdi.', { reply_markup: adminMainKeyboard }).catch(() => {});
    }
  });

  bot.callbackQuery(ADMIN_ORDER_CONFIRM_REGEX, async (ctx) => {
    const fromId = ctx.from?.id;
    if (fromId == null || !isAdmin(fromId)) {
      await ctx.answerCallbackQuery({ text: 'Ruxsat yo‘q.' }).catch(() => {});
      return;
    }

    const data = ctx.callbackQuery?.data;
    const match = typeof data === 'string' ? data.match(ADMIN_ORDER_CONFIRM_REGEX) : null;
    const orderId = match ? parseInt(match[1], 10) : null;
    if (orderId == null) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    await ctx.answerCallbackQuery().catch(() => {});

    try {
      const order = await orderService.updateStatus(orderId, OrderStatus.CONFIRMED);
      if (order) {
        const label = statusLabels[OrderStatus.CONFIRMED];
        const msg = ctx.callbackQuery.message as { text?: string } | undefined;
        await ctx.editMessageReplyMarkup({ reply_markup: new InlineKeyboard() }).catch(() => {});
        await ctx.api.editMessageText(ctx.chat!.id, ctx.callbackQuery.message!.message_id, (msg?.text ?? '') + `\n\n✅ ${label}`).catch(() => {});
      }
    } catch (err) {
      logger.error(`Confirm order ${orderId} failed`, err);
      await ctx.answerCallbackQuery({ text: 'Xatolik yuz berdi.' }).catch(() => {});
    }
  });

  bot.callbackQuery(ADMIN_ORDER_COMPLETE_REGEX, async (ctx) => {
    const fromId = ctx.from?.id;
    if (fromId == null || !isAdmin(fromId)) {
      await ctx.answerCallbackQuery({ text: 'Ruxsat yo‘q.' }).catch(() => {});
      return;
    }

    const data = ctx.callbackQuery?.data;
    const match = typeof data === 'string' ? data.match(ADMIN_ORDER_COMPLETE_REGEX) : null;
    const orderId = match ? parseInt(match[1], 10) : null;
    if (orderId == null) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    await ctx.answerCallbackQuery().catch(() => {});

    try {
      const order = await orderService.updateStatus(orderId, OrderStatus.COMPLETED);
      if (order) {
        await ctx.editMessageReplyMarkup({ reply_markup: new InlineKeyboard() }).catch(() => {});
        const label = statusLabels[OrderStatus.COMPLETED];
        const msg = ctx.callbackQuery.message as { text?: string };
        await ctx.api.editMessageText(ctx.chat!.id, ctx.callbackQuery.message!.message_id, (msg?.text ?? '') + `\n\n🎉 ${label}`).catch(() => {});
      }
    } catch (err) {
      logger.error(`Complete order ${orderId} failed`, err);
      await ctx.answerCallbackQuery({ text: 'Xatolik yuz berdi.' }).catch(() => {});
    }
  });

  bot.callbackQuery(ADMIN_ORDER_CANCEL_REGEX, async (ctx) => {
    const fromId = ctx.from?.id;
    if (fromId == null || !isAdmin(fromId)) {
      await ctx.answerCallbackQuery({ text: 'Ruxsat yo‘q.' }).catch(() => {});
      return;
    }

    const data = ctx.callbackQuery?.data;
    const match = typeof data === 'string' ? data.match(ADMIN_ORDER_CANCEL_REGEX) : null;
    const orderId = match ? parseInt(match[1], 10) : null;
    if (orderId == null) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    await ctx.answerCallbackQuery().catch(() => {});

    try {
      const order = await orderService.updateStatus(orderId, OrderStatus.CANCELLED);
      if (order) {
        await ctx.editMessageReplyMarkup({ reply_markup: new InlineKeyboard() }).catch(() => {});
        const label = statusLabels[OrderStatus.CANCELLED];
        const msg = ctx.callbackQuery.message as { text?: string };
        await ctx.api.editMessageText(ctx.chat!.id, ctx.callbackQuery.message!.message_id, (msg?.text ?? '') + `\n\n❌ ${label}`).catch(() => {});
      }
    } catch (err) {
      logger.error(`Cancel order ${orderId} failed`, err);
      await ctx.answerCallbackQuery({ text: 'Xatolik yuz berdi.' }).catch(() => {});
    }
  });
}
