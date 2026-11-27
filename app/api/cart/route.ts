import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOrCreateCartSessionId, getSessionUser } from '@/lib/auth';
import { calculateServerCart } from '@/lib/cart-server';
import { verifyOrigin } from '@/lib/security';

const addSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
});

const patchSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0).max(20).optional(),
  size: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const sessionId = await getOrCreateCartSessionId();
    const coupon = req.nextUrl.searchParams.get('coupon');
    const cart = await calculateServerCart(sessionId, coupon);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid cart item payload' }, { status: 400 });
    }

    const { productId, size, color, quantity } = parsed.data;
    const variant = await prisma.productVariant.findUnique({
      where: { productId_size_color: { productId, size, color } },
      include: { product: true },
    });

    if (!variant || !variant.product.isActive) {
      return NextResponse.json({ error: 'Selected product variant is unavailable.' }, { status: 404 });
    }

    if (variant.stock <= 0) {
      return NextResponse.json({ error: 'This size/color is currently out of stock.' }, { status: 400 });
    }

    const sessionId = await getOrCreateCartSessionId();
    const user = await getSessionUser();

    const existing = await prisma.cartItem.findUnique({
      where: { sessionId_productId_size_color: { sessionId, productId, size, color } },
    });

    const targetQty = (existing?.quantity ?? 0) + quantity;
    if (targetQty > variant.stock) {
      return NextResponse.json(
        { error: `Only ${variant.stock} unit(s) available in ${size} (${color}).` },
        { status: 400 }
      );
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: targetQty, userId: user?.id ?? existing.userId },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          sessionId,
          userId: user?.id ?? null,
          productId,
          size,
          color,
          quantity,
        },
      });
    }

    const cart = await calculateServerCart(sessionId);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  try {
    const sessionId = await getOrCreateCartSessionId();
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: parsed.data.itemId, sessionId },
    });
    if (!item) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    if (parsed.data.quantity !== undefined && parsed.data.quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      const cart = await calculateServerCart(sessionId);
      return NextResponse.json(cart);
    }

    const nextSize = parsed.data.size ?? item.size;
    const nextColor = parsed.data.color ?? item.color;
    const nextQty = parsed.data.quantity ?? item.quantity;

    const variant = await prisma.productVariant.findUnique({
      where: { productId_size_color: { productId: item.productId, size: nextSize, color: nextColor } },
    });

    if (!variant || variant.stock < nextQty) {
      return NextResponse.json(
        { error: `Only ${variant?.stock ?? 0} unit(s) available for ${nextSize} (${nextColor}).` },
        { status: 400 }
      );
    }

    if (nextSize !== item.size || nextColor !== item.color) {
      const collision = await prisma.cartItem.findUnique({
        where: {
          sessionId_productId_size_color: {
            sessionId,
            productId: item.productId,
            size: nextSize,
            color: nextColor,
          },
        },
      });
      if (collision) {
        const mergedQty = Math.min(variant.stock, collision.quantity + nextQty);
        await prisma.$transaction([
          prisma.cartItem.update({ where: { id: collision.id }, data: { quantity: mergedQty } }),
          prisma.cartItem.delete({ where: { id: item.id } }),
        ]);
      } else {
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { size: nextSize, color: nextColor, quantity: nextQty },
        });
      }
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: nextQty },
      });
    }

    const cart = await calculateServerCart(sessionId);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  try {
    const sessionId = await getOrCreateCartSessionId();
    const itemId = req.nextUrl.searchParams.get('itemId');
    if (itemId) {
      await prisma.cartItem.deleteMany({ where: { id: itemId, sessionId } });
    } else {
      await prisma.cartItem.deleteMany({ where: { sessionId } });
    }
    const cart = await calculateServerCart(sessionId);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
