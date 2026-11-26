'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Shield, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { state, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const shipping = totalPrice >= 999 ? 0 : 99;
  const discount = promoApplied ? Math.round(totalPrice * 0.1) : 0;
  const finalTotal = totalPrice - discount + shipping;

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'GARUD10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
      setPromoApplied(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-garud-cream flex flex-col items-center justify-center px-6 py-24">
        <ShoppingBag size={60} className="text-garud-teal/20 mb-6" />
        <h1 className="font-display text-3xl md:text-4xl tracking-widest text-garud-teal font-bold mb-3">YOUR CART IS EMPTY</h1>
        <p className="text-garud-muted text-sm mb-8 text-center">The warrior needs equipment. Start your collection.</p>
        <Link href="/shop" className="btn-teal">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-1">Review Order</p>
            <h1 className="font-display text-3xl md:text-5xl tracking-widest text-garud-teal font-bold">YOUR CART ({totalItems})</h1>
          </div>
          <Link href="/shop" className="text-garud-muted hover:text-garud-teal transition-colors flex items-center gap-2 text-xs tracking-ultra uppercase font-semibold">
            <ArrowLeft size={12} />
            Continue Shopping
          </Link>
        </div>

        <div className="teal-line mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {state.items.map((item) => (
                <motion.div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-garud-cream-dark border border-garud-cream-border flex gap-5 p-4"
                >
                  {/* Image */}
                  <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden bg-garud-cream border border-garud-cream-border">
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-1">
                      <Link href={`/product/${item.product.slug}`} className="text-garud-teal font-semibold text-sm hover:text-garud-ochre transition-colors leading-tight">
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.product.id, item.size, item.color)}
                        className="text-garud-muted hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-garud-muted text-xs mb-1">{item.size} · {item.color}</p>
                    <p className="text-garud-muted text-xs mb-4">{item.product.material}</p>

                    <div className="flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center gap-2 border border-garud-cream-border bg-garud-cream w-fit">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-garud-teal hover:bg-garud-cream-dark transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-garud-ink text-sm w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-garud-teal hover:bg-garud-cream-dark transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-garud-teal font-bold">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                        {item.quantity > 1 && (
                          <p className="text-garud-muted text-xs">₹{item.product.price.toLocaleString('en-IN')} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Truck, text: 'Free shipping on orders above ₹999' },
                { icon: Shield, text: '100% genuine products guaranteed' },
                { icon: Tag, text: 'Use GARUD10 for 10% off first order' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="border border-garud-cream-border bg-garud-cream-dark/40 p-4 flex flex-col items-center text-center gap-2">
                  <Icon size={18} className="text-garud-teal" />
                  <p className="text-garud-muted text-[10px] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-garud-cream-dark border border-garud-cream-border p-6 sticky top-24">
              <h2 className="font-display text-2xl tracking-widest text-garud-teal font-bold mb-6">ORDER SUMMARY</h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-garud-muted">Subtotal ({totalItems} items)</span>
                  <span className="text-garud-ink font-semibold">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-garud-muted">Shipping</span>
                  <span className={shipping === 0 ? 'text-garud-teal font-semibold' : 'text-garud-ink'}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between">
                    <span className="text-garud-ochre font-semibold">Promo (GARUD10)</span>
                    <span className="text-garud-ochre font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="teal-line mb-6" />

              {/* Promo */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder="Promo code (try GARUD10)"
                    className="flex-1 bg-garud-cream border border-garud-cream-border text-garud-ink placeholder:text-garud-muted/60 px-3 py-2.5 text-xs outline-none focus:border-garud-teal transition-colors"
                  />
                  <button
                    onClick={applyPromo}
                    className="bg-garud-teal text-garud-cream hover:bg-garud-teal-light px-4 py-2.5 text-xs font-semibold tracking-ultra uppercase transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-red-600 text-[10px] mt-1.5">{promoError}</p>}
                {promoApplied && <p className="text-garud-teal text-[10px] font-semibold mt-1.5">✓ 10% discount applied!</p>}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-garud-ink font-semibold">Total</span>
                <span className="font-display text-2xl text-garud-teal tracking-widest font-bold">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>

              <button className="btn-teal w-full text-center block mb-3">
                Proceed to Checkout
              </button>
              <p className="text-garud-muted text-[10px] text-center tracking-widest uppercase">
                Secure checkout · Razorpay · UPI · Cards
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
