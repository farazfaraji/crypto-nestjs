import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  EMAIL_INTERVAL_IN_SECONDS: Joi.number().required(),
  EXCHANGE_API_KEY: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_SYNC: Joi.number().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  MAIL_SENDER_HOST: Joi.string().required(),
  MAIL_SENDER_ADDRESS: Joi.string().required(),
  MAIL_SENDER_PORT: Joi.number().required(),
  MAIL_SENDER_PASSWORD: Joi.string().required(),
});
