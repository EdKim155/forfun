'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Category, GenerateResponse, Template, Tool } from '@/types/domain';
import { useOnboardingStore } from '@/store/onboarding-store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolChip } from '@/components/tool-chip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PromptCard } from '@/components/prompt-card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function PromptBuilder() {
  const t = useTranslations('builder');
  const toast = useToast();
  const onboarding = useOnboardingStore();
  const [selectedTool, setSelectedTool] = useState<string | undefined>(onboarding.toolSlugs[0]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(onboarding.categorySlug);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [promptResult, setPromptResult] = useState<GenerateResponse | null>(null);

  const toolsQuery = useQuery<Tool[]>({ queryKey: ['tools'], queryFn: () => apiClient.get('/api/tools') });
  const categoriesQuery = useQuery<Category[]>({ queryKey: ['categories'], queryFn: () => apiClient.get('/api/categories') });
  const templatesQuery = useQuery<Template[]>({ queryKey: ['templates'], queryFn: () => apiClient.get('/api/templates') });

  useEffect(() => {
    if (!selectedTool && onboarding.toolSlugs.length > 0) {
      setSelectedTool(onboarding.toolSlugs[0]);
    }
  }, [selectedTool, onboarding.toolSlugs]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedTool) {
        throw new Error('Выберите инструмент');
      }
      const response = await apiClient.post<GenerateResponse>('/api/generate', {
        toolSlug: selectedTool,
        categorySlug: selectedCategory,
        brief: onboarding.brief,
        templateId: selectedTemplate
      });
      return response;
    },
    onSuccess: (data) => {
      setPromptResult(data);
      toast.success('Промпт готов!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const recommendedTemplates = useMemo(() => {
    if (!templatesQuery.data) return [];
    return templatesQuery.data.filter((template) => {
      const matchesTool = selectedTool ? template.toolSlugs.includes(selectedTool) : true;
      const matchesCategory = selectedCategory ? template.category?.slug === selectedCategory || template.categoryId === selectedCategory : true;
      return matchesTool && matchesCategory;
    });
  }, [templatesQuery.data, selectedTool, selectedCategory]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('context.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('context.description')}</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('context.tools')}</label>
              <div className="flex flex-wrap gap-2">
                {(toolsQuery.data ?? []).map((tool) => (
                  <ToolChip
                    key={tool.id}
                    label={tool.name}
                    icon={<span className="text-2xl">{tool.icon}</span>}
                    active={selectedTool === tool.slug}
                    onClick={() => setSelectedTool(tool.slug)}
                    type="button"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('context.category')}</label>
              <div className="flex flex-wrap gap-2">
                {(categoriesQuery.data ?? []).map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? 'secondary' : 'outline'}
                    onClick={() => setSelectedCategory(category.slug)}
                    type="button"
                    className="rounded-full"
                  >
                    {category.name}
                  </Button>
                ))}
                <Button
                  variant={!selectedCategory ? 'secondary' : 'ghost'}
                  onClick={() => setSelectedCategory(undefined)}
                  type="button"
                >
                  {t('context.anyCategory')}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('context.brief')}</label>
              <Textarea
                value={onboarding.brief}
                onChange={(event) => onboarding.setBrief(event.target.value)}
                placeholder={t('context.placeholder')}
                className="min-h-[160px]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !selectedTool || onboarding.brief.trim().length < 10}>
                {mutation.isPending ? t('context.generating') : t('context.generate')}
              </Button>
              {mutation.isPending ? <span className="text-sm text-muted-foreground">{t('context.generatingHint')}</span> : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('templates.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('templates.description')}</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recommended" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="recommended">{t('templates.recommended')}</TabsTrigger>
                <TabsTrigger value="all">{t('templates.all')}</TabsTrigger>
              </TabsList>
              <TabsContent value="recommended">
                <ScrollArea className="max-h-[320px] rounded-3xl bg-muted/20 p-4">
                  <div className="flex flex-col gap-3">
                    {templatesQuery.isLoading ? (
                      <Skeleton className="h-20 rounded-3xl" />
                    ) : recommendedTemplates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('templates.empty')}</p>
                    ) : (
                      recommendedTemplates.map((template) => (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.01 }}
                          className={cn(
                            'flex flex-col items-start gap-2 rounded-3xl border border-border/40 bg-background p-4 text-left transition-all',
                            selectedTemplate === template.id && 'border-primary shadow-lg'
                          )}
                          onClick={() => setSelectedTemplate(template.id)}
                          type="button"
                        >
                          <span className="text-sm font-semibold">{template.title}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {template.toolSlugs.map((slug) => (
                              <Badge key={slug} className="bg-secondary/20 text-secondary">
                                {slug}
                              </Badge>
                            ))}
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="all">
                <ScrollArea className="max-h-[320px] rounded-3xl bg-muted/20 p-4">
                  <div className="flex flex-col gap-3">
                    {templatesQuery.isLoading ? (
                      <Skeleton className="h-20 rounded-3xl" />
                    ) : (
                      templatesQuery.data?.map((template) => (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.01 }}
                          className={cn(
                            'flex flex-col items-start gap-2 rounded-3xl border border-border/40 bg-background p-4 text-left transition-all',
                            selectedTemplate === template.id && 'border-primary shadow-lg'
                          )}
                          onClick={() => setSelectedTemplate(template.id)}
                          type="button"
                        >
                          <span className="text-sm font-semibold">{template.title}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        </motion.button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="flex h-full flex-col gap-6">
        {promptResult ? (
          <PromptCard
            prompt={promptResult.prompt}
            toolSlug={promptResult.meta.toolSlug}
            categoryName={categoriesQuery.data?.find((category) => category.slug === promptResult.meta.categorySlug)?.name}
            categorySlug={promptResult.meta.categorySlug}
            brief={onboarding.brief}
            templateId={promptResult.meta.templateId}
          />
        ) : (
          <Card className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <CardHeader>
              <CardTitle>{t('preview.placeholderTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('preview.placeholderDescription')}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>{t('preview.hintsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('preview.hint1')}</p>
            <p>{t('preview.hint2')}</p>
            <p>{t('preview.hint3')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
