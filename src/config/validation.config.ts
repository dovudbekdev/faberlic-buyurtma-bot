import * as Joi from 'joi';

export const validationConfig = Joi.object({
  NODE_ENV: Joi.string().required(),

  // App validation
  APP_PORT: Joi.number().required(),
  APP_API_PREFIX: Joi.string().required(),
  APP_BASE_URL: Joi.string().uri().required(),

  // Database validation
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Telegram Bot validation
  TG_BOT_TOKEN: Joi.string().required(),
  TG_ADMIN_IDS: Joi.string().optional().allow(''),
});
