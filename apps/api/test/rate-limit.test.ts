import { afterEach, describe, expect, it } from 'vitest';
import { RateLimitService } from '../src/rate-limit.service';

const originalNodeEnv = process.env.NODE_ENV;
const originalValkey = process.env.VALKEY_URL;

afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalValkey === undefined) delete process.env.VALKEY_URL;
  else process.env.VALKEY_URL = originalValkey;
});

describe('login throttling', () => {
  it('fails closed in production when Valkey is not configured', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.VALKEY_URL;
    const limiter = new RateLimitService();
    await expect(limiter.check('login:example')).rejects.toThrow();
  });

  it('bounds repeated attempts when running a local development fallback', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.VALKEY_URL;
    const limiter = new RateLimitService();
    expect(await limiter.check('login:example', 2)).toBe(true);
    expect(await limiter.check('login:example', 2)).toBe(true);
    expect(await limiter.check('login:example', 2)).toBe(false);
  });
});
