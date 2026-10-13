import { PublicShell } from './public-shell';
import { localeHref, type Locale, type Messages } from '../lib/locales';

export function PublicHome({ locale, messages }: { locale: Locale; messages: Messages }) {
  return <PublicShell locale={locale} messages={messages}>
    <main id="main-content">
      <section className="public-hero" aria-labelledby="home-title">
        <div className="public-hero-copy">
          <p className="public-kicker">{messages.kicker}</p>
          <h1 id="home-title">{messages.heroTitle} <em>{messages.heroAccent}</em></h1>
          <p className="public-lead">{messages.heroLead}</p>
          <a className="public-cta" href="#about">{messages.heroAction} <span aria-hidden="true">↗</span></a>
          <p className="public-review-note">{messages.reviewNote}</p>
        </div>
        <div className="public-hero-mark" aria-hidden="true">
          <div className="public-orbit public-orbit-one" /><div className="public-orbit public-orbit-two" />
          <div className="public-seal"><img src="/brand/logo.png" alt="" width="230" height="241" /></div>
          <span className="public-mark-label">Prachi Dham · Gir Somnath</span>
        </div>
      </section>

      <section className="public-introduction" id="about" aria-labelledby="about-title">
        <div className="public-section-index"><span>{messages.aboutIndex}</span><span className="public-index-line" /></div>
        <div className="public-introduction-content">
          <p className="public-overline">{messages.aboutLabel}</p>
          <h2 id="about-title">{messages.aboutTitle}</h2>
          <p>{messages.aboutBody}</p>
        </div>
      </section>

      <section className="public-offerings" aria-labelledby="offerings-title">
        <p className="public-section-index">{messages.offeringsIndex}</p>
        <p className="public-overline">{messages.offeringsLabel}</p>
        <h2 id="offerings-title">{messages.offeringsTitle}</h2>
        <p>{messages.offeringsBody}</p>
        <div className="public-offering-links">
          <a href={localeHref(locale, 'services')}>{messages.servicesAction}<span aria-hidden="true">↗</span></a>
          <a href={localeHref(locale, 'shop')}>{messages.shopAction}<span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="public-updates" aria-labelledby="updates-title">
        <div>
          <p className="public-overline">{messages.updatesLabel}</p>
          <h2 id="updates-title">{messages.updatesTitle}</h2>
          <p>{messages.updatesBody}</p>
          <a className="public-cta public-cta-dark" href={localeHref(locale, 'contact')}>{messages.contactAction} <span aria-hidden="true">↗</span></a>
        </div>
        <div className="public-updates-aside"><span className="public-status-dot" aria-hidden="true" /><span>{messages.reviewNote}</span></div>
      </section>
    </main>
  </PublicShell>;
}
