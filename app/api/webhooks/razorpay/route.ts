import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType = event?.event as string;
    const paymentEntity = event?.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id as string | undefined;
    const razorpayPaymentId = paymentEntity?.id as string | undefined;

    if (!razorpayOrderId) {
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({
      where: { razorpayOrderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ received: true });
    }

    if (eventType === 'payment.captured' && order.paymentStatus !== 'PAID') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.productVariant.updateMany({
            where: {
              productId: item.productId,
              size: item.size,
              color: item.color,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: 'CONFIRMED',
            razorpayPaymentId: razorpayPaymentId ?? order.razorpayPaymentId,
          },
        });
      });
    } else if (eventType === 'payment.failed' && order.paymentStatus === 'PENDING') {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
