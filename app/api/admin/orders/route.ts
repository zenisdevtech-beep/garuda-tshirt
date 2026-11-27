import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { verifyOrigin } from '@/lib/security';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendOrderStatusEmail } from '@/lib/email';

const VALID_STATUSES = [
  'PENDING',
  'PROCESSING',
  'CONFIRMED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

const patchSchema = z.object({
  orderId: z.string().min(1),
  orderStatus: z.enum(VALID_STATUSES).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  awbCode: z.string().optional(),
  courierName: z.string().optional(),
  createShipment: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order update payload' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { items: true },
    });
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    let shiprocketUpdate: Record<string, string | undefined> = {};
    let shiprocketNotice: string | undefined;

    if (parsed.data.createShipment) {
      const addr = JSON.parse(existing.shippingAddress) as {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pinCode: string;
      };
      const sr = await createShiprocketOrder({
        orderNumber: existing.orderNumber,
        orderDate: existing.createdAt.toISOString().slice(0, 10),
        customerName: existing.customerName,
        customerEmail: existing.customerEmail,
        customerPhone: existing.customerPhone,
        addressLine1: addr.line1,
        addressLine2: addr.line2,
        city: addr.city,
        state: addr.state,
        pinCode: addr.pinCode,
        paymentMethod: existing.paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
        subtotal: existing.subtotal,
        items: existing.items.map(i => ({
          name: `${i.productName} (${i.size})`,
          sku: `${i.productId}-${i.size}`,
          units: i.quantity,
          selling_price: i.unitPrice,
        })),
      });
      if (sr.created) {
        shiprocketUpdate = {
          shiprocketOrderId: sr.shiprocketOrderId,
          shiprocketShipmentId: sr.shiprocketShipmentId,
          awbCode: sr.awbCode,
          courierName: sr.courierName,
        };
      } else {
        shiprocketNotice = sr.reason;
      }
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        ...(parsed.data.orderStatus ? { orderStatus: parsed.data.orderStatus } : {}),
        ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
        ...(parsed.data.awbCode !== undefined ? { awbCode: parsed.data.awbCode || null } : {}),
        ...(parsed.data.courierName !== undefined ? { courierName: parsed.data.courierName || null } : {}),
        ...shiprocketUpdate,
      },
      include: { items: true },
    });

    let emailResult: { sent: boolean; reason?: string } | null = null;
    if (parsed.data.orderStatus && parsed.data.orderStatus !== existing.orderStatus) {
      emailResult = await sendOrderStatusEmail({
        orderNumber: updated.orderNumber,
        customerName: updated.customerName,
        customerEmail: updated.customerEmail,
        orderStatus: updated.orderStatus,
        awbCode: updated.awbCode,
        courierName: updated.courierName,
      });
    }

    return NextResponse.json({
      order: updated,
      ...(shiprocketNotice ? { shiprocketNotice } : {}),
      ...(emailResult ? { emailSent: emailResult.sent, emailNotice: emailResult.reason } : {}),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update order' },
      { status: 500 }
    );
  }
}
