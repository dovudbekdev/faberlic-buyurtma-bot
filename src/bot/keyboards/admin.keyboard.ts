import { Keyboard } from 'grammy';
import {
  ADMIN_MENU_PENDING_ORDERS,
  ADMIN_MENU_ALL_ORDERS,
  ADMIN_MENU_COMPLETE_DELIVERED,
} from '../constants/admin.constant';

/** Admin main menu: Kutilayotgan buyurtmalar, Barcha buyurtmalar, Topshirilganlarni yakunlash */
export const adminMainKeyboard = new Keyboard()
  .text(ADMIN_MENU_PENDING_ORDERS)
  .text(ADMIN_MENU_ALL_ORDERS)
  .row()
  .text(ADMIN_MENU_COMPLETE_DELIVERED)
  .resized()
  .oneTime();
