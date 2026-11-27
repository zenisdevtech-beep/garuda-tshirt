import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const user = await getSessionUser();
    const emailParam = req.nextUrl.searchParams.get('email')?.trim().toLowerCase();

    const isOwner =
      user &&
      (user.role === 'ADMIN' ||
        order.userId === user.id ||
        order.customerEmail.toLowerCase() === user.email.toLowerCase());
    const matchesGuestEmail = Boolean(emailParam && order.customerEmail.toLowerCase() === emailParam);

    if (!isOwner && !matchesGuestEmail) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 });
  }
}
