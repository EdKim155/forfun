import { AppShell } from '@/components/layout/app-shell';
import type { Locale } from '@/i18n/config';

export default function AppLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  return <AppShell locale={params.locale}>{children}</AppShell>;
}
