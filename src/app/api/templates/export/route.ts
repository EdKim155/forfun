import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { decorateTemplate } from '@/lib/templates';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const templates = await prisma.template.findMany({ where: { userId: session.user.id }, include: { category: true } });
  return NextResponse.json(templates.map((template) => ({ ...decorateTemplate(template), category: template.category })));
}
