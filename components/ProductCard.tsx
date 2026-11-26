'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

const badgeConfig = {
  new: { label: 'NEW', className: 'bg-garud-teal text-garud-cream' },
  bestseller: { label: 'BEST', className: 'bg-garud-cream text-garud-teal border border-garud-teal/30' },
  sale: { label: 'SALE', className: 'bg-garud-ochre text-white' },
  limited: { label: 'LTD', className: 'bg-garud-teal-deep text-garud-cream' },
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product,
      quantity: 1,
      size: product.sizes[1] || product.sizes[0],
      color: product.colors[0].name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      {/* Image Container */}
      <div
        className="relative overflow-hidden bg-garud-cream-dark border border-garud-cream-border aspect-[3/4] mb-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Primary Image */}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className={`object-cover transition-opacity duration-500 ${hovered && product.images[1] ? 'opacity-0' : 'opacity-100'}`}
        />
        {/* Secondary Image */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alternate`}
            fill
            className={`object-cover absolute inset-0 transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.tags.slice(0, 2).map(tag => {
            const cfg = badgeConfig[tag];
            return cfg ? (
              <span key={tag} className={`text-[9px] font-bold tracking-ultra px-2 py-0.5 ${cfg.className}`}>
                {cfg.label}
              </span>
            ) : null;
          })}
          {discount && (
            <span className="bg-garud-ochre text-white text-[9px] font-bold tracking-ultra px-2 py-0.5">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Add */}
        <button
          onClick={handleQuickAdd}
          className={`absolute bottom-0 left-0 right-0 py-3.5 text-xs font-semibold tracking-ultra uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
            added
              ? 'bg-garud-ochre text-white translate-y-0'
              : 'bg-garud-teal text-garud-cream translate-y-full group-hover:translate-y-0'
          }`}
        >
          {added ? (
            <>✓ Added to Cart</>
          ) : (
            <>
              <ShoppingBag size={12} />
              Quick Add
            </>
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-1.5">
        <p className="text-garud-muted text-[10px] tracking-ultra uppercase font-medium">{product.categoryLabel}</p>
        <h3 className="text-garud-ink font-semibold text-sm group-hover:text-garud-teal transition-colors leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                size={10}
                className={s <= Math.round(product.rating) ? 'fill-garud-teal text-garud-teal' : 'fill-garud-cream-border text-garud-cream-border'}
              />
            ))}
          </div>
          <span className="text-garud-muted text-[10px]">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-garud-teal font-bold text-sm">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="text-garud-muted text-xs line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Size pills */}
        <div className="flex gap-1 flex-wrap pt-1">
          {product.sizes.slice(0, 5).map(size => (
            <span key={size} className="text-[9px] text-garud-muted border border-garud-cream-border px-1.5 py-0.5 bg-garud-cream-dark/40">
              {size}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
