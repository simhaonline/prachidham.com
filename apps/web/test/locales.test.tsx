import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { getMessages, isLocale, localeHref, supportedLocales } from '../lib/locales';
import { PublicHome } from '../components/public-home';

const scripts = { en: 'Rooted in heritage', hi: 'परंपरा', gu: 'પરંપરા' };

describe('public localization', () => {
  it('supports all three launch languages and rejects unknown codes', () => {
    expect(supportedLocales).toEqual(['gu', 'hi', 'en']);
    expect(isLocale('gu')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('builds locale-preserving links without interpolating untrusted paths', () => {
    expect(localeHref('hi', 'shop')).toBe('/hi/shop');
    expect(localeHref('gu')).toBe('/gu');
  });

  for (const locale of supportedLocales) {
    it(`renders navigation, home and contact copy in ${locale}`, () => {
      const html = renderToStaticMarkup(<PublicHome locale={locale} messages={getMessages(locale)} />);
      expect(html).toContain(scripts[locale]);
      expect(html).toContain(`href="/${locale}/shop"`);
      expect(html).toContain(`href="/${locale}/contact"`);
      expect(html).toContain(`href="/${locale}/services"`);
      expect(html).toContain('href="/staff"');
      expect(html).not.toContain('50,000');
      expect(html).not.toContain('80G');
    });
  }
});
