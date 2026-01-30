import { ConfigType, registerAs } from "@nestjs/config";

export const tgConfig = registerAs("tg", ()=>({
    tgBotToken: process.env.TG_BOT_TOKEN
}))

export type TgConfigType = ConfigType<typeof tgConfig>;