const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const HTML_TAG = /<[^>]*>/g;

export function sanitizeString(value: string): string {
  return value.replace(CONTROL_CHARS, '').replace(HTML_TAG, '').trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(input: T): T {
  const result: any = { ...input };

  for (const key of Object.keys(result)) {
    const value = result[key];
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (value instanceof Date) {
      result[key] = value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }

  return result as T;
}
