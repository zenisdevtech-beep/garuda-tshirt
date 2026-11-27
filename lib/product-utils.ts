import type { Product, ProductVariant } from '@prisma/client';

export interface ProductVariantDTO {
  id: string;
  size: string;
  color: string;
  stock: number;
}

export interface ProductDTO {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryLabel: string;
  material: string;
  images: string[];
  colors: Array<{ name: string; hex: string }>;
  tags: string[];
  sizes: string[];
  variants: ProductVariantDTO[];
  stock: number;
  isBestseller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

export function serializeProduct(
  product: Product & { variants: ProductVariant[] }
): ProductDTO {
  const images = safeJsonParse<string[]>(product.images, []);
  const colors = safeJsonParse<Array<{ name: string; hex: string }>>(product.colors, []);
  const tags = safeJsonParse<string[]>(product.tags, []);
  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size))).sort(
    (a, b) => {
      const ia = SIZE_ORDER.indexOf(a);
      const ib = SIZE_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    }
  );
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    category: product.category,
    categoryLabel: product.categoryLabel,
    material: product.material,
    images,
    colors,
    tags,
    sizes: uniqueSizes,
    variants: product.variants.map(v => ({
      id: v.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
    })),
    stock: totalStock,
    isBestseller: product.isBestseller,
    isNewArrival: product.isNewArrival,
    isActive: product.isActive,
    rating: product.rating,
    reviewCount: product.reviewCount,
  };
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
