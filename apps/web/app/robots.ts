import type { MetadataRoute } from 'next';
import { getSiteOrigin, isSiteIndexable } from '../lib/site-origin';

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin(process.env.PUBLIC_SITE_ORIGIN);
  if (!isSiteIndexable(origin, process.env.PUBLIC_SITE_INDEXABLE)) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/staff', '/api'] },
    sitemap: `${origin}/sitemap.xml`,
  };
}
