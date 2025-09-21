import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tools = await prisma.tool.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(
    tools.map((tool) => ({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      icon: tool.icon,
      createdAt: tool.createdAt,
      updatedAt: tool.updatedAt
    }))
  );
}
