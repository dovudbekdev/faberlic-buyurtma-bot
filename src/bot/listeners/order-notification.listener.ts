import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InlineKeyboard } from 'grammy';
import { ORDER_EVENTS } from 'src/modules/order/events/order.events';
import type { OrderCreatedEventPayload } from 'src/modules/order/events/order.events';
import type { OrderStatusChangedEventPayload } from 'src/modules/order/events/order.events';
import { OrderService } from 'src/modules/order/order.service';
import { AllConfigType } from 'src/config';
import { BotService } from '../bot.service';
import { formatAdminOrderMessage } from '../messages/order-admin.view';
import { getUserStatusMessage } from '../messages/order-user-notification.view';
import {
  getAdminOrderConfirmCallback,
  getAdminOrderCompleteCallback,
  getAdminOrderCancelCallback,
} from '../constants/admin.constant';

@Injectable()
export class OrderNotificationListener {
  private readonly logger = new Logger(OrderNotificationListener.name);

  constructor(
    private readonly botService: BotService,
    private readonly orderService: OrderService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  @OnEvent(ORDER_EVENTS.CREATED)
  async onOrderCreated(payload: OrderCreatedEventPayload): Promise<void> {
    const bot = this.botService.getBot();
    if (!bot) return;

    const order = await this.orderService.findOneWithDetails(payload.orderId);
    if (!order) {
      this.logger.warn(`Order ${payload.orderId} not found for admin notification`);
      return;
    }

    const adminIds = this.configService.get('tg.tgAdminIds', { infer: true }) ?? [];
    if (!adminIds.length) {
      this.logger.debug('No TG_ADMIN_IDS configured, skipping admin notification');
      return;
    }

    const text = formatAdminOrderMessage(order);
    const keyboard = new InlineKeyboard()
      .text('Tasdiqlash', getAdminOrderConfirmCallback(order.id))
      .text('Yakunlash', getAdminOrderCompleteCallback(order.id))
      .row()
      .text('Bekor qilish', getAdminOrderCancelCallback(order.id));

    for (const adminId of adminIds) {
      try {
        await bot.api.sendMessage(adminId, text, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      } catch (err) {
        this.logger.error(`Failed to send order notification to admin ${adminId}`, err);
      }
    }
  }

  @OnEvent(ORDER_EVENTS.STATUS_CHANGED)
  async onOrderStatusChanged(payload: OrderStatusChangedEventPayload): Promise<void> {
    const bot = this.botService.getBot();
    if (!bot) return;

    const order = await this.orderService.findOneWithDetails(payload.orderId);
    if (!order?.user) {
      this.logger.warn(`Order ${payload.orderId} or user not found for status notification`);
      return;
    }

    const tgId = order.user.tgId;
    const text = getUserStatusMessage(payload.newStatus);

    try {
      await bot.api.sendMessage(tgId, text);
    } catch (err) {
      this.logger.error(`Failed to send status notification to user ${tgId}`, err);
    }
  }
}
