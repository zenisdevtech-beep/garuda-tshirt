import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOrCreateCartSessionId, getSessionUser } from '@/lib/auth';
import { calculateServerCart } from '@/lib/cart-server';
import { getRazorpayClient, isRazorpayConfigured } from '@/lib/razorpay';
import { checkRateLimit, verifyOrigin, sanitizeText } from '@/lib/security';

const addressSchema = z.object({
  line1: z.string().min(4),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pinCode: z.string().regex(/^\d{6}$/),
  country: z.string().min(2).default('India'),
});

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10).max(15),
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  notes: z.string().max(500).optional(),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'checkout:razorpay', 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      {
        error:
          'Razorpay is not configured on this server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env to enable online UPI/Card/NetBanking payments, or use Cash on Delivery.',
        code: 'RAZORPAY_NOT_CONFIGURED',
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid checkout fields' }, { status: 400 });
    }

    const sessionId = await getOrCreateCartSessionId();
    const user = await getSessionUser();
    const cart = await calculateServerCart(sessionId, parsed.data.couponCode);

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

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `GRD-${datePart}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const razorpay = getRazorpayClient();
    const rpOrder = await razorpay.orders.create({
      amount: cart.total * 100, // paise
      currency: 'INR',
      receipt: orderNumber,
      notes: { orderNumber, customerEmail: parsed.data.customerEmail },
    });

    const order = await prisma.order.create({
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
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        razorpayOrderId: rpOrder.id,
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
    });

    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to initialize Razorpay order' },
      { status: 500 }
    );
  }
}
