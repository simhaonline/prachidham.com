import { notFound } from 'next/navigation';
import { InquiryForm } from '../../../../components/inquiry-form';
import { PublicShell } from '../../../../components/public-shell';
import { getCatalogEntry, listedAmount } from '../../../../lib/catalog';
import { getMessages, isLocale, localeHref } from '../../../../lib/locales';
import { createLocalizedMetadata } from '../../../../lib/localized-metadata';
import { getSiteOrigin, isSiteIndexable } from '../../../../lib/site-origin';

export const dynamic = 'force-dynamic';
type Route = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Route) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const origin = getSiteOrigin(process.env.PUBLIC_SITE_ORIGIN);
  let item;
  try { item = await getCatalogEntry(locale, slug); } catch { /* no leaked unpublished metadata */ }
  return createLocalizedMetadata(locale, `catalog/${slug}`, origin, Boolean(item) && isSiteIndexable(origin, process.env.PUBLIC_SITE_INDEXABLE),
    item ? { title: item.title, description: item.summary } : undefined, item?.alternateSlugs);
}
export default async function ListingDetail({ params }: Route) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  let item;
  try { item = await getCatalogEntry(locale, slug); }
  catch { return <PublicShell locale={locale} messages={m} path="shop"><main id="main-content" className="public-inner-page"><h1>{m.catalogError}</h1><a href={localeHref(locale, 'contact')}>{m.contactAction}</a></main></PublicShell>; }
  if (!item) notFound();
  const back = item.kind === 'product' ? 'shop' : 'services';
  const alternatePaths = Object.fromEntries(Object.entries(item.alternateSlugs || {}).map(([code, translatedSlug]) => [code, `catalog/${translatedSlug}`]));
  return <PublicShell locale={locale} messages={m} path={back} alternatePaths={alternatePaths}>
    <main id="main-content" className="public-inner-page public-detail">
      <a className="public-back" href={localeHref(locale, back)}>← {m.backToShop}</a>
      <p className="public-kicker public-inner-kicker">{item.kind === 'product' ? m.listingTypeProduct : m.listingTypeService}</p>
      <h1>{item.title}</h1>
      <p className="public-inner-lead">{item.summary}</p>
      <div className="public-detail-meta"><span>{m.listedAmount}</span><strong>{listedAmount(item.amountPaise, locale) || m.priceOnRequest}</strong></div>
      <InquiryForm itemId={item.id} title={item.title} locale={locale} messages={m} />
    </main>
  </PublicShell>;
}
