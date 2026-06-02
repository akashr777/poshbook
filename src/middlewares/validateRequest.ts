import { z, ZodSchema } from 'zod';
import { sanitizeObject } from '../utils/sanitize.js';

type Source = 'json' | 'query' | 'form';

export function validateRequest<T extends ZodSchema>(schema: T, source: Source = 'json') {
  return async (c: any, next: () => Promise<void>) => {
    const input = await (async () => {
      if (source === 'json') return c.req.json().catch(() => undefined);
      if (source === 'query') return c.req.query();
      const form = await c.req.formData();
      return Object.fromEntries(form.entries());
    })();

    const parsed = schema.parse(input);
    c.req.validated =
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? sanitizeObject(parsed as Record<string, unknown>)
        : parsed;
    await next();
  };
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return async (c: any, next: () => Promise<void>) => {
    const parsed = schema.parse(c.req.param());
    c.req.validatedParams = parsed;
    await next();
  };
}

