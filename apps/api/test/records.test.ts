import { describe, expect, it, vi } from 'vitest';
import { RecordsService } from '../src/records.service';
import type { RequestUser } from '../src/types';
import type { Database } from '../src/database';

const staff: RequestUser = { id: 'actor', organizationId: 'tenant-A', organizationName: 'A', email: 'a@example.org', displayName: 'A', role: 'staff' };
const row = { id: 'record-A', module_key: 'bpm', title: 'Transport request', status: 'submitted', data: {}, created_at: new Date(), updated_at: new Date() };

describe('tenant and workflow boundaries', () => {
  it('includes tenant id in both list and count queries', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ total: '0' }] });
    const service = new RecordsService({ query } as unknown as Database);
    const result = await service.list(staff, 'crm', { limit: 25, offset: 0 }, 'Meera');
    expect(result.pagination.total).toBe(0);
    expect(query).toHaveBeenCalledTimes(2);
    for (const [sql, args] of query.mock.calls) {
      expect(sql).toContain('organization_id = $1');
      expect(args[0]).toBe('tenant-A');
    }
  });

  it('does not approve a submitted request for a staff user', async () => {
    const client = { query: vi.fn().mockResolvedValueOnce({ rows: [row] }) };
    const db = { transaction: (callback: (dbClient: typeof client) => Promise<unknown>) => callback(client) } as unknown as Database;
    const service = new RecordsService(db);
    await expect(service.transition(staff, 'record-A', 'approved')).rejects.toThrow();
    expect(client.query).toHaveBeenCalledTimes(1);
  });

  it('never reads a record without an organization-scoped predicate', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new RecordsService({ query } as unknown as Database);
    await expect(service.get(staff, 'crm', 'foreign-record')).rejects.toThrow();
    expect(query.mock.calls[0][0]).toContain('organization_id = $2');
    expect(query.mock.calls[0][1][1]).toBe('tenant-A');
  });

  it('creates a draft approval request without requiring a separate status mutation', async () => {
    const client = { query: vi.fn().mockResolvedValueOnce({ rows: [{ ...row, status: 'draft' }] }).mockResolvedValueOnce({ rows: [] }) };
    const db = { transaction: (callback: (dbClient: typeof client) => Promise<unknown>) => callback(client) } as unknown as Database;
    const service = new RecordsService(db);
    const created = await service.create(staff, 'bpm', { title: 'Transport request', status: 'draft', data: {} });
    expect(created.status).toBe('draft');
    expect(client.query.mock.calls[0][1][3]).toBe('draft');
  });
});
