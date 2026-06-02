import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { errors as joseErrors } from 'jose';
import { logger } from '../utils/logger';

export function errorHandler(err: unknown, c: { json: (body: unknown, status: number) => Response }) {
  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: err.flatten()
        }
      },
      400
    );
  }

  if (err instanceof HTTPException) {
    return c.json({ error: { message: err.message, code: 'HTTP_EXCEPTION' } }, err.status);
  }

  if (err instanceof joseErrors.JOSEError) {
    return c.json({ error: { message: 'Invalid token', code: 'INVALID_TOKEN' } }, 401);
  }

  const code = (err as { code?: string }).code;
  if (code === 'EMAIL_EXISTS') {
    return c.json({ error: { message: 'Email already in use', code: 'EMAIL_EXISTS' } }, 409);
  }

  logger.error({ err }, 'unhandled error');
  return c.json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } }, 500);
}
