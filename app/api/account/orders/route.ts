import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: auth.user.id },
        { customerEmail: auth.user.email },
      ],
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ orders });
}
