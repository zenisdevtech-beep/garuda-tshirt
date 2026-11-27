import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [orders, totalCustomers, totalProducts, recentOrders, subscriberCount, contactCount] =
    await Promise.all([
      prisma.order.findMany({
        select: { total: true, orderStatus: true, paymentStatus: true, createdAt: true },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { items: true },
      }),
      prisma.newsletterSubscriber.count(),
      prisma.contactMessage.count({ where: { status: 'NEW' } }),
    ]);

  const validOrders = orders.filter(o => o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'REFUNDED');
  const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  return NextResponse.json({
    totalSales,
    totalOrders,
    totalCustomers,
    totalProducts,
    subscriberCount,
    unreadContacts: contactCount,
    recentOrders,
  });
}
