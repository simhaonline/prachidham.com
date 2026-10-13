import type { MetadataRoute } from 'next';
import { getSiteOrigin, isSiteIndexable } from '../lib/site-origin';
import { localeHref, supportedLocales } from '../lib/locales';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin(process.env.PUBLIC_SITE_ORIGIN);
  if (!origin || !isSiteIndexable(origin, process.env.PUBLIC_SITE_INDEXABLE)) return [];
  return ['', 'services', 'shop', 'contact'].flatMap((path) => {
    const languages = Object.fromEntries(supportedLocales.map((locale) => [locale, `${origin}${localeHref(locale, path)}`]));
    return supportedLocales.map((locale) => ({ url: `${origin}${localeHref(locale, path)}`, alternates: { languages } }));
  });
}
