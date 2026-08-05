/**
 * Sanitizes user-provided strings by stripping HTML/script tags,
 * dangerous protocols, and inline event handlers to prevent XSS and script injection.
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove inline event attributes like onerror=, onload=, onclick=
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^"'\s>]+/gi, '')
    // Remove javascript: pseudo-protocol
    .replace(/javascript\s*:/gi, '')
    // Trim whitespace
    .trim();
}

/**
 * Recursively sanitizes string properties within an object.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return sanitizeString(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const sanitized = { ...obj } as Record<string, any>;
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  return sanitized as T;
}
