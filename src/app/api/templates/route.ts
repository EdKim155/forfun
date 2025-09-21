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

export async function GET(request: NextRequest) {
  const session = await auth();
  const mine = request.nextUrl.searchParams.get('mine');
  const userId = session?.user?.id ?? null;

  const where = mine === 'true'
    ? userId
      ? { userId: userId }
      : { userId: null }
    : userId
      ? { OR: [{ userId }, { userId: null }] }
      : { userId: null };

  const templates = await prisma.template.findMany({
    where,
    include: {
      category: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json(
    templates.map((template) => ({
      ...decorateTemplate(template),
      category: template.category
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Неверные данные', issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const template = await prisma.template.create({
    data: {
      title: data.title,
      description: data.description,
      body: data.body,
      toolSlugsJson: serializeToolSlugs(data.toolSlugs),
      variablesJson: serializeVariables(data.variables ?? []),
      userId: session.user.id,
      categoryId: data.categoryId ?? null
    },
    include: { category: true }
  });

  return NextResponse.json({ ...decorateTemplate(template), category: template.category }, { status: 201 });
}
