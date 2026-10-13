import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { AppController } from '../src/controllers';
import type { AuthService } from '../src/auth.service';
import type { RateLimitService } from '../src/rate-limit.service';
import type { RecordsService } from '../src/records.service';
import type { DashboardService } from '../src/dashboard.service';
import type { SpecialistService } from '../src/specialist.service';

describe('login throttle identity', () => {
  it('uses a normalized account key independent of a client-supplied forwarding header', async () => {
    const limiter = { check: vi.fn().mockResolvedValue(true) };
    const auth = { login: vi.fn().mockResolvedValue({ token: 'opaque', user: { id: 'user' } }) };
    const controller = new AppController(
      auth as unknown as AuthService,
      limiter as unknown as RateLimitService,
      {} as RecordsService, {} as DashboardService, {} as SpecialistService,
    );
    const response = { cookie: vi.fn() } as unknown as Response;
    const body = { email: '  PREVIEW@PRACHIDHAM.TEST  ', password: 'PasswordWith16Chars!' };
    const requestA = { ip: '203.0.113.1', headers: { 'x-forwarded-for': '203.0.113.1' } } as unknown as Request;
    const requestB = { ip: '198.51.100.9', headers: { 'x-forwarded-for': '198.51.100.9' } } as unknown as Request;
    await controller.login(body, requestA, response);
    await controller.login(body, requestB, response);
    const keys = limiter.check.mock.calls.map((call: unknown[]) => String(call[0]));
    expect(keys.filter((key: string) => key.startsWith('login:account:'))).toHaveLength(2);
    expect(keys[0]).toBe(keys[2]);
    expect(keys.every((key: string) => !key.includes('203.0.113.1') && !key.includes('198.51.100.9'))).toBe(true);
  });
});
