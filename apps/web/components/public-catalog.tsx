import { getCatalog, listedAmount, type CatalogEntry } from '../lib/catalog';
import { getMessages, localeHref, type Locale } from '../lib/locales';
import { PublicShell } from './public-shell';

export async function PublicCatalog({ locale, kind }: { locale: Locale; kind: CatalogEntry['kind'] }) {
  const messages = getMessages(locale);
  const path = kind === 'product' ? 'shop' : 'services';
  let listings: CatalogEntry[] = [];
  let failed = false;
  try { listings = await getCatalog(locale, kind); } catch { failed = true; }
  return <PublicShell locale={locale} messages={messages} path={path}>
    <main id="main-content" className="public-inner-page">
      <p className="public-kicker public-inner-kicker">{messages.kicker}</p>
      <h1>{kind === 'product' ? messages.shopTitle : messages.servicesTitle}</h1>
      <p className="public-inner-lead">{kind === 'product' ? messages.shopLead : messages.servicesLead}</p>
      <div className="public-catalog-grid" aria-live="polite">
        {failed ? <p className="public-empty" role="alert">{messages.catalogError} <a href={localeHref(locale, path)}>{messages.retry}</a></p>
          : listings.length === 0 ? <p className="public-empty">{messages.empty} <a href={localeHref(locale, 'contact')}>{messages.contactAction}</a></p>
          : listings.map((item) => <article className="public-product-card" key={item.id}>
              <span className="public-product-kind">{item.kind === 'product' ? messages.listingTypeProduct : messages.listingTypeService}</span>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              <div className="public-product-foot">
                <strong>{listedAmount(item.amountPaise, locale) || messages.priceOnRequest}</strong>
                <a href={localeHref(locale, `catalog/${item.slug}`)}>{messages.details} <span aria-hidden="true">↗</span></a>
              </div>
            </article>)}
      </div>
      <p className="public-catalog-disclaimer">{messages.inquiryNotice}</p>
    </main>
  </PublicShell>;
}
