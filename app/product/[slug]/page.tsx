'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug, getRelatedProducts } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingBag, Truck, Shield, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Props {
  params: { slug: string };
}

export default function ProductPage({ params }: Props) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [descOpen, setDescOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addItem({ product, quantity: 1, size: selectedSize, color: selectedColor });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] tracking-ultra uppercase text-garud-muted mb-8">
          <Link href="/" className="hover:text-garud-teal transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-garud-teal transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-garud-teal transition-colors">{product.categoryLabel}</Link>
          <span>/</span>
          <span className="text-garud-teal font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20">
          {/* Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-garud-cream-dark border border-garud-cream-border">
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount && (
                  <span className="bg-garud-ochre text-white text-[9px] font-bold tracking-ultra px-2 py-1">
                    -{discount}% OFF
                  </span>
                )}
                {product.tags.includes('limited') && (
                  <span className="bg-garud-teal text-garud-cream text-[9px] font-bold tracking-ultra px-2 py-1">
                    LIMITED EDITION
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-24 overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-garud-teal' : 'border-garud-cream-border'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-garud-teal text-[10px] tracking-mega uppercase font-bold mb-2">{product.categoryLabel}</p>
            <h1 className="font-display text-3xl md:text-5xl tracking-widest text-garud-teal font-bold mb-3">{product.name.toUpperCase()}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={13}
                    className={s <= Math.round(product.rating) ? 'fill-garud-teal text-garud-teal' : 'fill-garud-cream-border text-garud-cream-border'}
                  />
                ))}
              </div>
              <span className="text-garud-muted text-xs">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-display text-3xl text-garud-teal tracking-widest font-bold">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="text-garud-muted text-lg line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              {discount && (
                <span className="text-garud-ochre text-sm font-semibold">Save {discount}%</span>
              )}
            </div>

            <div className="teal-line mb-6" />

            {/* Color */}
            <div className="mb-6">
              <p className="text-garud-muted text-[10px] tracking-ultra uppercase font-semibold mb-3">
                Color: <span className="text-garud-teal font-bold">{selectedColor}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.name ? 'border-garud-teal scale-110 ring-2 ring-garud-teal/30' : 'border-garud-cream-border'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-garud-muted text-[10px] tracking-ultra uppercase font-semibold">
                  Size: <span className="text-garud-teal font-bold">{selectedSize || 'Select Size'}</span>
                </p>
                <span className="text-garud-teal text-[10px] tracking-ultra uppercase font-semibold">
                  Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 text-xs font-semibold tracking-ultra uppercase border transition-all ${
                      selectedSize === size
                        ? 'bg-garud-teal text-garud-cream border-garud-teal'
                        : 'border-garud-cream-border bg-garud-cream-dark/40 text-garud-ink hover:border-garud-teal hover:text-garud-teal'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 font-semibold text-sm tracking-ultra uppercase flex items-center justify-center gap-3 transition-all duration-300 mb-3 ${
                added
                  ? 'bg-garud-ochre text-white'
                  : 'btn-teal w-full'
              }`}
            >
              {added ? (
                '✓ Added to Cart!'
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Cart
                </>
              )}
            </motion.button>
            <Link href="/cart" className="btn-outline-teal w-full text-center text-sm mb-6 block">
              Buy Now
            </Link>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Above ₹999' },
                { icon: Shield, label: '100% Genuine', sub: 'Verified Products' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
              ].map(({ icon: Icon, label, sub }, i) => (
                <div key={i} className="bg-garud-cream-dark border border-garud-cream-border p-3 text-center">
                  <Icon size={16} className="mx-auto text-garud-teal mb-1.5" />
                  <p className="text-garud-teal text-[10px] font-bold tracking-ultra uppercase">{label}</p>
                  <p className="text-garud-muted text-[9px]">{sub}</p>
                </div>
              ))}
            </div>

            {/* Accordion: Description */}
            <div className="border-t border-garud-cream-border">
              <button
                onClick={() => setDescOpen(!descOpen)}
                className="w-full flex items-center justify-between py-4 text-xs tracking-ultra uppercase text-garud-teal font-semibold hover:text-garud-ochre transition-colors"
              >
                Description
                {descOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {descOpen && (
                <p className="text-garud-ink/80 text-sm leading-relaxed pb-5">{product.description}</p>
              )}
            </div>

            {/* Accordion: Details */}
            <div className="border-t border-garud-cream-border">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex items-center justify-between py-4 text-xs tracking-ultra uppercase text-garud-teal font-semibold hover:text-garud-ochre transition-colors"
              >
                Product Details
                {detailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {detailsOpen && (
                <div className="pb-5 space-y-2 text-sm">
                  {[
                    { label: 'Material', value: product.material },
                    { label: 'Category', value: product.categoryLabel },
                    { label: 'Available Sizes', value: product.sizes.join(', ') },
                    { label: 'SKU', value: product.id.toUpperCase() },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-4">
                      <span className="text-garud-muted w-32 flex-shrink-0 text-xs tracking-ultra uppercase font-semibold">{label}</span>
                      <span className="text-garud-ink text-xs">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <div className="teal-line mb-10" />
            <h2 className="font-display text-3xl md:text-4xl tracking-widest text-garud-teal font-bold mb-10">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
