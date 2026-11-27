import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { checkRateLimit, verifyOrigin, sanitizeText } from '@/lib/security';

const reviewSchema = z.object({
  author: z.string().min(2).max(60).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(5, 'Review must be at least 5 characters').max(1000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const rl = checkRateLimit(req, 'reviews:create', 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many review submissions.' }, { status: 429 });
  }

  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid review' }, { status: 400 });
    }

    const user = await getSessionUser();
    const authorName = user?.name || (parsed.data.author ? sanitizeText(parsed.data.author) : '');
    if (!authorName) {
      return NextResponse.json({ error: 'Please provide your name or sign in.' }, { status: 400 });
    }

    let verified = false;
    if (user) {
      const purchased = await prisma.orderItem.findFirst({
        where: {
          productId: product.id,
          order: { userId: user.id, orderStatus: { not: 'CANCELLED' } },
        },
      });
      verified = Boolean(purchased);
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user?.id ?? null,
        author: authorName,
        rating: parsed.data.rating,
        title: parsed.data.title ? sanitizeText(parsed.data.title) : null,
        comment: sanitizeText(parsed.data.comment),
        verified,
      },
    });

    const stats = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: Number((stats._avg.rating || product.rating).toFixed(1)),
        reviewCount: stats._count.rating,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
