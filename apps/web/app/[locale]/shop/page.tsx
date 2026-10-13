import { notFound } from 'next/navigation';
import { PublicCatalog } from '../../../components/public-catalog';
import { isLocale } from '../../../lib/locales';
import { createLocalizedMetadata } from '../../../lib/localized-metadata';
import { getSiteOrigin, isSiteIndexable } from '../../../lib/site-origin';

export const dynamic = 'force-dynamic';
type Route = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Route) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const origin = getSiteOrigin(process.env.PUBLIC_SITE_ORIGIN);
  return createLocalizedMetadata(locale, 'shop', origin, isSiteIndexable(origin, process.env.PUBLIC_SITE_INDEXABLE));
}
export default async function Shop({ params }: Route) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <PublicCatalog locale={locale} kind="product" />;
}
