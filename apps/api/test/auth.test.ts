import { describe, expect, it } from 'vitest';
import { hashSessionToken, isTrustedOrigin, newSessionToken } from '../src/auth-crypto';

describe('session security', () => {
  it('generates opaque tokens and stores only deterministic hashes', () => {
    const token = newSessionToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(hashSessionToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).not.toBe(token);
  });

  it('accepts the configured exact origin and rejects lookalikes or missing origins', () => {
    expect(isTrustedOrigin('https://ops.prachidham.org', 'https://ops.prachidham.org')).toBe(true);
    expect(isTrustedOrigin('https://ops.prachidham.org.evil.test', 'https://ops.prachidham.org')).toBe(false);
    expect(isTrustedOrigin(undefined, 'https://ops.prachidham.org')).toBe(false);
  });
});
