import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { serializeProduct } from '@/lib/product-utils';
import { verifyOrigin, sanitizeText } from '@/lib/security';

const variantSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  stock: z.number().int().min(0),
});

const productSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(2),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  price: z.number().int().min(1),
  originalPrice: z.number().int().nullable().optional(),
  category: z.string().min(2),
  categoryLabel: z.string().min(2),
  material: z.string().min(2),
  images: z.array(z.string().min(1)).min(1),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).min(1),
  tags: z.array(z.string()).default([]),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
  variants: z.array(variantSchema).min(1),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rows = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ products: rows.map(serializeProduct) });
}

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid product data' }, { status: 400 });
    }

    const d = parsed.data;
    const created = await prisma.product.create({
      data: {
        sku: sanitizeText(d.sku.toUpperCase()),
        name: sanitizeText(d.name),
        slug: d.slug.trim().toLowerCase(),
        description: sanitizeText(d.description),
        price: d.price,
        originalPrice: d.originalPrice ?? null,
        category: d.category.trim().toLowerCase(),
        categoryLabel: sanitizeText(d.categoryLabel),
        material: sanitizeText(d.material),
        images: JSON.stringify(d.images),
        colors: JSON.stringify(d.colors),
        tags: JSON.stringify(d.tags),
        isBestseller: d.isBestseller,
        isNewArrival: d.isNewArrival,
        isActive: d.isActive,
        variants: {
          create: d.variants.map(v => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json({ product: serializeProduct(created) }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create product' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success || !parsed.data.id) {
      return NextResponse.json({ error: 'Product ID and valid fields are required' }, { status: 400 });
    }

    const d = parsed.data;
    const updated = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: d.id } });
      return tx.product.update({
        where: { id: d.id },
        data: {
          sku: sanitizeText(d.sku.toUpperCase()),
          name: sanitizeText(d.name),
          slug: d.slug.trim().toLowerCase(),
          description: sanitizeText(d.description),
          price: d.price,
          originalPrice: d.originalPrice ?? null,
          category: d.category.trim().toLowerCase(),
          categoryLabel: sanitizeText(d.categoryLabel),
          material: sanitizeText(d.material),
          images: JSON.stringify(d.images),
          colors: JSON.stringify(d.colors),
          tags: JSON.stringify(d.tags),
          isBestseller: d.isBestseller,
          isNewArrival: d.isNewArrival,
          isActive: d.isActive,
          variants: {
            create: d.variants.map(v => ({
              size: v.size,
              color: v.color,
              stock: v.stock,
            })),
          },
        },
        include: { variants: true },
      });
    });

    return NextResponse.json({ product: serializeProduct(updated) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update product' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
