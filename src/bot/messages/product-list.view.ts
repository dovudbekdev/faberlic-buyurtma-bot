/**
 * Product list message template with cart status and pagination.
 */

import type { Product } from 'src/modules/product/entities/product.entity';

export interface CartSummary {
  totalItems: number;
  totalSum: number;
}

/**
 * Builds product list message: cart status line + numbered products + page.
 * Cart line: "🛒 Savat: 3 ta · 150 000 so'm" or "🛒 Savat: bo'sh"
 */
export function formatProductListMessage(
  cartSummary: CartSummary | null,
  products: Product[],
  page: number,
  totalPages: number,
): string {
  const lines: string[] = [];

  if (cartSummary && (cartSummary.totalItems > 0 || cartSummary.totalSum > 0)) {
    lines.push(
      `🛒 Savat: ${cartSummary.totalItems} ta · ${cartSummary.totalSum.toLocaleString()} so'm`,
    );
    lines.push('');
  } else {
    lines.push('🛒 Savat: bo\'sh');
    lines.push('');
  }

  if (!products.length) {
    lines.push("Hozircha mahsulotlar yo'q.");
  } else {
    products.forEach((p, i) => {
      lines.push(`${i + 1}. ${p.name} (${p.quantity ?? 0} ta)`);
    });
  }

  lines.push('');
  lines.push(`Sahifa ${page + 1}/${totalPages}`);
  return lines.join('\n');
}
