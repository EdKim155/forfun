import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  language: z.string().optional().nullable(),
  theme: z.string().optional().nullable()
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Неверные данные', issues: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      language: parsed.data.language ?? null,
      theme: parsed.data.theme ?? null
    },
    create: {
      userId: session.user.id,
      language: parsed.data.language ?? null,
      theme: parsed.data.theme ?? null
    }
  });

  return NextResponse.json({ message: 'Сохранено' });
}
