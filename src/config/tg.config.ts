import { ConfigType, registerAs } from '@nestjs/config';

function parseAdminIds(value: string | undefined): number[] {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

export const tgConfig = registerAs('tg', () => ({
  tgBotToken: process.env.TG_BOT_TOKEN,
  tgAdminIds: parseAdminIds(process.env.TG_ADMIN_IDS),
}));

export type TgConfigType = ConfigType<typeof tgConfig>;
