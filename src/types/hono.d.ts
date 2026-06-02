import 'hono';

declare module 'hono' {
  interface HonoRequest {
    validated?: unknown;
    validatedParams?: unknown;
  }
}
