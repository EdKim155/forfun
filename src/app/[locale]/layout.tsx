import { AppProviders } from '@/providers/app-providers';
import { AppToaster } from '@/components/ui/sonner-toaster';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const locale = params.locale;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const session = await auth();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <AppProviders session={session}>
        {children}
        <AppToaster />
      </AppProviders>
    </NextIntlClientProvider>
  );
}
