import { Keyboard } from 'grammy';
import {
  MAIN_MENU_ORDER_BUTTON,
  MAIN_MENU_CART_BUTTON,
  MAIN_MENU_MY_ORDERS_BUTTON,
  MAIN_MENU_INFO_BUTTON,
} from '../constants';

/** Main menu: Buyurtma berish, Savat, Buyurtmalarim, Ma'lumot */
export const mainMenuKeyboard = new Keyboard()
  .text(MAIN_MENU_ORDER_BUTTON)
  .text(MAIN_MENU_CART_BUTTON)
  .row()
  .text(MAIN_MENU_MY_ORDERS_BUTTON)
  .text(MAIN_MENU_INFO_BUTTON)
  .resized()
  .oneTime();
