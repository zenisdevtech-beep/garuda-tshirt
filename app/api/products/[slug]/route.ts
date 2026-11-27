import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/product-utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        variants: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 25,
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const relatedRows = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
      },
      include: { variants: true },
      take: 12,
    });

    const sameCat = relatedRows.filter(r => r.category === product.category);
    const others = relatedRows.filter(r => r.category !== product.category);
    const related = [...sameCat, ...others].slice(0, 4).map(serializeProduct);

    return NextResponse.json({
      product: serializeProduct(product),
      reviews: product.reviews,
      related,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}
