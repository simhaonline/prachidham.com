import { afterEach, describe, expect, it, vi } from 'vitest';
import { approveCatalogTranslation, createCatalogItem, getAdminCatalog, setCatalogPublished } from '../components/api';

describe('staff commerce API client', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses credentialed protected endpoints and never fabricates public prices', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify({ data: [], pagination: { total: 0 } }) });
    vi.stubGlobal('fetch', fetcher);
    await getAdminCatalog();
    expect(fetcher.mock.calls[0][0]).toBe('/api/v1/admin/catalog?limit=50&offset=0');
    expect(fetcher.mock.calls[0][1].credentials).toBe('include');
    await createCatalogItem({ kind: 'service', amountPaise: null, currency: 'INR' });
    expect(fetcher.mock.calls[1][1].method).toBe('POST');
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toMatchObject({ amountPaise: null });
  });

  it('requires a separate deliberate approval and publication call', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, text: async () => '{}' });
    vi.stubGlobal('fetch', fetcher);
    await approveCatalogTranslation('item-id', 'gu');
    await setCatalogPublished('item-id', true);
    expect(fetcher.mock.calls[0][0]).toContain('/translations/gu/approval');
    expect(fetcher.mock.calls[1][0]).toContain('/publication');
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({ published: true });
  });
});
