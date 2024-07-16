import * as Joi from "joi";

const schema = {
  MODE: Joi.string().valid('dev', 'prod').default('dev'),
  PORT: Joi.number().min(3000).max(9000).default(8081),
  JWT_SECRET: Joi.string().required(),
  MONGO_CONNECTION: Joi.string().required()
};
export const serviceSchema = Joi.object(schema);
export type ConfigVariables = typeof schema;