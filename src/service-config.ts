import * as Joi from "joi";

const schema = {
  MODE: Joi.string().valid('dev', 'prod').default('dev'),
  PORT: Joi.number().min(3000).max(9000),
  JWT_SECRET: Joi.string().required(),
  MONGO_CONNECTION: Joi.string().required(),
  HOST: Joi.string().required(),
  //EMAIL_MODULE
  EMAIL_HOST: Joi.string().required(),
  EMAIL_USERNAME: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  //seed
  USER_ADMIN_EMAIL: Joi.string().email().required(),
  USER_ADMIN_PASSWORD: Joi.string().required(),
  RMQ_URL: Joi.string().required()
};
export const serviceSchema = Joi.object(schema);
export type ConfigVariables = typeof schema;