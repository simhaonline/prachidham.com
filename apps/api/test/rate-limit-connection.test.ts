import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { client, RedisCtor } = vi.hoisted(() => {
  const client = {
    status: 'wait' as string,
    connect: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  };
  return { client, RedisCtor: vi.fn(() => client) };
});

vi.mock('ioredis', () => ({ default: RedisCtor }));

import { RateLimitService } from '../src/rate-limit.service';

const originalNodeEnv = process.env.NODE_ENV;
const originalValkey = process.env.VALKEY_URL;

beforeEach(() => {
  vi.clearAllMocks();
  client.status = 'wait';
  client.connect.mockImplementation(async () => { client.status = 'ready'; });
  client.incr.mockResolvedValue(1);
  client.expire.mockResolvedValue(1);
  process.env.VALKEY_URL = 'redis://:password@valkey.test:6379/0';
  process.env.NODE_ENV = 'production';
});

afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalNodeEnv;
  if (originalValkey === undefined) delete process.env.VALKEY_URL; else process.env.VALKEY_URL = originalValkey;
});

describe('rate limiter connection handling', () => {
  it('shares a single connect attempt across concurrent checks instead of failing the first request', async () => {
    const limiter = new RateLimitService();

    // Login and inquiry both run two checks together; the second connect() used
    // to reject and surface as a 503 on the very first request after startup.
    const results = await Promise.all([limiter.check('account', 5, 60), limiter.check('global', 5, 60)]);

    expect(results).toEqual([true, true]);
    expect(client.connect).toHaveBeenCalledTimes(1);
    expect(client.incr).toHaveBeenCalledTimes(2);
  });

  it('does not reconnect when the client is already ready', async () => {
    client.status = 'ready';
    const limiter = new RateLimitService();

    await limiter.check('account', 5, 60);

    expect(client.connect).not.toHaveBeenCalled();
  });

  it('still fails closed in production when a command cannot reach the provider', async () => {
    client.connect.mockImplementation(async () => { throw new Error('unreachable'); });
    client.incr.mockRejectedValue(new Error('unreachable'));
    const limiter = new RateLimitService();

    await expect(limiter.check('account', 5, 60)).rejects.toThrow();
  });
});
