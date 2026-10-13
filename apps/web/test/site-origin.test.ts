import { describe, expect, it } from 'vitest';
import { getSiteOrigin, isSiteIndexable } from '../lib/site-origin';

describe('configured public origin', () => {
  it('omits absolute metadata until a real origin is supplied', () => {
    expect(getSiteOrigin(undefined)).toBeUndefined();
    expect(getSiteOrigin('')).toBeUndefined();
  });

  it('accepts only a clean HTTPS origin', () => {
    expect(getSiteOrigin('https://prachidham.example')).toBe('https://prachidham.example');
    expect(getSiteOrigin('https://prachidham.example/')).toBe('https://prachidham.example');
    expect(() => getSiteOrigin('http://prachidham.example')).toThrow();
    expect(() => getSiteOrigin('https://prachidham.example/staff')).toThrow();
    expect(() => getSiteOrigin('https://user:pass@prachidham.example')).toThrow();
  });

  it('fails closed unless both a valid origin and exact indexability switch are present', () => {
    expect(isSiteIndexable(undefined, 'true')).toBe(false);
    expect(isSiteIndexable('https://prachidham.example', undefined)).toBe(false);
    expect(isSiteIndexable('https://prachidham.example', 'TRUE')).toBe(false);
    expect(isSiteIndexable('https://prachidham.example', 'true')).toBe(true);
  });
});
