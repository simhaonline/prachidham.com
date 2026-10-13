import { describe, expect, it, vi } from 'vitest';
import type { Database } from '../src/database';
import type { RequestUser } from '../src/types';
import { parseCatalogItem, parseCatalogTranslation } from '../src/commerce.validation';
import { CatalogService } from '../src/commerce.service';

const owner: RequestUser = { id: 'actor', organizationId: 'tenant-A', organizationName: 'Prachi Dham', email: 'owner@example.test', displayName: 'Owner', role: 'owner' };
const staff: RequestUser = { ...owner, role: 'staff' };
const itemId = '6123c497-61bb-480a-9bc4-612930e3ac2d';

describe('catalog validation', () => {
  it('never accepts a product without an SKU or a negative price', () => {
    expect(() => parseCatalogItem({ kind: 'product', amountPaise: 100 })).toThrow();
    expect(() => parseCatalogItem({ kind: 'product', sku: 'BOOK-001', amountPaise: -1 })).toThrow();
    expect(() => parseCatalogItem({ kind: 'service', amountPaise: 2.5 })).toThrow();
    expect(parseCatalogItem({ kind: 'product', sku: 'BOOK-001', amountPaise: 12000 })).toMatchObject({ currency: 'INR', amountPaise: 12000 });
  });

  it('validates future-compatible locale codes and accepts Gujarati/Hindi UTF-8 text', () => {
    expect(parseCatalogTranslation({ locale: 'gu', slug: 'gau-seva', title: 'ગૌ સેવા', summary: 'સેવા અંગે માહિતી' }).title).toBe('ગૌ સેવા');
    expect(parseCatalogTranslation({ locale: 'hi', slug: 'gau-seva-hi', title: 'गौ सेवा', summary: 'सेवा के बारे में जानकारी' }).locale).toBe('hi');
    expect(() => parseCatalogTranslation({ locale: '../admin', slug: 'safe', title: 'Bad', summary: '' })).toThrow();
    expect(() => parseCatalogTranslation({ locale: 'en', slug: 'bad slug', title: 'Valid', summary: '' })).toThrow();
  });
});

describe('public catalog and publication', () => {
  it('filters public results by tenant, published status, requested locale and approved translation', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ total: '0' }] });
    const service = new CatalogService({ query } as unknown as Database);
    const response = await service.listPublic('gu', 'product', 20, 0);
    expect(response).toMatchObject({ data: [], pagination: { total: 0 } });
    const [sql, args] = query.mock.calls[0];
    expect(sql).toContain('organizations');
    expect(sql).toContain('publication_status = \'published\'');
    expect(sql).toContain("review_status = 'approved'");
    expect(args).toContain('gu');
    expect(args).toContain('product');
  });

  it('retrieves approved sibling slugs without exposing draft translations', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: itemId, slug: 'seva-hi', alternateSlugs: { en: 'seva-en', hi: 'seva-hi', gu: 'seva-gu' } }] });
    const detail = await new CatalogService({ query } as unknown as Database).getPublic('hi', 'seva-hi');
    expect(detail.alternateSlugs.gu).toBe('seva-gu');
    expect(query.mock.calls[0][0]).toContain('jsonb_object_agg');
    expect(query.mock.calls[0][0]).toContain("review_status = 'approved'");
  });

  it('denies staff from publishing even if they know an item identifier', async () => {
    const query = vi.fn();
    const service = new CatalogService({ query } as unknown as Database);
    await expect(service.setPublished(staff, itemId, true)).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses a product with missing reviewed languages or price, and does not write an audit event', async () => {
    const client = { query: vi.fn().mockResolvedValueOnce({ rows: [{ kind: 'product', amount_paise: null, publication_status: 'draft' }] }).mockResolvedValueOnce({ rows: [{ locale: 'en' }] }) };
    const db = { transaction: (fn: (c: typeof client) => Promise<unknown>) => fn(client) } as unknown as Database;
    const service = new CatalogService(db);
    await expect(service.setPublished(owner, itemId, true)).rejects.toThrow();
    expect(client.query).toHaveBeenCalledTimes(2);
    expect(client.query.mock.calls[0][1]).toContain('tenant-A');
  });

  it('writes an audit record in the same transaction when publishing a reviewed listing', async () => {
    const client = { query: vi.fn()
      .mockResolvedValueOnce({ rows: [{ kind: 'service', amount_paise: null, publication_status: 'draft' }] })
      .mockResolvedValueOnce({ rows: [{ locale: 'en' }, { locale: 'hi' }, { locale: 'gu' }] })
      .mockResolvedValueOnce({ rows: [{ id: itemId, publication_status: 'published' }] })
      .mockResolvedValueOnce({ rows: [] }) };
    const db = { transaction: (fn: (c: typeof client) => Promise<unknown>) => fn(client) } as unknown as Database;
    const result = await new CatalogService(db).setPublished(owner, itemId, true);
    expect(result.publication_status).toBe('published');
    expect(client.query.mock.calls.at(-1)?.[0]).toContain('audit_events');
  });
});
