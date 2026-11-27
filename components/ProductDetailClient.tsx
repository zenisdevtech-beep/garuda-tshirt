'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Heart,
  Minus,
  Plus,
  ZoomIn,
  X,
  Ruler,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProductDTO } from '@/lib/product-utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';

interface ReviewDTO {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  comment: string;
  verified: boolean;
  createdAt: string;
}

interface Props {
  product: ProductDTO;
  initialReviews: ReviewDTO[];
  related: ProductDTO[];
}

export default function ProductDetailClient({ product, initialReviews, related }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const { user, wishlistIds, toggleWishlist } = useAuth();

  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Jet Black');
  const [selectedSize, setSelectedSize] = useState(() => {
    const firstAvailable = product.variants.find(
      v => v.color === (product.colors[0]?.name || 'Jet Black') && v.stock > 0
    );
    return firstAvailable?.size || product.sizes[0] || '';
  });
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [added, setAdded] = useState(false);
  const [actionError, setActionError] = useState('');
  const [descOpen, setDescOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // PIN code serviceability
  const [pinCode, setPinCode] = useState('');
  const [pinResult, setPinResult] = useState<{ serviceable: boolean; message: string } | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<ReviewDTO[]>(initialReviews);
  const [revAuthor, setRevAuthor] = useState(user?.name || '');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revStatus, setRevStatus] = useState('');

  const activeVariant = product.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );
  const availableStock = activeVariant?.stock ?? 0;
  const isWishlisted = wishlistIds.includes(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);
    setActionError('');
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setActionError('Please select a size.');
      return;
    }
    if (availableStock <= 0) {
      setActionError('This size is currently out of stock.');
      return;
    }
    const res = await addItem({
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    if (res.ok) {
      setActionError('');
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setActionError(res.error || 'Failed to add to cart.');
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize || availableStock <= 0) {
      setActionError('Please select an in-stock size.');
      return;
    }
    const res = await addItem({
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
      openDrawer: false,
    });
    if (res.ok) {
      router.push('/checkout');
    } else {
      setActionError(res.error || 'Could not proceed to checkout.');
    }
  };

  const handlePinCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingPin(true);
    setPinResult(null);
    try {
      const res = await fetch(`/api/shipping/check?pincode=${encodeURIComponent(pinCode)}`);
      const data = await res.json();
      setPinResult({ serviceable: Boolean(data.serviceable), message: data.message });
    } catch {
      setPinResult({ serviceable: false, message: 'Could not verify PIN code right now.' });
    } finally {
      setCheckingPin(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevStatus('');
    const res = await fetch(`/api/products/${product.slug}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: user?.name || revAuthor,
        rating: revRating,
        comment: revComment,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setRevStatus(data.error || 'Failed to submit review.');
      return;
    }
    setReviews(prev => [data.review, ...prev]);
    setRevComment('');
    setRevStatus('Thank you! Your review has been published.');
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
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
          {/* Image Gallery with Zoom */}
          <div className="space-y-3">
            <div
              className="relative aspect-[4/5] overflow-hidden bg-garud-cream-dark border border-garud-cream-border cursor-zoom-in"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomPos({ x, y });
              }}
            >
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-200"
                style={
                  zoomed
                    ? { transform: 'scale(1.65)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                    : undefined
                }
                priority
              />
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
              <span className="absolute bottom-3 right-3 bg-garud-cream/90 text-garud-teal text-[10px] px-2.5 py-1 flex items-center gap-1 border border-garud-cream-border">
                <ZoomIn size={12} /> Hover to Zoom
              </span>
            </div>

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

          {/* Product Details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-garud-teal text-[10px] tracking-mega uppercase font-bold">{product.categoryLabel} · SKU {product.sku}</p>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="flex items-center gap-1.5 text-xs text-garud-teal hover:text-garud-ochre font-semibold"
              >
                <Heart size={15} className={isWishlisted ? 'fill-garud-ochre text-garud-ochre' : ''} />
                {isWishlisted ? 'Saved' : 'Wishlist'}
              </button>
            </div>

            <h1 className="font-display text-3xl md:text-5xl tracking-widest text-garud-teal font-bold mb-3">
              {product.name.toUpperCase()}
            </h1>

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
              <span className="text-garud-muted text-xs">{product.rating} ({reviews.length || product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="font-display text-3xl text-garud-teal tracking-widest font-bold">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="text-garud-muted text-lg line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              {discount && <span className="text-garud-ochre text-sm font-semibold">Save {discount}%</span>}
            </div>

            <div className="teal-line mb-6" />

            {/* Color Selection */}
            <div className="mb-6">
              <p className="text-garud-muted text-[10px] tracking-ultra uppercase font-semibold mb-3">
                Color: <span className="text-garud-teal font-bold">{selectedColor}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setQuantity(1);
                    }}
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.name ? 'border-garud-teal scale-110 ring-2 ring-garud-teal/30' : 'border-garud-cream-border'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection with Stock Availability */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-garud-muted text-[10px] tracking-ultra uppercase font-semibold">
                  Size: <span className="text-garud-teal font-bold">{selectedSize}</span>
                  {selectedSize && (
                    <span className={`ml-2 ${availableStock > 0 ? 'text-garud-teal' : 'text-red-700'}`}>
                      ({availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'})
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-garud-teal text-[10px] tracking-ultra uppercase font-semibold flex items-center gap-1 hover:text-garud-ochre underline"
                >
                  <Ruler size={12} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => {
                  const variant = product.variants.find(v => v.size === size && v.color === selectedColor);
                  const inStock = (variant?.stock ?? 0) > 0;
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      disabled={!inStock}
                      className={`px-4 py-2.5 text-xs font-semibold tracking-ultra uppercase border transition-all ${
                        !inStock
                          ? 'border-garud-cream-border bg-garud-cream-dark/20 text-garud-muted/40 line-through cursor-not-allowed'
                          : selectedSize === size
                          ? 'bg-garud-teal text-garud-cream border-garud-teal'
                          : 'border-garud-cream-border bg-garud-cream-dark/40 text-garud-ink hover:border-garud-teal hover:text-garud-teal'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-garud-muted text-[10px] tracking-ultra uppercase font-semibold mb-2">Quantity</p>
              <div className="flex items-center border border-garud-cream-border bg-garud-cream-dark/40 w-fit">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-garud-teal hover:bg-garud-cream-dark"
                >
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center text-sm font-bold text-garud-teal">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(Math.max(1, availableStock), q + 1))}
                  disabled={quantity >= availableStock}
                  className="w-10 h-10 flex items-center justify-center text-garud-teal hover:bg-garud-cream-dark disabled:opacity-40"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {actionError && <p className="text-red-700 text-xs font-semibold mb-3">{actionError}</p>}

            <motion.button
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 font-semibold text-sm tracking-ultra uppercase flex items-center justify-center gap-3 transition-all duration-300 mb-3 disabled:opacity-50 ${
                added ? 'bg-garud-ochre text-white' : 'btn-teal w-full'
              }`}
            >
              {availableStock <= 0 ? (
                'Out of Stock'
              ) : added ? (
                '✓ Added to Cart!'
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Cart
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={availableStock <= 0}
              className="btn-outline-teal w-full text-center text-sm mb-6 block disabled:opacity-50"
            >
              Buy Now
            </button>

            {/* PIN Code Delivery Check */}
            <form onSubmit={handlePinCheck} className="bg-garud-cream-dark/50 border border-garud-cream-border p-4 mb-6">
              <p className="text-garud-teal text-[10px] tracking-ultra uppercase font-bold mb-2">Check Delivery Availability</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code"
                  className="flex-1 bg-garud-cream border border-garud-cream-border px-3 py-2 text-xs text-garud-ink outline-none focus:border-garud-teal"
                />
                <button type="submit" disabled={checkingPin} className="bg-garud-teal text-garud-cream px-4 py-2 text-xs font-semibold uppercase tracking-ultra">
                  {checkingPin ? '...' : 'Check'}
                </button>
              </div>
              {pinResult && (
                <p className={`text-xs mt-2 font-medium ${pinResult.serviceable ? 'text-garud-teal' : 'text-red-700'}`}>
                  {pinResult.message}
                </p>
              )}
            </form>

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
                className="w-full flex items-center justify-between py-4 text-xs tracking-ultra uppercase text-garud-teal font-semibold"
              >
                Description
                {descOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {descOpen && <p className="text-garud-ink/80 text-sm leading-relaxed pb-5">{product.description}</p>}
            </div>

            {/* Accordion: Details */}
            <div className="border-t border-garud-cream-border">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex items-center justify-between py-4 text-xs tracking-ultra uppercase text-garud-teal font-semibold"
              >
                Product Details &amp; Shipping
                {detailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {detailsOpen && (
                <div className="pb-5 space-y-2 text-sm">
                  {[
                    { label: 'Material', value: product.material },
                    { label: 'Category', value: product.categoryLabel },
                    { label: 'SKU', value: product.sku },
                    { label: 'Shipping', value: 'Dispatched within 24–48 hours across India.' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-4">
                      <span className="text-garud-muted w-28 flex-shrink-0 text-xs tracking-ultra uppercase font-semibold">{label}</span>
                      <span className="text-garud-ink text-xs">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mb-20">
          <div className="teal-line mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <h2 className="font-display text-3xl tracking-widest text-garud-teal font-bold mb-4">WRITE A REVIEW</h2>
              <form onSubmit={handleReviewSubmit} className="bg-garud-cream-dark/60 border border-garud-cream-border p-6 space-y-4">
                {!user && (
                  <input
                    type="text"
                    required
                    value={revAuthor}
                    onChange={e => setRevAuthor(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-sm outline-none focus:border-garud-teal"
                  />
                )}
                <div>
                  <p className="text-xs font-semibold text-garud-teal mb-1.5 uppercase tracking-ultra">Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRevRating(star)}
                        className="p-1"
                      >
                        <Star size={18} className={star <= revRating ? 'fill-garud-ochre text-garud-ochre' : 'text-garud-muted'} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  required
                  rows={3}
                  value={revComment}
                  onChange={e => setRevComment(e.target.value)}
                  placeholder="Share your fit, fabric quality, and styling feedback..."
                  className="w-full bg-garud-cream border border-garud-cream-border px-3 py-2.5 text-sm outline-none focus:border-garud-teal"
                />
                <button type="submit" className="btn-teal w-full text-center">
                  Submit Review
                </button>
                {revStatus && <p className="text-xs text-garud-teal font-semibold">{revStatus}</p>}
              </form>
            </div>

            <div className="lg:col-span-7">
              <h2 className="font-display text-3xl tracking-widest text-garud-teal font-bold mb-4">
                WARRIOR REVIEWS ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-garud-muted text-sm">Be the first warrior to review this piece.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-garud-cream-dark/40 border border-garud-cream-border p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-garud-teal">{r.author}</span>
                          {r.verified && (
                            <span className="text-[9px] bg-garud-teal text-garud-cream px-2 py-0.5 uppercase tracking-ultra">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={11} className={s <= r.rating ? 'fill-garud-ochre text-garud-ochre' : 'text-garud-cream-border'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-garud-ink/85 text-sm">{r.comment}</p>
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

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-garud-teal-deep/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-garud-cream border border-garud-cream-border max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl tracking-widest text-garud-teal font-bold">GARUD SIZE GUIDE (INCHES)</h3>
              <button onClick={() => setSizeGuideOpen(false)} className="text-garud-muted hover:text-garud-teal">
                <X size={20} />
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-garud-teal text-garud-cream">
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Chest</th>
                  <th className="p-2.5">Length</th>
                  <th className="p-2.5">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garud-cream-border">
                {[
                  ['XS', '40"', '26.5"', '19.5"'],
                  ['S', '42"', '27.5"', '20.5"'],
                  ['M', '44"', '28.5"', '21.5"'],
                  ['L', '46"', '29.5"', '22.5"'],
                  ['XL', '48"', '30.5"', '23.5"'],
                  ['XXL', '50"', '31.5"', '24.5"'],
                ].map(row => (
                  <tr key={row[0]} className="bg-garud-cream-dark/40">
                    {row.map((cell, i) => (
                      <td key={i} className={`p-2.5 ${i === 0 ? 'font-bold text-garud-teal' : 'text-garud-ink'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-garud-muted mt-4">
              Oversized streetwear fit. Size down for a closer tailored fit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
