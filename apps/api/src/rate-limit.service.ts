import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RateLimitService {
  private readonly redis = process.env.VALKEY_URL
    ? new Redis(process.env.VALKEY_URL, { lazyConnect: true, maxRetriesPerRequest: 2, connectTimeout: 2_000 })
    : null;
  private readonly local = new Map<string, { count: number; expires: number }>();
  private connecting: Promise<unknown> | null = null;

  async check(key: string, maximum = 5, windowSeconds = 900): Promise<boolean> {
    if (!this.redis) {
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Authentication protection is not configured.');
      }
      return this.checkLocal(key, maximum, windowSeconds);
    }
    try {
      await this.ensureConnected();
      const count = await this.redis.incr(key);
      if (count === 1) await this.redis.expire(key, windowSeconds);
      return count <= maximum;
    } catch {
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Authentication protection is temporarily unavailable.');
      }
      return this.checkLocal(key, maximum, windowSeconds);
    }
  }

  // Concurrent callers (login checks account and global limits together) must
  // share one connection attempt: a second ioredis connect() while one is in
  // flight rejects, and commands issued before "ready" would otherwise fail.
  // Sharing the attempt lets queued commands run once the socket is ready, and
  // a genuine outage still surfaces as a rejected command.
  private ensureConnected(): Promise<unknown> {
    if (!this.redis || this.redis.status === 'ready') return Promise.resolve();
    if (!this.connecting) {
      this.connecting = Promise.resolve()
        .then(() => this.redis!.connect())
        .catch(() => undefined)
        .finally(() => { this.connecting = null; });
    }
    return this.connecting;
  }

  private checkLocal(key: string, maximum: number, windowSeconds: number): boolean {
    const now = Date.now();
    const value = this.local.get(key);
    const current = !value || value.expires <= now ? { count: 0, expires: now + windowSeconds * 1000 } : value;
    current.count += 1;
    this.local.set(key, current);
    return current.count <= maximum;
  }
}
