import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { languageNames, supportedLocales, type Locale } from '../lib/locales';
import { staffMessages } from '../components/staff-messages';
import { StaffLocaleProvider } from '../components/staff-locale';
import { AppShell } from '../components/app-shell';
import { LoadingState } from '../components/shared-ui';
import type { CurrentUser } from '../components/types';

const user: CurrentUser = { id: 'u1', email: 'staff@example.test', displayName: 'Meera', organizationName: 'Prachi Dham', role: 'staff' };

function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value === 'function') return [`${prefix}()`];
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

function stringValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).flatMap(stringValues);
  return [];
}

describe('staff interface localization', () => {
  it('ships every launch language with an identical message shape', () => {
    expect(Object.keys(staffMessages).sort()).toEqual([...supportedLocales].sort());
    const english = keyPaths(staffMessages.en).sort();
    for (const locale of supportedLocales) {
      expect(keyPaths(staffMessages[locale]).sort(), `${locale} message keys`).toEqual(english);
    }
  });

  it('has no empty strings in any language', () => {
    for (const locale of supportedLocales) {
      const blanks = stringValues(staffMessages[locale]).filter((entry) => entry.trim().length === 0);
      expect(blanks, `${locale} empty strings`).toEqual([]);
    }
  });

  it('actually translates operational copy rather than copying English', () => {
    expect(staffMessages.gu.shell.navOverview).not.toBe(staffMessages.en.shell.navOverview);
    expect(staffMessages.hi.shell.signOut).not.toBe(staffMessages.en.shell.signOut);
    expect(staffMessages.gu.login.title).not.toBe(staffMessages.en.login.title);
  });

  it('interpolates values in each language', () => {
    expect(staffMessages.en.records.noticeBody('CRM')).toContain('CRM');
    expect(staffMessages.hi.records.loading('CRM')).toContain('CRM');
    expect(staffMessages.gu.overview.updated('1 Jan 2026')).toContain('1 Jan 2026');
  });

  for (const locale of supportedLocales) {
    it(`renders the staff shell in ${locale}`, () => {
      const html = renderToStaticMarkup(
        <StaffLocaleProvider initialLocale={locale as Locale}>
          <AppShell
            activeView="overview"
            isLoggingOut={false}
            mobileNavigationOpen={false}
            onChangeView={() => undefined}
            onLogout={() => undefined}
            onMobileNavigationChange={() => undefined}
            user={user}
          >
            <p>content</p>
          </AppShell>
        </StaffLocaleProvider>,
      );
      expect(html).toContain(staffMessages[locale].shell.navWorkspaces);
      expect(html).toContain(staffMessages[locale].shell.navOverview);
      expect(html).toContain(`lang="${locale}"`);
      expect(html).toContain(`aria-label="${staffMessages[locale].shell.languageLabel}"`);
    });
  }

  it('renders shared states through the provider', () => {
    const html = renderToStaticMarkup(
      <StaffLocaleProvider initialLocale="hi">
        <LoadingState />
      </StaffLocaleProvider>,
    );
    expect(html).toContain(staffMessages.hi.states.retrieving);
    expect(html).toContain(staffMessages.hi.states.loadingDefault);
  });

  it('shows the language switcher with all three options', () => {
    const html = renderToStaticMarkup(
      <StaffLocaleProvider initialLocale="en">
        <AppShell
          activeView="overview"
          isLoggingOut={false}
          mobileNavigationOpen={false}
          onChangeView={() => undefined}
          onLogout={() => undefined}
          onMobileNavigationChange={() => undefined}
          user={user}
        >
          <p>content</p>
        </AppShell>
      </StaffLocaleProvider>,
    );
    for (const locale of supportedLocales) {
      expect(html).toContain(languageNames[locale]);
    }
  });
});
