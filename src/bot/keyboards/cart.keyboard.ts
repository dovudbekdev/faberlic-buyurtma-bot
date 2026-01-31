import { InlineKeyboard } from 'grammy';
import {
  CART_CHECKOUT_CALLBACK,
  CART_CLEAR_CALLBACK,
  CART_CONTINUE_CALLBACK,
  BACK_MAIN_CALLBACK,
} from '../constants';

/**
 * Cart view inline: ➕ Davom etish | ❌ Tozalash | ✅ Buyurtma berish
 * Empty cart: ⬅️ Ortga qaytish
 */
export function getCartKeyboard(hasItems: boolean): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  if (hasItems) {
    keyboard
      .text('➕ Davom etish', CART_CONTINUE_CALLBACK)
      .text('❌ Tozalash', CART_CLEAR_CALLBACK)
      .text('✅ Buyurtma berish', CART_CHECKOUT_CALLBACK)
      .row();
  }
  keyboard.text('⬅️ Ortga qaytish', BACK_MAIN_CALLBACK);
  return keyboard;
}
