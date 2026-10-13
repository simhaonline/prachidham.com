import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Database } from '../src/database';
import type { RateLimitService } from '../src/rate-limit.service';
import type { RequestUser } from '../src/types';
import { CommerceInquiryService } from '../src/commerce-inquiry.service';
import { parseInquiryInput } from '../src/commerce-inquiry.validation';

const id = '6123c497-61bb-480a-9bc4-612930e3ac2d';
const input = { name: 'Example Visitor', email: 'visitor@example.test', locale: 'gu', acceptedPolicy: true, items: [{ id, quantity: 2 }] };
const owner: RequestUser = { id, organizationId: 'tenant-A', organizationName: 'A', email: 'a@example.test', displayName: 'A', role: 'owner' };

describe('non-transactional commerce inquiries', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('rejects duplicate items, forged totals and missing consent', () => {
    expect(() => parseInquiryInput({ ...input, items: [input.items[0], input.items[0]] })).toThrow();
    expect(() => parseInquiryInput({ ...input, amountPaise: 1 })).toThrow();
    expect(() => parseInquiryInput({ ...input, acceptedPolicy: false })).toThrow();
  });

  it('cannot collect contact data with the feature or reviewed policy disabled', async () => {
    vi.stubEnv('PUBLIC_COMMERCE_INQUIRIES_ENABLED', 'false');
    const query = vi.fn();
    const service = new CommerceInquiryService({ query } as unknown as Database, { check: vi.fn() } as unknown as RateLimitService);
    expect(service.configuration().inquiriesEnabled).toBe(false);
    await expect(service.create(parseInquiryInput(input))).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });

  it('re-reads published prices from the tenant catalog and stores only an inquiry, never a paid order', async () => {
    vi.stubEnv('PUBLIC_COMMERCE_INQUIRIES_ENABLED', 'true');
    vi.stubEnv('COMMERCE_POLICY_VERSION', '2026-10-approved');
    vi.stubEnv('PUBLIC_PRIVACY_POLICY_URL', 'https://example.org/privacy');
    const query = vi.fn().mockResolvedValueOnce({ rows: [{ id: 'tenant-A' }] });
    const client = { query: vi.fn()
      .mockResolvedValueOnce({ rows: [{ id, amount_paise: 12500, title: 'Reviewed item' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'inquiry-id', status: 'pending_review' }] })
      .mockResolvedValueOnce({ rows: [] }) };
    const db = { query, transaction: (fn: (c: typeof client) => Promise<unknown>) => fn(client) } as unknown as Database;
    const service = new CommerceInquiryService(db, { check: vi.fn().mockResolvedValue(true) } as unknown as RateLimitService);
    const result = await service.create(parseInquiryInput(input));
    expect(result.status).toBe('pending_review');
    expect(client.query.mock.calls[0][0]).toContain("publication_status = 'published'");
    expect(client.query.mock.calls[2][1]).toContain(12500);
    expect(client.query.mock.calls.map(([sql]) => sql).join(' ')).not.toContain('UPDATE payments');
  });

  it('scopes management results to the signed-in organization', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ total: '0' }] });
    const service = new CommerceInquiryService({ query } as unknown as Database, { check: vi.fn() } as unknown as RateLimitService);
    await service.listAdmin(owner, 20, 0);
    expect(query.mock.calls[0][1][0]).toBe('tenant-A');
    await expect(service.listAdmin({ ...owner, role: 'staff' }, 20, 0)).rejects.toThrow();
  });

  it('audits a tenant-scoped inquiry status change and rejects ordinary staff', async () => {
    const client = { query: vi.fn().mockResolvedValueOnce({ rows: [{ id, status: 'contacted' }] }).mockResolvedValueOnce({ rows: [] }) };
    const db = { transaction: (fn: (c: typeof client) => Promise<unknown>) => fn(client) } as unknown as Database;
    const service = new CommerceInquiryService(db, { check: vi.fn() } as unknown as RateLimitService);
    await expect(service.updateStatus({ ...owner, role: 'staff' }, id, 'contacted')).rejects.toThrow();
    expect(client.query).not.toHaveBeenCalled();
    const updated = await service.updateStatus(owner, id, 'contacted');
    expect(updated.status).toBe('contacted');
    expect(client.query.mock.calls[0][1]).toContain('tenant-A');
    expect(client.query.mock.calls[1][0]).toContain('audit_events');
  });
});
