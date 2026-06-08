// env.validation.ts
import * as Joi from 'joi';
import { EnvKeys } from './env.keys';

export const envValidationSchema = Joi.object({
  [EnvKeys.DATABASE_URL]: Joi.string().uri().required(),
  [EnvKeys.POSTGRES_PORT]: Joi.number().port().optional(),
  [EnvKeys.POSTGRES_USER]: Joi.string().required(),
  [EnvKeys.POSTGRES_PASSWORD]: Joi.string().required(),
  [EnvKeys.POSTGRES_DB]: Joi.string().required().default('artinerary'),
  [EnvKeys.NODE_ENV]: Joi.string().valid('dev', 'prod', 'test').default('dev'),
});
