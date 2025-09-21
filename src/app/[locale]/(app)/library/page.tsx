import { LibraryScreen } from '@/features/library/library-screen';
import type { Locale } from '@/i18n/config';

export default function LibraryPage({ params }: { params: { locale: Locale } }) {
  return <LibraryScreen locale={params.locale} />;
}
