import type { Locale } from './locales';

export type CatalogEntry = {
  id: string;
  kind: 'product' | 'service';
  sku: string | null;
  amountPaise: number | null;
  currency: 'INR';
  slug: string;
  title: string;
  summary: string;
  locale: string;
  alternateSlugs?: Partial<Record<Locale, string>>;
};

function apiBase() {
  const value = process.env.API_INTERNAL_URL;
  if (!value) throw new Error('Catalog API is not configured.');
  return value.replace(/\/$/, '');
}

export async function getCatalog(locale: Locale, kind: CatalogEntry['kind']): Promise<CatalogEntry[]> {
  const response = await fetch(`${apiBase()}/v1/catalog?locale=${locale}&kind=${kind}&limit=50`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
  const data = await response.json() as { data: CatalogEntry[] };
  return data.data;
}

export async function getCatalogEntry(locale: Locale, slug: string): Promise<CatalogEntry | null> {
  const response = await fetch(`${apiBase()}/v1/catalog/${encodeURIComponent(slug)}?locale=${locale}`, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
  return response.json() as Promise<CatalogEntry>;
}

export function listedAmount(amountPaise: number | null, locale: Locale): string | null {
  if (amountPaise === null) return null;
  return new Intl.NumberFormat(`${locale}-IN`, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amountPaise / 100);
}
