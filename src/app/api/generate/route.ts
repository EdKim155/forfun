import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { generatePrompt } from '@/lib/prompt-engine';

const schema = z.object({
  toolSlug: z.string().min(1),
  categorySlug: z.string().optional(),
  brief: z.string().min(10),
  templateId: z.string().optional()
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

  try {
    const result = await generatePrompt(parsed.data);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Не удалось сгенерировать промпт';
    return NextResponse.json({ message }, { status: 500 });
  }
}
