import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLocalizedMetadata } from '../lib/localized-metadata';
import sitemap from '../app/sitemap';

const origin = 'https://prachidham.example';

describe('multilingual search boundary', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('creates a localized canonical and all three hreflang alternates only for approved public content', () => {
    const page = createLocalizedMetadata('hi', 'shop', origin, true);
    expect(page.alternates?.canonical).toBe(`${origin}/hi/shop`);
    expect(page.alternates?.languages).toMatchObject({ gu: `${origin}/gu/shop`, hi: `${origin}/hi/shop`, en: `${origin}/en/shop` });
    expect(page.robots).toMatchObject({ index: true });
    expect(createLocalizedMetadata('gu', 'shop', origin, false).robots).toMatchObject({ index: false });
  });

  it('uses actual translated slugs on a listing detail rather than inventing cross-language URLs', () => {
    const page = createLocalizedMetadata('hi', 'catalog/seva-hi', origin, true,
      { title: 'सेवा', description: 'समीक्षा की गई सेवा का विवरण' },
      { gu: 'seva-gu', hi: 'seva-hi', en: 'seva-en' });
    expect(page.alternates?.languages).toMatchObject({ gu: `${origin}/gu/catalog/seva-gu`, en: `${origin}/en/catalog/seva-en` });
    expect(page.alternates?.canonical).toBe(`${origin}/hi/catalog/seva-hi`);
  });

  it('does not expose staff or API routes and retains an empty draft sitemap', () => {
    vi.stubEnv('PUBLIC_SITE_ORIGIN', origin);
    vi.stubEnv('PUBLIC_SITE_INDEXABLE', 'false');
    expect(sitemap()).toEqual([]);
    vi.stubEnv('PUBLIC_SITE_INDEXABLE', 'true');
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain(`${origin}/gu`);
    expect(urls).toContain(`${origin}/hi/shop`);
    expect(urls).toContain(`${origin}/en/contact`);
    expect(urls.some((url) => url.includes('/staff') || url.includes('/api'))).toBe(false);
  });
});
