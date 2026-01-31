import { Bot } from 'grammy';
import { ProductService } from 'src/modules/product/product.service';
import { UserService } from 'src/modules/user/user.service';
import { OrderService } from 'src/modules/order/order.service';
import { CartService } from '../services/cart.service';
import { registerProductHandlers } from './product.handler';
import { registerCartHandlers } from './cart.handler';
import { registerMenuHandlers } from './menu.handler';
import type { BotContext } from '../bot.context';

export interface BotHandlerDeps {
  productService: ProductService;
  userService: UserService;
  orderService: OrderService;
  cartService: CartService;
}

/**
 * Registers all bot handlers: product (detail, qty, add to cart, back),
 * cart (view, clear, checkout), menu (category replies).
 * No business logic in handlers; they delegate to services.
 */
export function registerHandlers(bot: Bot<BotContext>, deps: BotHandlerDeps): void {
  const { productService, userService, orderService, cartService } = deps;

  registerProductHandlers(bot, productService, cartService, () =>
    productService.findAllInStock(),
  );
  registerCartHandlers(bot, cartService, productService, userService, orderService);
  registerMenuHandlers(bot, productService, cartService, userService, orderService);
}
