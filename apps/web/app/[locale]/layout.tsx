import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isLocale, supportedLocales } from '../../lib/locales';

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return children;
}
