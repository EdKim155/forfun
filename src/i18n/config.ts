export type Locale = 'ru' | 'en';

export const locales = (process.env.SUPPORTED_LOCALES ?? 'ru,en').split(',') as Locale[];
export const defaultLocale = (process.env.DEFAULT_LOCALE ?? 'ru') as Locale;

export const localeNames: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English'
};

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);
