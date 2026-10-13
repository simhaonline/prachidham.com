import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDistance, summarizeNote } from '../components/api';

afterEach(() => vi.unstubAllGlobals());

describe('specialist service browser client', () => {
  it('returns validated distance through the same-origin API', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '{"kilometers":111.19}' });
    vi.stubGlobal('fetch', fetch);
    const result = await getDistance({ lat1: 0, lon1: 0, lat2: 0, lon2: 1 });
    expect(result.kilometers).toBe(111.19);
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/geo/distance?lat1=0&lon1=0&lat2=0&lon2=1');
  });

  it('submits only the supplied note to the authorized summary endpoint', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 201, text: async () => '{"summary":"Maintenance complete."}' });
    vi.stubGlobal('fetch', fetch);
    expect(await summarizeNote('Maintenance', 'Check completed.')).toEqual({ summary: 'Maintenance complete.' });
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/intelligence/summary');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ title: 'Maintenance', text: 'Check completed.' });
  });
});
