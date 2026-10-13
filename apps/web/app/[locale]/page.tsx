import { notFound } from 'next/navigation';
import { PublicHome } from '../../components/public-home';
import { getMessages, isLocale } from '../../lib/locales';
import { createLocalizedMetadata } from '../../lib/localized-metadata';
import { getSiteOrigin, isSiteIndexable } from '../../lib/site-origin';

type Route = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Route) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const origin = getSiteOrigin(process.env.PUBLIC_SITE_ORIGIN);
  return createLocalizedMetadata(locale, '', origin, isSiteIndexable(origin, process.env.PUBLIC_SITE_INDEXABLE));
}

export default async function LocaleHome({ params }: Route) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <PublicHome locale={locale} messages={getMessages(locale)} />;
}
