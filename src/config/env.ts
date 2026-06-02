import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  CORS_ALLOW_CREDENTIALS: z.coerce.boolean().default(true),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_ISSUER: z.string().min(1).default('car-backend'),
  JWT_ACCESS_AUDIENCE: z.string().min(1).default('car-frontend'),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),

  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_ISSUER: z.string().min(1).default('car-backend'),
  JWT_REFRESH_AUDIENCE: z.string().min(1).default('car-frontend'),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(2592000),

  COOKIE_REFRESH_NAME: z.string().min(1).default('refresh_token'),
  COOKIE_SECURE: z.coerce.boolean().optional(),
  COOKIE_DOMAIN: z.string().optional(),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(20).default(12),

  PASSWORD_RESET_TTL_SECONDS: z.coerce.number().int().positive().default(3600),

  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),

  AUTH_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(900),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

  LOGIN_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(900),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  BRUTE_FORCE_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  BRUTE_FORCE_LOCKOUT_SECONDS: z.coerce.number().int().positive().default(900),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  EMAIL_FROM: z.string().min(1),

  SEED_ADMIN_NAME: z.string().min(1).default('System Admin'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('ChangeMe123!')
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  COOKIE_SECURE: parsed.COOKIE_SECURE ?? parsed.NODE_ENV === 'production'
};
