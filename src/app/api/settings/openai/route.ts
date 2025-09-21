import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hashSecret } from '@/lib/crypto';

const schema = z.object({
  apiKey: z.string().min(10)
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

  const hashed = hashSecret(parsed.data.apiKey);

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { openaiApiKeyHash: hashed },
    create: { userId: session.user.id, openaiApiKeyHash: hashed }
  });

  return NextResponse.json({ message: 'Сохранено' });
}
