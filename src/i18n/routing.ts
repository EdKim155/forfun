import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';
import type { Pathnames } from 'next-intl/navigation';
import { defaultLocale, locales, type Locale } from './config';
import type ruMessages from './locales/ru/common.json';

declare global {
  interface IntlMessages extends Messages {}
}

type Messages = typeof ruMessages;

export const pathnames = {
  '/': '/',
  '/onboarding': '/onboarding',
  '/builder': '/builder',
  '/templates': '/templates',
  '/library': '/library',
  '/settings': '/settings'
} satisfies Pathnames<Locale>;

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({
    locales,
    localePrefix: 'always',
    defaultLocale,
    pathnames
  });
