import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en-US', 'fa-IR', 'ar-AE', 'fa', 'en', 'ar'],
  defaultLocale: 'en-US',
  localePrefix: 'as-needed',
  localeMapping: {
    fa: 'fa-IR',
    en: 'en-US',
    ar: 'ar-AE',
  },
});

export default function middleware(request) {
  // Redirect root (/) to /en
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|.*\..*).*)'],
};
