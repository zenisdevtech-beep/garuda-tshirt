import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/product-utils';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q')?.trim().toLowerCase() || '';
    const category = sp.get('category')?.trim() || '';
    const tag = sp.get('tag')?.trim() || '';
    const size = sp.get('size')?.trim() || '';
    const inStock = sp.get('inStock') === 'true';
    const minPrice = Number(sp.get('minPrice') || 0);
    const maxPrice = Number(sp.get('maxPrice') || 100000);
    const sort = sp.get('sort') || 'featured';
    const page = Math.max(1, Number(sp.get('page') || 1));
    const limit = Math.min(50, Math.max(1, Number(sp.get('limit') || 24)));

    const rows = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        price: { gte: minPrice, lte: maxPrice },
      },
      include: { variants: true },
    });

    let serialized = rows.map(serializeProduct);

    if (q) {
      serialized = serialized.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q)
      );
    }

    if (tag) {
      serialized = serialized.filter(p => {
        if (tag === 'new') return p.isNewArrival || p.tags.includes('new');
        if (tag === 'bestseller') return p.isBestseller || p.tags.includes('bestseller');
        if (tag === 'sale') return Boolean(p.originalPrice) || p.tags.includes('sale');
        return p.tags.includes(tag);
      });
    }

    if (size) {
      serialized = serialized.filter(p =>
        p.variants.some(v => v.size === size && (!inStock || v.stock > 0))
      );
    }

    if (inStock) {
      serialized = serialized.filter(p => p.stock > 0);
    }

    switch (sort) {
      case 'newest':
        serialized.sort((a, b) => Number(b.isNewArrival) - Number(a.isNewArrival));
        break;
      case 'popularity':
        serialized.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'price-asc':
        serialized.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        serialized.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        serialized.sort((a, b) => b.rating - a.rating);
        break;
      default:
        serialized.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
    }

    const total = serialized.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = serialized.slice(start, start + limit);

    return NextResponse.json({
      products: items,
      total,
      page,
      limit,
      totalPages,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
