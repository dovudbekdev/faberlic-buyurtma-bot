import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.APP_PORT) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000/',
}));

export type AppConfigType = ConfigType<typeof appConfig>;
