import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { serializeProduct } from '@/lib/product-utils';
import { verifyOrigin } from '@/lib/security';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ items: [] });
  }

  const rows = await prisma.wishlistItem.findMany({
    where: { userId: auth.user.id },
    include: { product: { include: { variants: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    items: rows.map(r => serializeProduct(r.product)),
  });
}

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: 'Please sign in to save items to your wishlist.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const productId = String(body?.productId || '');
    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: auth.user.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ wishlisted: false });
    }

    await prisma.wishlistItem.create({
      data: { userId: auth.user.id, productId },
    });
    return NextResponse.json({ wishlisted: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }
  await prisma.wishlistItem.deleteMany({
    where: { userId: auth.user.id, productId },
  });
  return NextResponse.json({ success: true });
}
