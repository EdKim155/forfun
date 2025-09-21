import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { serializeToolSlugs, serializeVariables } from '@/lib/templates';

const importSchema = z.object({
  templates: z.array(
    z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      body: z.string().min(20),
      toolSlugs: z.array(z.string()).min(1),
      categoryId: z.string().optional().nullable(),
      variables: z.array(z.string()).optional().default([])
    })
  )
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Неверные данные', issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data.templates;

  await prisma.$transaction(
    data.map((item) =>
      prisma.template.create({
        data: {
          title: item.title,
          description: item.description,
          body: item.body,
          toolSlugsJson: serializeToolSlugs(item.toolSlugs),
          variablesJson: serializeVariables(item.variables ?? []),
          categoryId: item.categoryId ?? null,
          userId: session.user.id
        }
      })
    )
  );

  return NextResponse.json({ message: 'Импортировано' });
}
