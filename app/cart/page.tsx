'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Shield, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { state, removeItem, updateItem, applyCoupon } = useCart();
  const [promoCode, setPromoCode] = useState(state.couponCode || '');
  const [promoStatus, setPromoStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [actionError, setActionError] = useState('');

  const handleApplyPromo = async () => {
    setPromoStatus(null);
    const res = await applyCoupon(promoCode);
    setPromoStatus({ ok: res.ok, msg: res.message });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-6 py-24">
        <ShoppingBag size={60} className="text-garud-teal/20 mb-6" />
        <h1 className="font-display text-3xl md:text-4xl tracking-widest text-garud-teal font-bold mb-3">YOUR CART IS EMPTY</h1>
        <p className="text-garud-muted text-sm mb-8 text-center">The warrior needs equipment. Start your collection.</p>
        <Link href="/shop" className="btn-teal">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-1">Review Order</p>
            <h1 className="font-display text-3xl md:text-5xl tracking-widest text-garud-teal font-bold">
              YOUR CART ({state.totalItems})
            </h1>
          </div>
          <Link href="/shop" className="text-garud-muted hover:text-garud-teal transition-colors flex items-center gap-2 text-xs tracking-ultra uppercase font-semibold">
            <ArrowLeft size={12} /> Continue Shopping
          </Link>
        </div>

        <div className="teal-line mb-10" />

        {actionError && <p className="text-red-700 text-xs font-semibold mb-4">{actionError}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {state.items.map(item => (
              <div
                key={item.id}
                className="bg-garud-cream-dark border border-garud-cream-border flex flex-col sm:flex-row gap-5 p-4"
              >
                <Link
                  href={`/product/${item.product.slug}`}
                  className="relative w-24 h-32 flex-shrink-0 overflow-hidden bg-garud-cream border border-garud-cream-border"
                >
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 mb-1">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="text-garud-teal font-semibold text-sm hover:text-garud-ochre transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-garud-muted hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="text-garud-muted text-xs mb-3">
                    {item.color} · {item.product.material}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Size selector in cart */}
                      <select
                        value={item.size}
                        onChange={async (e) => {
                          const res = await updateItem(item.id, { size: e.target.value });
                          if (!res.ok && res.error) setActionError(res.error);
                          else setActionError('');
                        }}
                        className="bg-garud-cream border border-garud-cream-border text-garud-teal text-xs px-2.5 py-1.5 font-semibold outline-none"
                      >
                        {item.product.sizes.map(sz => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>

                      {/* Quantity selector */}
                      <div className="flex items-center gap-2 border border-garud-cream-border bg-garud-cream w-fit">
                        <button
                          onClick={async () => {
                            const res = await updateItem(item.id, { quantity: item.quantity - 1 });
                            if (!res.ok && res.error) setActionError(res.error);
                            else setActionError('');
                          }}
                          className="w-8 h-8 flex items-center justify-center text-garud-teal hover:bg-garud-cream-dark"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-garud-ink text-sm w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={async () => {
                            const res = await updateItem(item.id, { quantity: item.quantity + 1 });
                            if (!res.ok && res.error) setActionError(res.error);
                            else setActionError('');
                          }}
                          disabled={item.quantity >= item.availableStock}
                          className="w-8 h-8 flex items-center justify-center text-garud-teal hover:bg-garud-cream-dark disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-garud-teal font-bold">₹{item.lineTotal.toLocaleString('en-IN')}</p>
                      {item.quantity > 1 && (
                        <p className="text-garud-muted text-xs">₹{item.product.price.toLocaleString('en-IN')} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Truck, text: `Free shipping above ₹${state.freeShippingThreshold}` },
                { icon: Shield, text: '100% genuine products guaranteed' },
                { icon: Tag, text: 'Use GARUD10 for 10% off your order' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="border border-garud-cream-border bg-garud-cream-dark/40 p-4 flex flex-col items-center text-center gap-2">
                  <Icon size={18} className="text-garud-teal" />
                  <p className="text-garud-muted text-[10px] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-garud-cream-dark border border-garud-cream-border p-6 sticky top-24">
              <h2 className="font-display text-2xl tracking-widest text-garud-teal font-bold mb-6">ORDER SUMMARY</h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-garud-muted">Subtotal ({state.totalItems} items)</span>
                  <span className="text-garud-ink font-semibold">₹{state.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {state.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-garud-ochre font-semibold">Discount ({state.couponCode})</span>
                    <span className="text-garud-ochre font-semibold">-₹{state.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-garud-muted">Shipping</span>
                  <span className={state.shippingCharge === 0 ? 'text-garud-teal font-semibold' : 'text-garud-ink'}>
                    {state.shippingCharge === 0 ? 'FREE' : `₹${state.shippingCharge}`}
                  </span>
                </div>
              </div>

              <div className="teal-line mb-6" />

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder="Coupon code (e.g. GARUD10)"
                    className="flex-1 bg-garud-cream border border-garud-cream-border text-garud-ink placeholder:text-garud-muted/60 px-3 py-2.5 text-xs outline-none focus:border-garud-teal"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-garud-teal text-garud-cream hover:bg-garud-teal-light px-4 py-2.5 text-xs font-semibold tracking-ultra uppercase"
                  >
                    Apply
                  </button>
                </div>
                {promoStatus && (
                  <p className={`text-[11px] mt-1.5 font-semibold ${promoStatus.ok ? 'text-garud-teal' : 'text-red-700'}`}>
                    {promoStatus.msg}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-garud-ink font-semibold">Payable Total</span>
                <span className="font-display text-2xl text-garud-teal tracking-widest font-bold">
                  ₹{state.total.toLocaleString('en-IN')}
                </span>
              </div>

              <Link href="/checkout" className="btn-teal w-full text-center block mb-3">
                Proceed to Checkout
              </Link>
              <p className="text-garud-muted text-[10px] text-center tracking-widest uppercase">
                Server-validated pricing · Razorpay &amp; COD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
