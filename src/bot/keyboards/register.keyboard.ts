import { Keyboard } from 'grammy';

export const phoneKeyboard = new Keyboard()
  .requestContact('📲 Telefon raqamni yuborish')
  .resized()
  .oneTime();
