import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/modules/product/product.service';
import type { CartItem } from '../bot.context';
import type { CartLineItem, CartViewPayload } from '../messages/cart.view';

export interface AddToCartInput {
  cart: CartItem[];
  productId: number;
  quantity: number;
}

export interface UpdateQtyInput {
  cart: CartItem[];
  productId: number;
  delta: number;
}

@Injectable()
export class CartService {
  constructor(private readonly productService: ProductService) {}

  /**
   * Adds or merges item into cart. Returns new cart (immutable).
   */
  addItem(input: AddToCartInput): CartItem[] {
    const { cart, productId, quantity } = input;
    const copy = cart.map((i) => ({ ...i }));
    const existing = copy.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      copy.push({ productId, quantity });
    }
    return copy;
  }

  /**
   * Updates quantity by delta. Removes item if qty <= 0. Returns new cart.
   */
  updateQty(input: UpdateQtyInput): CartItem[] {
    const { cart, productId, delta } = input;
    const copy = cart.map((i) => ({ ...i }));
    const existing = copy.find((i) => i.productId === productId);
    if (!existing) return copy;
    existing.quantity = Math.max(0, existing.quantity + delta);
    return copy.filter((i) => i.quantity > 0);
  }

  /**
   * Removes item by productId. Returns new cart.
   */
  removeItem(cart: CartItem[], productId: number): CartItem[] {
    return cart.filter((i) => i.productId !== productId);
  }

  /**
   * Clears cart. Returns empty array.
   */
  clear(): CartItem[] {
    return [];
  }

  /**
   * Builds cart view payload (product names, prices, subtotals, total) for message.
   */
  async buildCartViewPayload(cart: CartItem[]): Promise<CartViewPayload> {
    const items: CartLineItem[] = [];
    let totalSum = 0;

    for (const item of cart) {
      try {
        const product = await this.productService.findOne(item.productId);
        const price = Number(product.price);
        const subtotal = price * item.quantity;
        totalSum += subtotal;
        items.push({
          productName: product.name,
          quantity: item.quantity,
          price,
          subtotal,
        });
      } catch {
        items.push({
          productName: `Mahsulot #${item.productId}`,
          quantity: item.quantity,
          price: 0,
          subtotal: 0,
        });
      }
    }

    return { items, totalSum };
  }

  /**
   * Returns total item count and total sum for cart status (e.g. product list header).
   */
  async getCartSummary(cart: CartItem[]): Promise<{
    totalItems: number;
    totalSum: number;
  }> {
    let totalSum = 0;
    let totalItems = 0;
    for (const item of cart) {
      totalItems += item.quantity;
      try {
        const product = await this.productService.findOne(item.productId);
        totalSum += Number(product.price) * item.quantity;
      } catch {
        // skip
      }
    }
    return { totalItems, totalSum };
  }
}
