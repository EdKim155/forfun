'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PromptGeneration, Category, Tool } from '@/types/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/copy-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export function LibraryScreen({ locale }: { locale: string }) {
  const t = useTranslations('library');
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const promptsQuery = useQuery<PromptGeneration[]>({ queryKey: ['prompts'], queryFn: () => apiClient.get('/api/prompts') });
  const toolsQuery = useQuery<Tool[]>({ queryKey: ['tools'], queryFn: () => apiClient.get('/api/tools') });
  const categoriesQuery = useQuery<Category[]>({ queryKey: ['categories'], queryFn: () => apiClient.get('/api/categories') });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/prompts/${id}`),
    onSuccess: () => {
      toast.success(t('messages.deleted'));
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
    onError: () => toast.error(t('messages.error'))
  });

  const prompts = useMemo(() => {
    if (!promptsQuery.data) return [];
    return promptsQuery.data.filter((prompt) => {
      const matchesSearch = search
        ? prompt.result.toLowerCase().includes(search.toLowerCase()) || prompt.brief.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesTool = toolFilter ? prompt.toolSlug === toolFilter : true;
      const matchesCategory = categoryFilter ? prompt.category?.slug === categoryFilter || prompt.categoryId === categoryFilter : true;
      return matchesSearch && matchesTool && matchesCategory;
    });
  }, [promptsQuery.data, search, toolFilter, categoryFilter]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <Card>
        <CardHeader>
          <CardTitle>{t('filters.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('filters.description')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('filters.search')}</label>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('filters.placeholder')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('filters.tools')}</label>
            <div className="flex flex-wrap gap-2">
              <Button variant={!toolFilter ? 'secondary' : 'ghost'} onClick={() => setToolFilter(null)} type="button">
                {t('filters.anyTool')}
              </Button>
              {(toolsQuery.data ?? []).map((tool) => (
                <Button
                  key={tool.id}
                  variant={toolFilter === tool.slug ? 'secondary' : 'outline'}
                  onClick={() => setToolFilter(tool.slug)}
                  type="button"
                >
                  {tool.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('filters.categories')}</label>
            <div className="flex flex-wrap gap-2">
              <Button variant={!categoryFilter ? 'secondary' : 'ghost'} onClick={() => setCategoryFilter(null)} type="button">
                {t('filters.anyCategory')}
              </Button>
              {(categoriesQuery.data ?? []).map((category) => (
                <Button
                  key={category.id}
                  variant={categoryFilter === category.slug ? 'secondary' : 'outline'}
                  onClick={() => setCategoryFilter(category.slug)}
                  type="button"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('list.description')}</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px] space-y-4 rounded-3xl bg-muted/20 p-4">
            {promptsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-3xl" />
                ))}
              </div>
            ) : prompts.length > 0 ? (
              <div className="space-y-4">
                {prompts.map((prompt) => (
                  <div key={prompt.id} className="space-y-3 rounded-3xl border border-border/40 bg-background p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold">{prompt.title ?? 'Без названия'}</h3>
                      {prompt.notes ? <span className="text-xs text-muted-foreground">{prompt.notes}</span> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{toolsQuery.data?.find((tool) => tool.slug === prompt.toolSlug)?.name ?? prompt.toolSlug}</Badge>
                      {prompt.category ? (
                        <Badge className="bg-secondary/20 text-secondary">
                          {prompt.category.name}
                        </Badge>
                      ) : null}
                      <span className="ml-auto text-xs text-muted-foreground">{formatDate(prompt.createdAt, locale)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{prompt.brief}</p>
                    <pre className="whitespace-pre-wrap rounded-3xl bg-muted/40 p-3 text-sm">{prompt.result}</pre>
                    <div className="flex flex-wrap items-center gap-3">
                      <CopyButton value={prompt.result} />
                      <Button variant="ghost" onClick={() => deleteMutation.mutate(prompt.id)}>
                        {t('list.delete')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('list.empty')}</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
