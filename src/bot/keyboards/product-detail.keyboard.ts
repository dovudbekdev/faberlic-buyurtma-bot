import { InlineKeyboard } from 'grammy';
import { ADD_TO_CART_REGEX } from '../constants';

const QUANTITY_OPTIONS = [1, 2, 3, 5, 10] as const;

/** Legacy: fixed quantity buttons (addCart:productId:qty) */
export function getProductDetailKeyboard(productId: number): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  keyboard.row(
    ...QUANTITY_OPTIONS.map((qty) =>
      InlineKeyboard.text(`${qty} ta`, `addCart:${productId}:${qty}`),
    ),
  );
  return keyboard;
}

const MIN_QTY = 1;
const MAX_QTY = 99;

/**
 * Product detail inline: ➖ | N ta | ➕, row: 🛒 Savatga qo'shish, row: ⬅️ Orqaga
 * Callbacks: qty_minus:productId:qty, qty_plus:productId:qty, add_to_cart:productId:qty, back_list
 */
export function getProductDetailKeyboardWithQty(
  productId: number,
  currentQty: number,
): InlineKeyboard {
  const qty = Math.max(MIN_QTY, Math.min(MAX_QTY, currentQty));
  return new InlineKeyboard()
    .text('➖', `qty_minus:${productId}:${qty}`)
    .text(`${qty} ta`, `noop:${productId}:${qty}`)
    .text('➕', `qty_plus:${productId}:${qty}`)
    .row()
    .text("🛒 Savatga qo'shish", `add_to_cart:${productId}:${qty}`)
    .row()
    .text('⬅️ Ortga qaytish', 'back_list');
}

/** Used to ignore "N ta" button click (noop) */
export const PRODUCT_QTY_NOOP_REGEX = /^noop:(\d+):(\d+)$/;
