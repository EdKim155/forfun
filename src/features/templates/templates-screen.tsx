'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Category, Template, Tool } from '@/types/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TemplateEditor, type TemplateFormValues } from '@/components/template-editor';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function TemplatesScreen() {
  const t = useTranslations('templatesPage');
  const toast = useToast();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'new' | 'edit'>('new');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toolsQuery = useQuery<Tool[]>({ queryKey: ['tools'], queryFn: () => apiClient.get('/api/tools') });
  const categoriesQuery = useQuery<Category[]>({ queryKey: ['categories'], queryFn: () => apiClient.get('/api/categories') });
  const templatesQuery = useQuery<Template[]>({ queryKey: ['templates', 'all'], queryFn: () => apiClient.get('/api/templates?mine=true') });

  const selectedTemplate = useMemo(() => {
    return templatesQuery.data?.find((template) => template.id === selectedId) ?? null;
  }, [templatesQuery.data, selectedId]);

  const createMutation = useMutation({
    mutationFn: (values: TemplateFormValues) => apiClient.post<Template>('/api/templates', values),
    onSuccess: () => {
      toast.success(t('messages.created'));
      queryClient.invalidateQueries({ queryKey: ['templates', 'all'] });
      setMode('new');
      setSelectedId(null);
    },
    onError: () => toast.error(t('messages.error'))
  });

  const updateMutation = useMutation({
    mutationFn: (values: TemplateFormValues) => apiClient.put<Template>(`/api/templates/${selectedId}`, values),
    onSuccess: () => {
      toast.success(t('messages.updated'));
      queryClient.invalidateQueries({ queryKey: ['templates', 'all'] });
    },
    onError: () => toast.error(t('messages.error'))
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/api/templates/${selectedId}`),
    onSuccess: () => {
      toast.success(t('messages.deleted'));
      queryClient.invalidateQueries({ queryKey: ['templates', 'all'] });
      setSelectedId(null);
      setMode('new');
    },
    onError: () => toast.error(t('messages.error'))
  });

  const handleSubmit = async (values: TemplateFormValues) => {
    if (mode === 'edit' && selectedTemplate) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('list.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('list.description')}</p>
          </div>
          <Button onClick={() => { setMode('new'); setSelectedId(null); }} className="gap-2">
            <PlusCircle className="size-4" /> {t('list.create')}
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[580px] rounded-3xl bg-muted/20 p-4">
            <div className="flex flex-col gap-3">
              {templatesQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-3xl" />)
              ) : templatesQuery.data && templatesQuery.data.length > 0 ? (
                templatesQuery.data.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => { setSelectedId(template.id); setMode('edit'); }}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-3xl border border-border/40 bg-background p-4 text-left transition-all hover:shadow-lg',
                        selectedId === template.id && 'border-primary shadow-lg'
                      )}
                  >
                    <span className="text-sm font-semibold">{template.title}</span>
                    <span className="text-xs text-muted-foreground">{template.description}</span>
                    <div className="flex flex-wrap gap-2">
                      {template.toolSlugs.map((slug) => (
                        <Badge key={slug} className="bg-secondary/20 text-xs text-secondary">
                          {slug}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('list.empty')}</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <TemplateEditor
          defaultValues={selectedTemplate ? {
            title: selectedTemplate.title,
            description: selectedTemplate.description,
            body: selectedTemplate.body,
            toolSlugs: selectedTemplate.toolSlugs,
            categoryId: selectedTemplate.categoryId ?? undefined,
            variables: selectedTemplate.variables
          } : undefined}
          tools={toolsQuery.data ?? []}
          categories={categoriesQuery.data ?? []}
          onSubmit={handleSubmit}
          submitLabel={mode === 'edit' ? t('form.update') : t('form.create')}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onDelete={mode === 'edit' ? () => deleteMutation.mutate() : undefined}
        />
      </div>
    </div>
  );
}
