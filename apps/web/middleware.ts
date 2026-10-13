import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { localeFromPath } from './lib/locales';

export function middleware(request: NextRequest) {
  const locale = localeFromPath(request.nextUrl.pathname);
  if (!locale) return NextResponse.next();
  const headers = new Headers(request.headers);
  headers.set('x-prachi-locale', locale);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/((?!api|_next|staff|.*\\..*).*)'] };
