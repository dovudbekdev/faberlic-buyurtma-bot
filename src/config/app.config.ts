import { ConfigType, registerAs } from '@nestjs/config';
import * as path from 'path';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.APP_PORT) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000/',
  uploadDir: path.join(process.cwd(), 'uploads'),
  filesPublicPath: process.env.FILES_PUBLIC_PATH || 'files',
  swaggerPath: process.env.SWAGGER_PATH || 'docs',
  enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
}));

export type AppConfigType = ConfigType<typeof appConfig>;
