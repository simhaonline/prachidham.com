import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isTrustedOrigin(origin: string | undefined, allowed: string | readonly string[]): boolean {
  if (!origin) return false;
  const candidates = typeof allowed === 'string' ? [allowed] : allowed;
  const actual = Buffer.from(origin);
  return candidates.some((candidate) => {
    const expected = Buffer.from(candidate);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
}

export function parseAllowedOrigins(value: string | undefined, fallback: string): string[] {
  const parsed = (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : [fallback];
}
