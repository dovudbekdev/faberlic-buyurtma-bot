/**
 * Cart view message template.
 */

const SEPARATOR = '━━━━━━━━━━━━';

export interface CartLineItem {
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartViewPayload {
  items: CartLineItem[];
  totalSum: number;
}

/**
 * Builds cart list message: product lines + total.
 */
export function formatCartView(payload: CartViewPayload): string {
  const { items, totalSum } = payload;
  if (!items.length) {
    return '🛒 Savat bo‘sh.';
  }
  const lines: string[] = ['🛒 *Savat*', SEPARATOR];
  for (const item of items) {
    lines.push(
      `• ${item.productName}: ${item.quantity} × ${item.price.toLocaleString()} = ${item.subtotal.toLocaleString()} so'm`,
    );
  }
  lines.push(SEPARATOR);
  lines.push(`💰 *Jami:* ${totalSum.toLocaleString()} so'm`);
  return lines.join('\n');
}
