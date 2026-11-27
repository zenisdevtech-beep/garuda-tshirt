import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/product-utils';
import ProductDetailClient from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: 'Product Not Found — GARUD' };
  return {
    title: `${product.name} — GARUD`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      reviews: { orderBy: { createdAt: 'desc' }, take: 25 },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const relatedRows = await prisma.product.findMany({
    where: { isActive: true, id: { not: product.id } },
    include: { variants: true },
    take: 10,
  });

  const sameCat = relatedRows.filter(r => r.category === product.category);
  const others = relatedRows.filter(r => r.category !== product.category);
  const related = [...sameCat, ...others].slice(0, 4).map(serializeProduct);

  return (
    <ProductDetailClient
      product={serializeProduct(product)}
      initialReviews={product.reviews.map(r => ({
        id: r.id,
        author: r.author,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verified: r.verified,
        createdAt: r.createdAt.toISOString(),
      }))}
      related={related}
    />
  );
}
