import { Markup } from 'telegraf';
import { MAIN_MENU_ORDER_BUTTON } from '../constants';

export const mainMenuKeyboard = Markup.keyboard([
  [Markup.button.text(MAIN_MENU_ORDER_BUTTON)],
]).resize().oneTime();
