import { OnboardingScreen } from '@/features/onboarding/onboarding-screen';
import type { Locale } from '@/i18n/config';

export default function OnboardingPage({ params }: { params: { locale: Locale } }) {
  return <OnboardingScreen locale={params.locale} />;
}
