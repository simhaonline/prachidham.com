import { notFound } from 'next/navigation';
import { PublicShell } from '../../../components/public-shell';
import { getMessages, isLocale } from '../../../lib/locales';
import { createLocalizedMetadata } from '../../../lib/localized-metadata';
import { getSiteOrigin, isSiteIndexable } from '../../../lib/site-origin';

type Route = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Route) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const origin = getSiteOrigin(process.env.PUBLIC_SITE_ORIGIN);
  return createLocalizedMetadata(locale, 'contact', origin, isSiteIndexable(origin, process.env.PUBLIC_SITE_INDEXABLE));
}
export default async function Contact({ params }: Route) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  return <PublicShell locale={locale} messages={m} path="contact">
    <main id="main-content" className="public-inner-page">
      <p className="public-kicker public-inner-kicker">{m.kicker}</p>
      <h1>{m.contactTitle}</h1>
      <p className="public-inner-lead">{m.contactLead}</p>
      <div className="public-contact-grid">
        <section><h2>{m.emailLabel}</h2><a href="mailto:Prachidham.ngo@gmail.com">Prachidham.ngo@gmail.com</a></section>
        <section><h2>{m.phoneLabel}</h2><a href="tel:+917043360652">+91 70433 60652</a></section>
        <section><h2>{m.locationLabel}</h2><p>{m.footerLocation}</p></section>
      </div>
      <p className="public-catalog-disclaimer">{m.contactNote}</p>
    </main>
  </PublicShell>;
}
