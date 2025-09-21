import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';
import { decorateTemplate, serializeToolSlugs, serializeVariables } from '@/lib/templates';

const templateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  body: z.string().min(20),
  toolSlugs: z.array(z.string()).min(1),
  categoryId: z.string().optional().nullable(),
  variables: z.array(z.string()).optional().default([])
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Неверные данные', issues: parsed.error.flatten() }, { status: 400 });
  }

  const template = await prisma.template.findUnique({ where: { id: params.id } });
  if (!template || template.userId !== session.user.id) {
    return NextResponse.json({ message: 'Шаблон не найден' }, { status: 404 });
  }

  const updated = await prisma.template.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      body: parsed.data.body,
      toolSlugsJson: serializeToolSlugs(parsed.data.toolSlugs),
      variablesJson: serializeVariables(parsed.data.variables ?? []),
      categoryId: parsed.data.categoryId ?? null
    },
    include: { category: true }
  });

  return NextResponse.json({ ...decorateTemplate(updated), category: updated.category });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const template = await prisma.template.findUnique({ where: { id: params.id } });
  if (!template || template.userId !== session.user.id) {
    return NextResponse.json({ message: 'Шаблон не найден' }, { status: 404 });
  }

  await prisma.template.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Удалено' });
}
