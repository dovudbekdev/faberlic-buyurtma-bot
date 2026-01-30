import { ConfigType, registerAs } from '@nestjs/config';
import * as path from 'path';
import { NodeEnv } from 'src/common/enums';

export const i18nConfig = registerAs('i18n', () => ({
  fallbackLanguage: process.env.FALLBACK_LANGUAGE,
  loaderOptions: {
    path: path.join(__dirname, '../i18n/'),
    watch:
      process.env.NODE_ENV === NodeEnv.DEVELOPMENT ||
      process.env.NODE_ENV === NodeEnv.LOCAL,
  },
}));

export type I18nConfigType = ConfigType<typeof i18nConfig>;
