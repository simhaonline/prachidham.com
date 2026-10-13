'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isLocale, languageNames, supportedLocales, type Locale } from '../lib/locales';
import { staffMessages, type StaffMessages } from './staff-messages';

const STORAGE_KEY = 'pd_staff_locale';
const DEFAULT_LOCALE: Locale = 'en';

type StaffLocaleValue = {
  locale: Locale;
  messages: StaffMessages;
  setLocale: (locale: Locale) => void;
};

const StaffLocaleContext = createContext<StaffLocaleValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && isLocale(stored) ? stored : DEFAULT_LOCALE;
}

export function StaffLocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  // Server and first client render stay on the default so hydration matches;
  // the stored preference is applied after mount. An explicit initialLocale
  // (used by tests) is authoritative and never overridden from storage.
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);

  useEffect(() => {
    if (initialLocale) return;
    const stored = readStoredLocale();
    if (stored !== DEFAULT_LOCALE) setLocaleState(stored);
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private mode); the in-memory choice still applies.
    }
  }, []);

  const value = useMemo<StaffLocaleValue>(() => ({ locale, messages: staffMessages[locale], setLocale }), [locale, setLocale]);

  return <StaffLocaleContext.Provider value={value}>{children}</StaffLocaleContext.Provider>;
}

export function useStaffLocale(): StaffLocaleValue {
  const value = useContext(StaffLocaleContext);
  if (!value) throw new Error('useStaffLocale must be used within StaffLocaleProvider');
  return value;
}

export function useStaffMessages(): StaffMessages {
  return useStaffLocale().messages;
}

export function StaffLanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, messages } = useStaffLocale();
  return (
    <div className={className} role="group" aria-label={messages.shell.languageLabel}>
      {supportedLocales.map((code) => (
        <button
          aria-pressed={code === locale}
          key={code}
          lang={code}
          onClick={() => setLocale(code)}
          type="button"
        >
          {languageNames[code]}
        </button>
      ))}
    </div>
  );
}
