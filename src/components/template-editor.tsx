'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolChip } from '@/components/tool-chip';
import type { Category, Tool } from '@/types/domain';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const templateSchema = z.object({
  title: z.string().min(3, 'Минимум 3 символа'),
  description: z.string().min(10, 'Минимум 10 символов'),
  body: z.string().min(20, 'Минимум 20 символов'),
  toolSlugs: z.array(z.string()).min(1, 'Выберите минимум один инструмент'),
  categoryId: z.string().optional(),
  variables: z.array(z.string())
});

export type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateEditorProps {
  defaultValues?: Partial<TemplateFormValues>;
  tools: Tool[];
  categories: Category[];
  onSubmit: (values: TemplateFormValues) => Promise<void> | void;
  onDelete?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function TemplateEditor({
  defaultValues,
  tools,
  categories,
  onSubmit,
  onDelete,
  submitLabel = 'Сохранить шаблон',
  isSubmitting
}: TemplateEditorProps) {
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      description: '',
      body: '',
      toolSlugs: [],
      categoryId: undefined,
      variables: [],
      ...defaultValues
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = form;

  const [variableInput, setVariableInput] = useState('');
  const toolSlugs = watch('toolSlugs');
  const variables = watch('variables');

  const toggleTool = (slug: string) => {
    if (toolSlugs.includes(slug)) {
      setValue(
        'toolSlugs',
        toolSlugs.filter((value) => value !== slug)
      );
    } else {
      setValue('toolSlugs', [...toolSlugs, slug]);
    }
  };

  const addVariable = () => {
    if (!variableInput.trim()) return;
    if (variables.includes(variableInput.trim())) return;
    setValue('variables', [...variables, variableInput.trim()]);
    setVariableInput('');
  };

  const removeVariable = (variable: string) => {
    setValue(
      'variables',
      variables.filter((item) => item !== variable)
    );
  };

  return (
    <Card asChild>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Настройка шаблона</CardTitle>
          <p className="text-sm text-muted-foreground">
            Используйте переменные, чтобы делать промпт гибким. Например, {'{'}audience{'}'} или {'{'}goal{'}'}.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Название</label>
              <Input placeholder="Например, Адаптивный маркетинговый промпт" {...register('title')} />
              {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Категория</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={watch('categoryId') === category.id ? 'secondary' : 'outline'}
                    onClick={() => setValue('categoryId', category.id)}
                    className="rounded-full"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              {errors.categoryId ? (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Описание</label>
            <Textarea rows={3} placeholder="Опишите, когда использовать шаблон" {...register('description')} />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            ) : null}
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Текст шаблона</label>
            <Textarea rows={8} placeholder="Введите текст с переменными" {...register('body')} />
            {errors.body ? <p className="text-xs text-destructive">{errors.body.message}</p> : null}
          </div>
          <Separator />
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Переменные</label>
              <p className="text-xs text-muted-foreground">
                Добавляйте динамические переменные в фигурных скобках. Например, audience, format, tone.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <Badge key={variable} className="cursor-pointer bg-secondary/20 text-secondary" onClick={() => removeVariable(variable)}>
                  {'{'}{variable}{'}'} ×
                </Badge>
              ))}
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                value={variableInput}
                onChange={(event) => setVariableInput(event.target.value)}
                placeholder="Например, audience"
              />
              <Button type="button" onClick={addVariable} variant="secondary">
                Добавить переменную
              </Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Инструменты</label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {tools.map((tool) => (
                <ToolChip
                  key={tool.id}
                  label={tool.name}
                  icon={<span dangerouslySetInnerHTML={{ __html: tool.icon }} />}
                  active={toolSlugs.includes(tool.slug)}
                  onClick={() => toggleTool(tool.slug)}
                  type="button"
                />
              ))}
            </div>
            {errors.toolSlugs ? <p className="text-xs text-destructive">{errors.toolSlugs.message}</p> : null}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-3">
          {onDelete ? (
            <Button type="button" variant="outline" onClick={onDelete} className="text-destructive">
              Удалить
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? 'Сохраняем…' : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
