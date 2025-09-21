import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { decorateTemplate } from '@/lib/templates';

const promptSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional().default(''),
  content: z.string().min(10),
  toolSlug: z.string().optional(),
  categorySlug: z.string().optional(),
  brief: z.string().optional(),
  templateId: z.string().optional()
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const prompts = await prisma.promptGeneration.findMany({
    where: { userId: session.user.id },
    include: {
      category: true,
      template: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(
    prompts.map((prompt) => ({
      id: prompt.id,
      userId: prompt.userId,
      templateId: prompt.templateId,
      toolSlug: prompt.toolSlug,
      categoryId: prompt.categoryId,
      brief: prompt.brief,
      result: prompt.result,
      createdAt: prompt.createdAt,
      title: prompt.title,
      notes: prompt.notes,
      category: prompt.category,
      template: prompt.template ? decorateTemplate(prompt.template) : null
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = promptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Неверные данные', issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  let categoryId: string | null = null;
  if (data.categorySlug) {
    const category = await prisma.category.findUnique({ where: { slug: data.categorySlug } });
    categoryId = category?.id ?? null;
  }

  const prompt = await prisma.promptGeneration.create({
    data: {
      userId: session.user.id,
      title: data.title,
      notes: data.notes ?? '',
      result: data.content,
      brief: data.brief ?? '',
      toolSlug: data.toolSlug ?? 'custom',
      categoryId,
      templateId: data.templateId ?? null
    }
  });

  return NextResponse.json(prompt, { status: 201 });
}
