'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import type { ProductDTO } from '@/lib/product-utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface ProductCardProps {
  product: ProductDTO;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { wishlistIds, toggleWishlist } = useAuth();
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hovered, setHovered] = useState(false);

  const isWishlisted = wishlistIds.includes(product.id);
  const inStockVariant = product.variants.find(v => v.stock > 0);
  const outOfStock = product.stock <= 0 || !inStockVariant;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || !inStockVariant) return;

    const res = await addItem({
      productId: product.id,
      size: inStockVariant.size,
      color: inStockVariant.color,
      quantity: 1,
    });
    if (res.ok) {
      setAdded(true);
      setErrorMsg('');
      setTimeout(() => setAdded(false), 1800);
    } else {
      setErrorMsg(res.error || 'Unavailable');
      setTimeout(() => setErrorMsg(''), 2200);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggleWishlist(product.id);
    if (!res.ok && res.error) {
      setErrorMsg(res.error);
      setTimeout(() => setErrorMsg(''), 2200);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div
        className="relative overflow-hidden bg-garud-cream-dark border border-garud-cream-border aspect-[3/4] mb-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className={`object-cover transition-opacity duration-500 ${
            hovered && product.images[1] ? 'opacity-0' : 'opacity-100'
          } ${outOfStock ? 'opacity-60 grayscale' : ''}`}
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alternate`}
            fill
            className={`object-cover absolute inset-0 transition-opacity duration-500 ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="bg-garud-teal text-garud-cream text-[9px] font-bold tracking-ultra px-2 py-0.5">
              NEW
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-garud-cream text-garud-teal border border-garud-teal/30 text-[9px] font-bold tracking-ultra px-2 py-0.5">
              BEST
            </span>
          )}
          {discount && (
            <span className="bg-garud-ochre text-white text-[9px] font-bold tracking-ultra px-2 py-0.5">
              -{discount}%
            </span>
          )}
          {outOfStock && (
            <span className="bg-red-700 text-white text-[9px] font-bold tracking-ultra px-2 py-0.5">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 w-8 h-8 bg-garud-cream/90 border border-garud-cream-border flex items-center justify-center text-garud-teal hover:border-garud-teal transition-colors"
        >
          <Heart size={14} className={isWishlisted ? 'fill-garud-ochre text-garud-ochre' : ''} />
        </button>

        {/* Quick Add */}
        <button
          onClick={handleQuickAdd}
          disabled={outOfStock}
          className={`absolute bottom-0 left-0 right-0 py-3.5 text-xs font-semibold tracking-ultra uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
            outOfStock
              ? 'bg-garud-muted text-garud-cream translate-y-0 cursor-not-allowed'
              : added
              ? 'bg-garud-ochre text-white translate-y-0'
              : 'bg-garud-teal text-garud-cream translate-y-full group-hover:translate-y-0'
          }`}
        >
          {outOfStock ? (
            'Out of Stock'
          ) : added ? (
            <>✓ Added to Cart</>
          ) : (
            <>
              <ShoppingBag size={12} />
              Quick Add ({inStockVariant?.size})
            </>
          )}
        </button>
      </div>

      {errorMsg && <p className="text-[11px] text-red-700 mb-1 font-medium">{errorMsg}</p>}

      <div className="space-y-1.5">
        <p className="text-garud-muted text-[10px] tracking-ultra uppercase font-medium">{product.categoryLabel}</p>
        <h3 className="text-garud-ink font-semibold text-sm group-hover:text-garud-teal transition-colors leading-tight">
          {product.name}
        </h3>

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

        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-garud-teal font-bold text-sm">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="text-garud-muted text-xs line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <div className="flex gap-1 flex-wrap pt-1">
          {product.sizes.slice(0, 6).map(size => (
            <span key={size} className="text-[9px] text-garud-muted border border-garud-cream-border px-1.5 py-0.5 bg-garud-cream-dark/40">
              {size}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
