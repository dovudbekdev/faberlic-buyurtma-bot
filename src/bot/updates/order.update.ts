import { Update, Hears, Action, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Logger } from '@nestjs/common';
import { ProductService } from 'src/modules/product/product.service';
import { MAIN_MENU_ORDER_BUTTON } from '../constants';
import { getProductListInlineKeyboard } from '../keyboards';
import {
  formatProductList,
  formatProductDetail,
} from '../helpers/product-formatter.helper';

const PRODUCT_ACTION_REGEX = /^product:(\d+)$/;
const MAX_MEDIA_GROUP_SIZE = 10;
const CAPTION_MAX_LENGTH = 1024;

@Update()
export class OrderUpdate {
  private readonly logger = new Logger(OrderUpdate.name);

  constructor(private readonly productService: ProductService) { }

  @Hears(MAIN_MENU_ORDER_BUTTON)
  async onOrder(ctx: Context) {
    try {
      const products = await this.productService.findAll();
      if (!products.length) {
        await ctx.reply("Hozircha mahsulotlar yo'q.");
        return;
      }
      const listText = formatProductList(products);
      const keyboard = getProductListInlineKeyboard(products);
      await ctx.reply(listText, { reply_markup: keyboard.reply_markup });
    } catch (error) {
      this.logger.error('Mahsulotlar ro\'yxatini yuborishda xatolik', error);
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  }

  @Action(PRODUCT_ACTION_REGEX)
  async onProductSelect(@Ctx() ctx: Context) {
    const callbackQuery = 'callback_query' in ctx.update ? ctx.update.callback_query : undefined;
    const data = callbackQuery && 'data' in callbackQuery ? callbackQuery.data : undefined;
    if (!data || typeof data !== 'string') return;

    const match = data.match(PRODUCT_ACTION_REGEX);
    const productId = match ? parseInt(match[1], 10) : null;
    if (productId == null) return;

    await ctx.answerCbQuery().catch(() => { });

    try {
      const product = await this.productService.findOne(productId);
      const caption = formatProductDetail(product);
      const callbackMessage =
        'callback_query' in ctx.update
          ? ctx.update.callback_query?.message
          : undefined;
      const chatId =
        ctx.chat?.id ??
        (callbackMessage && 'chat' in callbackMessage
          ? callbackMessage.chat.id
          : undefined);
      if (!chatId) {
        await ctx.reply('Xatolik: chat topilmadi.');
        return;
      }

      const images = product.images && Array.isArray(product.images) ? product.images : [];
      const validUrls = images.filter(
        (url): url is string => typeof url === 'string' && url.length > 0,
      );

      if (validUrls.length > 0) {
        const captionTrimmed =
          caption.length > CAPTION_MAX_LENGTH
            ? caption.slice(0, CAPTION_MAX_LENGTH - 3) + '...'
            : caption;
        const mediaSlice = validUrls.slice(0, MAX_MEDIA_GROUP_SIZE).map((url, i) => ({
          type: 'photo' as const,
          media: url,
          caption: i === 0 ? captionTrimmed : undefined,
        }));
        await ctx.telegram.sendMediaGroup(chatId, mediaSlice);
        if (validUrls.length > MAX_MEDIA_GROUP_SIZE) {
          const rest = validUrls.slice(MAX_MEDIA_GROUP_SIZE);
          await ctx.telegram.sendMediaGroup(
            chatId,
            rest.map((url) => ({ type: 'photo' as const, media: url })),
          );
        }
      } else {
        await ctx.telegram.sendMessage(chatId, caption);
      }
    } catch (error) {
      this.logger.warn(`Mahsulot topilmadi yoki xatolik: productId=${productId}`, error);
      await ctx.reply('Mahsulot topilmadi.').catch(() => { });
    }
  }
}
