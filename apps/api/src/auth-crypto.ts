import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isTrustedOrigin(origin: string | undefined, allowedOrigin: string): boolean {
  if (!origin) return false;
  const actual = Buffer.from(origin);
  const expected = Buffer.from(allowedOrigin);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
