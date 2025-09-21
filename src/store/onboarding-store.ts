import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingStep = 'tools' | 'category' | 'brief' | 'review';

interface OnboardingState {
  step: OnboardingStep;
  toolSlugs: string[];
  categorySlug?: string;
  brief: string;
  completed: boolean;
  setStep: (step: OnboardingStep) => void;
  toggleTool: (slug: string) => void;
  setCategory: (slug: string) => void;
  setBrief: (value: string) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      step: 'tools',
      toolSlugs: [],
      categorySlug: undefined,
      brief: '',
      completed: false,
      setStep: (step) => set({ step }),
      toggleTool: (slug) => {
        const { toolSlugs } = get();
        set({
          toolSlugs: toolSlugs.includes(slug)
            ? toolSlugs.filter((item) => item !== slug)
            : [...toolSlugs, slug]
        });
      },
      setCategory: (slug) => set({ categorySlug: slug }),
      setBrief: (value) => set({ brief: value }),
      complete: () => set({ completed: true, step: 'review' }),
      reset: () => set({ step: 'tools', toolSlugs: [], categorySlug: undefined, brief: '', completed: false })
    }),
    {
      name: 'onboarding-preferences'
    }
  )
);
