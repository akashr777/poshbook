export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export function ok<T>(c: any, data: T, status = 200) {
  return c.json({ data }, { status });
}

export function fail(c: any, error: ApiError, status: number) {
  return c.json({ error }, { status });
}

