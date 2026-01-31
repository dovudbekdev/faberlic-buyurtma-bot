/**
 * Product card message template for Telegram.
 * Uses Markdown: bold title, emoji, separators, italic description.
 */

const SEPARATOR = '━━━━━━━━━━━━';

/** Escape Markdown special characters for Telegram (legacy Markdown) */
function escapeMarkdown(text: string): string {
  return text.replace(/([_*`\\])/g, '\\$1');
}

export interface ProductCardPayload {
  name: string;
  price: number;
  stock: number;
  description?: string | null;
  /** Selected quantity for "add to cart" context */
  selectedQty?: number;
}

/**
 * Builds product card caption for photo message.
 * Format: separator, bold title, price (💰), stock (📦), italic description.
 */
export function formatProductCard(payload: ProductCardPayload): string {
  const { name, price, stock, description, selectedQty = 1 } = payload;
  const safeName = escapeMarkdown(name);
  const lines: string[] = [
    SEPARATOR,
    `*${safeName}*`,
    SEPARATOR,
    `💰 _Narxi:_ ${Number(price).toLocaleString()} so'm`,
    `📦 _Omborda:_ ${stock} ta`,
  ];
  if (selectedQty > 0) {
    lines.push(`🛒 _Tanlangan:_ ${selectedQty} ta`);
  }
  if (description?.trim()) {
    lines.push('');
    lines.push(`_${escapeMarkdown(description.trim())}_`);
  }
  lines.push('');
  lines.push(SEPARATOR);
  return lines.join('\n');
}

/** Max caption length for Telegram (1024) */
export const CAPTION_MAX_LENGTH = 1024;

/**
 * Truncates caption to Telegram limit, appending "..." if needed.
 */
export function truncateCaption(caption: string, max = CAPTION_MAX_LENGTH): string {
  if (caption.length <= max) return caption;
  return caption.slice(0, max - 3) + '...';
}
