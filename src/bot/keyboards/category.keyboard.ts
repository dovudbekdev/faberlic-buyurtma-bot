import { Keyboard } from 'grammy';
import {
  CATEGORY_FACE,
  CATEGORY_COSMETICS,
  CATEGORY_CART,
  CATEGORY_CONTACT,
} from '../constants';

/**
 * Reply keyboard: Yuz parvarishi, Kosmetika, Savat, Aloqa
 */
export const categoryKeyboard = new Keyboard()
  .text(CATEGORY_FACE)
  .text(CATEGORY_COSMETICS)
  .row()
  .text(CATEGORY_CART)
  .text(CATEGORY_CONTACT)
  .resized()
  .persistent();
