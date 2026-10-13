import type { Metadata } from 'next';
import { getMessages, localeHref, supportedLocales, type Locale } from './locales';

export function createLocalizedMetadata(locale: Locale, path = '', origin?: string, indexable = false, detail?: { title: string; description: string }, alternateSlugs?: Partial<Record<Locale, string>>): Metadata {
  const messages = getMessages(locale);
  const section = path.split('/')[0];
  const name = detail?.title || (section === 'shop' ? messages.shopTitle : section === 'services' ? messages.servicesTitle : section === 'contact' ? messages.contactTitle : 'Prachi Dham Foundation');
  const title = path ? `${name} | Prachi Dham Foundation` : name;
  const description = detail?.description || (section === 'shop' ? messages.shopLead : section === 'services' ? messages.servicesLead : section === 'contact' ? messages.contactLead : messages.heroLead);
  const url = origin ? `${origin}${localeHref(locale, path)}` : undefined;
  const isDetail = path.startsWith('catalog/');
  const languages = origin ? Object.fromEntries([
    ...supportedLocales.flatMap((code) => {
      if (isDetail && !alternateSlugs?.[code]) return [];
      return [[code, `${origin}${localeHref(code, isDetail ? `catalog/${alternateSlugs?.[code]}` : path)}`]];
    }),
    ...(!isDetail || alternateSlugs?.gu ? [['x-default', `${origin}${localeHref('gu', isDetail ? `catalog/${alternateSlugs?.gu}` : path)}`]] : []),
  ]) : undefined;
  return {
    title, description,
    robots: { index: Boolean(origin && indexable), follow: Boolean(origin && indexable) },
    ...(url ? { alternates: { canonical: url, ...(languages && Object.keys(languages).length ? { languages } : {}) } } : {}),
    openGraph: { type: 'website', title, description, siteName: 'Prachi Dham Foundation', locale,
      ...(url ? { url } : {}),
      ...(origin ? { images: [{ url: `${origin}/brand/logo.png`, width: 300, height: 314, alt: 'Prachi Dham Foundation logo' }] } : {}) },
    twitter: { card: 'summary', title, description },
  };
}
