import { Context, type SessionFlavor } from 'grammy';
import type { ConversationFlavor } from '@grammyjs/conversations';

export interface CartItem {
  productId: number;
  quantity: number;
}

/** Optional: last screen for analytics / back navigation */
export enum BotScreen {
  MAIN_MENU = 'main_menu',
  PRODUCT_LIST = 'product_list',
  PRODUCT_VIEW = 'product_view',
  CART = 'cart',
  CHECKOUT = 'checkout',
}

export interface SessionData {
  cart: CartItem[];
  /** Optional: current/last screen */
  screen?: BotScreen;
}

export type BotContext = Context &
  SessionFlavor<SessionData> &
  ConversationFlavor<Context>;
