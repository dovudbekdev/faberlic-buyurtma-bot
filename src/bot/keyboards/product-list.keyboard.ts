import { Markup } from 'telegraf';
import { Product } from 'src/modules/product/entities/product.entity';
import {
  PRODUCT_CALLBACK_PREFIX,
  PRODUCT_BUTTONS_PER_ROW,
} from '../constants';

export function getProductListInlineKeyboard(products: Product[]) {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];
  let currentRow: ReturnType<typeof Markup.button.callback>[] = [];

  products.forEach((product, index) => {
    const button = Markup.button.callback(
      String(index + 1),
      `${PRODUCT_CALLBACK_PREFIX}${product.id}`,
    );
    currentRow.push(button);

    if (
      currentRow.length === PRODUCT_BUTTONS_PER_ROW ||
      index === products.length - 1
    ) {
      rows.push([...currentRow]);
      currentRow = [];
    }
  });

  return Markup.inlineKeyboard(rows);
}
