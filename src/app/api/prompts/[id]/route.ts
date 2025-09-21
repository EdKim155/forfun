import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const prompt = await prisma.promptGeneration.findUnique({ where: { id: params.id } });
  if (!prompt || prompt.userId !== session.user.id) {
    return NextResponse.json({ message: 'Промпт не найден' }, { status: 404 });
  }

  await prisma.promptGeneration.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Удалено' });
}
