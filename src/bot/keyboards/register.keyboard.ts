import { Markup } from "telegraf";

export const phoneKeyboard = Markup.keyboard([
    [
        Markup.button.contactRequest('📲 Telefon raqamni yuborish')
    ]
]).resize().oneTime();