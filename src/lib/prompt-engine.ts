import { prisma } from '@/lib/prisma';
import { decorateTemplate, renderTemplate } from '@/lib/templates';
import type { Category, Template } from '@prisma/client';
import { getToolStrategy } from '@/lib/tool-strategies';
import { callOpenAI } from '@/lib/openai-client';

interface GeneratePromptInput {
  brief: string;
  toolSlug: string;
  categorySlug?: string;
  templateId?: string;
}

export async function generatePrompt({ brief, toolSlug, categorySlug, templateId }: GeneratePromptInput) {
  const tool = await prisma.tool.findUnique({ where: { slug: toolSlug } });
  if (!tool) {
    throw new Error('Неизвестный инструмент');
  }

  let category: Category | null = null;
  if (categorySlug) {
    category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  }

  let template: Template | null = null;
  if (templateId) {
    template = await prisma.template.findUnique({ where: { id: templateId } });
  } else {
    template = await prisma.template.findFirst({
      where: {
        OR: [
          { toolSlugsJson: { contains: toolSlug } },
          { toolSlugsJson: { equals: null } }
        ],
        AND: category ? [{ categoryId: category.id }] : undefined
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  if (!template) {
    template = await prisma.template.create({
      data: {
        title: `Базовый шаблон для ${tool.name}`,
        description: 'Быстрый промпт на основе брифа',
        body: 'Цель: {{brief}}\nФормат ответа: структурированный список шагов и вывод.\nДополнительные пожелания: [[EXTRA_REQUIREMENTS]]',
        toolSlugsJson: JSON.stringify([tool.slug]),
        variablesJson: JSON.stringify(['extra_requirements']),
        userId: null
      }
    });
  }

  const decorated = decorateTemplate(template);
  const strategy = getToolStrategy(tool.slug);
  // eslint-disable-next-line testing-library/render-result-naming-convention
  const templateOutput = renderTemplate(decorated.body, { brief }, decorated.variables);

  const systemPrompt = strategy.systemPrompt;
  const userPrompt = `Бриф: ${brief}. Категория: ${category?.name ?? 'не указана'}. Используй шаблон ниже и верни итоговый промпт без комментариев.\n\n${templateOutput}`;

  const response = await callOpenAI({ system: systemPrompt, user: userPrompt });
  const finalPrompt = response ?? `${strategy.fallbackIntro}\n${templateOutput}`;

  return {
    prompt: finalPrompt.trim(),
    meta: {
      templateId: template.id,
      toolSlug: tool.slug,
      categorySlug: category?.slug,
      variables: decorated.variables
    }
  };
}
