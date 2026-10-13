import { describe, expect, it } from 'vitest';
import { hashSessionToken, isTrustedOrigin, newSessionToken, parseAllowedOrigins } from '../src/auth-crypto';

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

  it('accepts any origin in a split-domain allowlist but still rejects lookalikes', () => {
    const allowed = ['https://prachidham.com', 'https://platform.prachidham.com'];
    expect(isTrustedOrigin('https://prachidham.com', allowed)).toBe(true);
    expect(isTrustedOrigin('https://platform.prachidham.com', allowed)).toBe(true);
    expect(isTrustedOrigin('https://platform.prachidham.com.evil.test', allowed)).toBe(false);
    expect(isTrustedOrigin('https://evil.test', allowed)).toBe(false);
    expect(isTrustedOrigin(undefined, allowed)).toBe(false);
  });

  it('parses a comma-separated allowlist and falls back to a single origin', () => {
    expect(parseAllowedOrigins('https://a.test, https://b.test', 'https://fallback.test')).toEqual(['https://a.test', 'https://b.test']);
    expect(parseAllowedOrigins('', 'https://fallback.test')).toEqual(['https://fallback.test']);
    expect(parseAllowedOrigins(undefined, 'https://fallback.test')).toEqual(['https://fallback.test']);
    expect(parseAllowedOrigins('  ,  ', 'https://fallback.test')).toEqual(['https://fallback.test']);
  });
});
