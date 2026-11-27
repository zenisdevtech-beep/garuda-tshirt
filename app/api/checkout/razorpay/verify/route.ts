import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOrCreateCartSessionId } from '@/lib/auth';
import { verifyRazorpayPaymentSignature, isRazorpayConfigured } from '@/lib/razorpay';
import { verifyOrigin } from '@/lib/security';
import { sendOrderConfirmationEmail } from '@/lib/email';

const schema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payment verification payload' }, { status: 400 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;
    const isValid = verifyRazorpayPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      await prisma.order.updateMany({
        where: { razorpayOrderId, paymentStatus: 'PENDING' },
        data: { paymentStatus: 'FAILED' },
      });
      return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { razorpayOrderId },
      include: { items: true },
    });
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotency guard against duplicate callbacks
    if (existingOrder.paymentStatus === 'PAID') {
      return NextResponse.json({ order: existingOrder, duplicate: true });
    }

    const sessionId = await getOrCreateCartSessionId();

    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const item of existingOrder.items) {
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

      if (existingOrder.couponCode) {
        await tx.coupon.updateMany({
          where: { code: existingOrder.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      const ord = await tx.order.update({
        where: { id: existingOrder.id },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
          razorpayPaymentId,
          razorpaySignature,
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { sessionId } });
      return ord;
    });

    const emailRes = await sendOrderConfirmationEmail({
      orderNumber: updatedOrder.orderNumber,
      customerName: updatedOrder.customerName,
      customerEmail: updatedOrder.customerEmail,
      total: updatedOrder.total,
      paymentMethod: updatedOrder.paymentMethod,
      paymentStatus: updatedOrder.paymentStatus,
    });

    return NextResponse.json({
      order: updatedOrder,
      emailSent: emailRes.sent,
    });
  } catch {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
