'use client';

import { CircleCard } from '@/components/circle-card';
import { CategoryCard } from '@/components/category-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolChip } from '@/components/tool-chip';
import { Skeleton } from '@/components/ui/skeleton';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Category, Tool } from '@/types/domain';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

const placeholders = [
  'Например: «Создать концепт лендинга для HR SaaS с упором на автоматизацию найма»',
  'Например: «Подготовить обучающий курс по Python для маркетологов»',
  'Например: «Придумать контент-план на месяц для Telegram-канала о дизайне»'
];

export function OnboardingScreen({ locale }: { locale: string }) {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const {
    step,
    setStep,
    toolSlugs,
    toggleTool,
    categorySlug,
    setCategory,
    brief,
    setBrief,
    completed,
    complete,
    reset
  } = useOnboardingStore();

  const toolsQuery = useQuery<Tool[]>({ queryKey: ['tools'], queryFn: () => apiClient.get('/api/tools') });
  const categoriesQuery = useQuery<Category[]>({ queryKey: ['categories'], queryFn: () => apiClient.get('/api/categories') });

  useEffect(() => {
    if (completed) {
      router.replace({ pathname: '/builder', locale });
    }
  }, [completed, router, locale]);

  const steps = [
    { id: 'tools', label: t('steps.tools') },
    { id: 'category', label: t('steps.category') },
    { id: 'brief', label: t('steps.brief') },
    { id: 'review', label: t('steps.review') }
  ] as const;

  const currentIndex = steps.findIndex((item) => item.id === step);

  const canContinue = () => {
    switch (step) {
      case 'tools':
        return toolSlugs.length > 0;
      case 'category':
        return Boolean(categorySlug);
      case 'brief':
        return brief.trim().length > 10;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (step === 'review') {
      complete();
      router.replace({ pathname: '/builder', locale });
      return;
    }
    setStep(steps[currentIndex + 1].id);
  };

  const goBack = () => {
    if (currentIndex === 0) return;
    setStep(steps[currentIndex - 1].id);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-3xl bg-background/60 p-10 shadow-lg">
      <header className="flex flex-col gap-4 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-lg">
          <Sparkles className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold">{t('title')}</h1>
          <p className="mt-2 text-base text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          {steps.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <motion.div
                layout
                className={cn(
                  'size-3 rounded-full border border-primary/40 transition-all',
                  index <= currentIndex ? 'bg-primary' : 'bg-transparent'
                )}
              />
              <span className={cn('text-sm font-medium', index === currentIndex ? 'text-primary' : 'text-muted-foreground')}>
                {item.label}
              </span>
              {index < steps.length - 1 ? <span className="text-muted-foreground">—</span> : null}
            </div>
          ))}
        </div>
      </header>
      <section className="min-h-[380px]">
        <AnimatePresence mode="wait">
          {step === 'tools' ? (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
            >
              {toolsQuery.isLoading ? (
                Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-full" />)
              ) : (
                toolsQuery.data?.map((tool) => (
                  <CircleCard
                    key={tool.id}
                    label={tool.name}
                    icon={<span className="text-3xl">{tool.icon}</span>}
                    selected={toolSlugs.includes(tool.slug)}
                    onClick={() => toggleTool(tool.slug)}
                  />
                ))
              )}
            </motion.div>
          ) : null}
          {step === 'category' ? (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {categoriesQuery.isLoading ? (
                Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-3xl" />)
              ) : (
                categoriesQuery.data?.map((category) => (
                  <CategoryCard
                    key={category.id}
                    title={category.name}
                    description={t(`categories.${category.slug}`, { default: '' })}
                    selected={categorySlug === category.slug}
                    icon={<span className="text-2xl">🔥</span>}
                    onClick={() => setCategory(category.slug)}
                  />
                ))
              )}
            </motion.div>
          ) : null}
          {step === 'brief' ? (
            <motion.div
              key="brief"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <Textarea
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                placeholder={placeholders[currentIndex % placeholders.length]}
                className="min-h-[220px]"
              />
              <p className="text-sm text-muted-foreground">{t('briefHint')}</p>
            </motion.div>
          ) : null}
          {step === 'review' ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{t('reviewTools')}</h3>
                <div className="flex flex-wrap gap-2">
                  {toolSlugs.map((slug) => (
                    <ToolChip
                      key={slug}
                      label={toolsQuery.data?.find((tool) => tool.slug === slug)?.name ?? slug}
                      icon={<span className="text-2xl">{toolsQuery.data?.find((tool) => tool.slug === slug)?.icon ?? '✨'}</span>}
                      active
                      type="button"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{t('reviewCategory')}</h3>
                {categorySlug ? (
                  <Badge className="bg-secondary/20 text-secondary">
                    {categoriesQuery.data?.find((category) => category.slug === categorySlug)?.name ?? categorySlug}
                  </Badge>
                ) : null}
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{t('reviewBrief')}</h3>
                <p className="rounded-3xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground">{brief}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={goBack} disabled={currentIndex === 0}>
          {t('actions.back')}
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => reset()}>
            {t('actions.reset')}
          </Button>
          <Button onClick={goNext} disabled={!canContinue()}>
            {step === 'review' ? t('actions.finish') : t('actions.next')}
          </Button>
        </div>
      </footer>
    </div>
  );
}
