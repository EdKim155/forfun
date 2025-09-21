import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './src/i18n/config';
import { pathnames } from './src/i18n/routing';

export default createMiddleware({
  defaultLocale,
  locales,
  localePrefix: 'always',
  pathnames
});

export const config = {
  matcher: ['/', '/(ru|en)/:path*']
};
