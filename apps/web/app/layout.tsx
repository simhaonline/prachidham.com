import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { isLocale } from '../lib/locales';
import './globals.css';
import './public-home.css';

export const metadata: Metadata = {
  title: 'Prachi Dham Foundation | Gir Somnath',
  description: 'Prachi Dham Foundation is based in Gir Somnath, Gujarat. Official information about its objectives and reviewed offerings.',
  manifest: '/site.webmanifest',
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico', sizes: 'any' }], apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }] },
};
export const viewport: Viewport = { themeColor: '#123229', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const requested = (await headers()).get('x-prachi-locale') || 'en';
  const locale = isLocale(requested) ? requested : 'en';
  return <html lang={locale}><body>{children}</body></html>;
}
