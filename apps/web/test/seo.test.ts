import { afterEach, describe, expect, it, vi } from 'vitest';
import { metadata } from '../app/layout';
import { metadata as staffMetadata } from '../app/staff/layout';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import { createHomeMetadata } from '../lib/home-metadata';

describe('public metadata', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('identifies the foundation rather than the internal operations app', () => {
    expect(metadata.title).toBe('Prachi Dham Foundation | Gir Somnath');
    expect(metadata.description).toContain('Gir Somnath');
  });

  it('omits canonical and share URLs until the public hostname is configured', () => {
    const withoutOrigin = createHomeMetadata();
    expect(withoutOrigin.alternates?.canonical).toBeUndefined();
    expect(withoutOrigin.openGraph?.url).toBeUndefined();
    const withOrigin = createHomeMetadata('https://prachidham.example');
    expect(withOrigin.alternates?.canonical).toBe('https://prachidham.example/');
    expect(withOrigin.openGraph?.url).toBe('https://prachidham.example/');
    expect(withOrigin.robots).toMatchObject({ index: false, follow: false });
    expect(createHomeMetadata('https://prachidham.example', true).robots).toMatchObject({ index: true, follow: true });
  });

  it('keeps the staff login out of search indexes', () => {
    expect(staffMetadata.robots).toMatchObject({ index: false, follow: false });
  });

  it('blocks the draft on a real hostname until the independent indexability flag is enabled', () => {
    vi.stubEnv('PUBLIC_SITE_ORIGIN', '');
    vi.stubEnv('PUBLIC_SITE_INDEXABLE', 'false');
    expect(robots().rules).toMatchObject({ userAgent: '*', disallow: '/' });
    vi.stubEnv('PUBLIC_SITE_ORIGIN', 'https://prachidham.example');
    expect(robots().rules).toMatchObject({ userAgent: '*', disallow: '/' });
    vi.stubEnv('PUBLIC_SITE_INDEXABLE', 'true');
    expect(robots().rules).toMatchObject({ userAgent: '*', disallow: ['/staff', '/api'] });
    expect(robots().sitemap).toBe('https://prachidham.example/sitemap.xml');
  });

  it('lists only public translated pages when the site has an approved canonical hostname', () => {
    vi.stubEnv('PUBLIC_SITE_ORIGIN', '');
    vi.stubEnv('PUBLIC_SITE_INDEXABLE', 'false');
    expect(sitemap()).toEqual([]);
    vi.stubEnv('PUBLIC_SITE_ORIGIN', 'https://prachidham.example');
    expect(sitemap()).toEqual([]);
    vi.stubEnv('PUBLIC_SITE_INDEXABLE', 'true');
    expect(sitemap()).toHaveLength(12);
    expect(sitemap().map((page) => page.url)).toContain('https://prachidham.example/gu');
    expect(sitemap().map((page) => page.url)).toContain('https://prachidham.example/en/shop');
    expect(sitemap().map((page) => page.url)).not.toContain('https://prachidham.example/staff');
  });
});
