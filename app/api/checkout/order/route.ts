import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOrCreateCartSessionId, getSessionUser } from '@/lib/auth';
import { calculateServerCart } from '@/lib/cart-server';
import { checkRateLimit, verifyOrigin, sanitizeText } from '@/lib/security';
import { sendOrderConfirmationEmail } from '@/lib/email';

const addressSchema = z.object({
  line1: z.string().min(4, 'Address line is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  country: z.string().min(2).default('India'),
});

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Full name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required').max(15),
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  notes: z.string().max(500).optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['COD']),
});

function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `GRD-${datePart}-${rand}`;
}

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'checkout:cod', 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many checkout requests.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid checkout fields' }, { status: 400 });
    }

    const sessionId = getOrCreateCartSessionId();
    const user = await getSessionUser();
    const cart = await calculateServerCart(sessionId, parsed.data.couponCode);

    if (!cart.codEnabled) {
      return NextResponse.json({ error: 'Cash on Delivery is currently disabled.' }, { status: 400 });
    }
    if (cart.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    for (const item of cart.items) {
      if (!item.inStock || item.availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.name} (${item.size}).` },
          { status: 400 }
        );
      }
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const updated = await tx.productVariant.updateMany({
          where: {
            productId: item.productId,
            size: item.size,
            color: item.color,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`Out of stock: ${item.product.name} (${item.size})`);
        }
      }

      if (cart.couponCode) {
        await tx.coupon.update({
          where: { code: cart.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id ?? null,
          customerName: sanitizeText(parsed.data.customerName),
          customerEmail: parsed.data.customerEmail.trim().toLowerCase(),
          customerPhone: sanitizeText(parsed.data.customerPhone),
          billingAddress: JSON.stringify(parsed.data.billingAddress),
          shippingAddress: JSON.stringify(parsed.data.shippingAddress),
          notes: parsed.data.notes ? sanitizeText(parsed.data.notes) : null,
          couponCode: cart.couponCode,
          subtotal: cart.subtotal,
          discount: cart.discount,
          shippingCharge: cart.shippingCharge,
          total: cart.total,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          orderStatus: 'CONFIRMED',
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              productName: item.product.name,
              productSlug: item.product.slug,
              productImg: item.product.images[0] || '',
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              unitPrice: item.product.price,
              totalPrice: item.lineTotal,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { sessionId } });
      return created;
    });

    const emailRes = await sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    });

    return NextResponse.json({
      order,
      emailSent: emailRes.sent,
      ...(emailRes.sent ? {} : { emailNotice: emailRes.reason }),
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Order creation failed' },
      { status: 400 }
    );
  }
}
