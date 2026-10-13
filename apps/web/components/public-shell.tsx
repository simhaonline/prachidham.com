import type { ReactNode } from 'react';
import { languageNames, localeHref, supportedLocales, type Locale, type Messages } from '../lib/locales';
import { PwaRegister } from './pwa-register';

export function PublicShell({ locale, messages, path = '', alternatePaths, children }: { locale: Locale; messages: Messages; path?: string; alternatePaths?: Partial<Record<Locale, string>>; children: ReactNode }) {
  return <div className="public-site" lang={locale}>
    <PwaRegister />
    <a className="public-skip" href="#main-content">{messages.skip}</a>
    <header className="public-header">
      <a className="public-brand" href={localeHref(locale)} aria-label="Prachi Dham Foundation">
        <img src="/brand/logo.png" alt="" width="50" height="52" />
        <span><strong>Prachi Dham</strong><small>{messages.brandSubheading}</small></span>
      </a>
      <nav className="public-nav" aria-label={messages.navLabel}>
        <a href={localeHref(locale)} aria-current={!path ? 'page' : undefined}>{messages.home}</a>
        <a href={localeHref(locale, 'services')} aria-current={path === 'services' ? 'page' : undefined}>{messages.services}</a>
        <a href={localeHref(locale, 'shop')} aria-current={path === 'shop' ? 'page' : undefined}>{messages.shop}</a>
        <a href={localeHref(locale, 'contact')} aria-current={path === 'contact' ? 'page' : undefined}>{messages.contact}</a>
        <a className="public-nav-staff" href="/staff">{messages.staff}</a>
      </nav>
      <nav className="public-languages" aria-label={messages.language}>
        {supportedLocales.map((code) => <a key={code} href={localeHref(code, alternatePaths?.[code] || path)} lang={code} hrefLang={code} aria-current={code === locale ? 'page' : undefined}>{languageNames[code]}</a>)}
      </nav>
    </header>
    {children}
    <footer className="public-footer">
      <div className="public-footer-brand"><img src="/brand/logo.png" alt="" width="44" height="46" /><span>Prachi Dham Foundation</span></div>
      <p>{messages.footerLocation}</p>
      <a href={localeHref(locale, 'contact')}>{messages.contact}</a>
      <a href="/staff">{messages.staff}</a>
    </footer>
  </div>;
}
