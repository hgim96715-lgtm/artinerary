// env.validation.ts
import * as Joi from 'joi';
import { EnvKeys } from './env.keys';

export const envValidationSchema = Joi.object({
  [EnvKeys.DATABASE_URL]: Joi.string().uri().required(),
  [EnvKeys.POSTGRES_PORT]: Joi.number().port().optional(),
  [EnvKeys.POSTGRES_USER]: Joi.string().required(),
  [EnvKeys.POSTGRES_PASSWORD]: Joi.string().required(),
  [EnvKeys.POSTGRES_DB]: Joi.string().required().default('artinerary'),
  [EnvKeys.NODE_ENV]: Joi.string()
    .valid('dev', 'prod', 'production', 'test')
    .default('dev'),
  [EnvKeys.API_FORMAT]: Joi.string(),
  [EnvKeys.API_EXHIBITION_BASE_URL]: Joi.string().uri(),
  [EnvKeys.API_EXHIBITION_KEY]: Joi.string(),
  [EnvKeys.ADMIN_EMAIL]: Joi.string().email().required(),
  [EnvKeys.ADMIN_PASSWORD]: Joi.string().required(),
  [EnvKeys.JWT_SECRET]: Joi.string().required(),
  [EnvKeys.JWT_EXPIRES_IN]: Joi.string().required(),
  [EnvKeys.COOKIE_NAME]: Joi.string().default('artinerary-auth-token'),
  [EnvKeys.ADMIN_NICKNAME]: Joi.string(),
  [EnvKeys.FRONTEND_URL]: Joi.string().uri().optional(),
  [EnvKeys.ANTHROPIC_API_KEY]: Joi.string().optional(),
  [EnvKeys.S3_ACCOUNT_ID]: Joi.string().optional(),
  [EnvKeys.S3_ACCESS_KEY_ID]: Joi.string().optional(),
  [EnvKeys.S3_SECRET_ACCESS_KEY]: Joi.string().optional(),
  [EnvKeys.S3_BUCKET]: Joi.string().optional(),
  [EnvKeys.S3_ENDPOINT]: Joi.string().optional(),
  [EnvKeys.S3_PUBLIC_URL]: Joi.string().uri().optional(),
});
