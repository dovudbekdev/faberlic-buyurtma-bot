import { InlineKeyboard } from 'grammy';
import { Product } from 'src/modules/product/entities/product.entity';
import {
  PRODUCT_CALLBACK_PREFIX,
  PRODUCTS_PER_PAGE,
  LIST_PAGE_CALLBACK_PREFIX,
  BACK_MAIN_CALLBACK,
} from '../constants';

/**
 * Paginated product list: product buttons (max PRODUCTS_PER_PAGE per page),
 * then [◀️] [page/total] [▶️], then [⬅️ Ortga qaytish].
 * @param pageProducts Slice of products for current page (e.g. 5 items).
 * @param page 0-based page index.
 * @param totalPages Total number of pages.
 */
export function getProductListInlineKeyboard(
  pageProducts: Product[],
  page: number,
  totalPages: number,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  // One button per product on this page
  pageProducts.forEach((product, index) => {
    keyboard.text(
      String(index + 1),
      `${PRODUCT_CALLBACK_PREFIX}${product.id}`,
    );
  });
  keyboard.row();

  // Pagination: ◀️ | 1/3 | ▶️
  if (totalPages > 1) {
    const prevPage = Math.max(0, page - 1);
    const nextPage = Math.min(totalPages - 1, page + 1);
    if (page > 0) {
      keyboard.text('◀️', `${LIST_PAGE_CALLBACK_PREFIX}${prevPage}`);
    }
    keyboard.text(
      `${page + 1}/${totalPages}`,
      `list_page_noop:${page}`,
    );
    if (page < totalPages - 1) {
      keyboard.text('▶️', `${LIST_PAGE_CALLBACK_PREFIX}${nextPage}`);
    }
    keyboard.row();
  }

  keyboard.text('⬅️ Ortga qaytish', BACK_MAIN_CALLBACK);
  return keyboard;
}

/** Callback for "N/M" button (no-op to avoid accidental navigation) */
export const LIST_PAGE_NOOP_REGEX = /^list_page_noop:(\d+)$/;
