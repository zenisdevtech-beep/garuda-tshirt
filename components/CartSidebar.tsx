'use client';

import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function CartSidebar() {
  const { state, isOpen, closeCart, removeItem, updateItem } = useCart();

  const remainingForFreeShipping = Math.max(0, state.freeShippingThreshold - state.subtotal);
  const progressPct = Math.min(100, Math.round((state.subtotal / Math.max(1, state.freeShippingThreshold)) * 100));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-garud-teal-deep/60 cart-overlay z-50"
            onClick={closeCart}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-garud-cream z-50 flex flex-col border-l border-garud-cream-border shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-garud-cream-border">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-garud-teal" />
                <span className="font-display text-xl tracking-widest text-garud-teal font-bold">CART</span>
                {state.totalItems > 0 && (
                  <span className="bg-garud-teal text-garud-cream text-[10px] font-bold px-2 py-0.5">
                    {state.totalItems}
                  </span>
                )}
              </div>
              <button onClick={closeCart} className="text-garud-muted hover:text-garud-teal transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {state.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center">
                  <ShoppingBag size={40} className="text-garud-teal/20" />
                  <p className="text-garud-muted text-sm">Your cart is empty, warrior.</p>
                  <Link href="/shop" onClick={closeCart} className="btn-outline-teal text-xs">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-garud-cream-border">
                  {state.items.map(item => (
                    <li key={item.id} className="flex gap-4 px-6 py-4">
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-24 flex-shrink-0 bg-garud-cream-dark border border-garud-cream-border overflow-hidden"
                      >
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-garud-ink text-sm font-semibold leading-tight mb-1 truncate block hover:text-garud-teal"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-garud-muted text-xs mb-1">
                          {item.size} · {item.color}
                        </p>
                        <p className="text-garud-teal text-sm font-bold mb-3">
                          ₹{item.product.price.toLocaleString('en-IN')}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItem(item.id, { quantity: item.quantity - 1 })}
                            className="w-7 h-7 border border-garud-cream-border flex items-center justify-center text-garud-teal hover:border-garud-teal transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-garud-ink text-sm w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                            disabled={item.quantity >= item.availableStock}
                            className="w-7 h-7 border border-garud-cream-border flex items-center justify-center text-garud-teal hover:border-garud-teal transition-colors disabled:opacity-40"
                          >
                            <Plus size={11} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-garud-muted hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {state.items.length > 0 && (
              <div className="border-t border-garud-cream-border p-6 space-y-4 bg-garud-cream-dark/50">
                {remainingForFreeShipping > 0 ? (
                  <div>
                    <div className="flex justify-between text-xs text-garud-muted mb-1.5">
                      <span>Add ₹{remainingForFreeShipping.toLocaleString('en-IN')} for free shipping</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1 bg-garud-cream-border">
                      <div
                        className="h-full bg-garud-teal transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-garud-teal text-xs text-center font-semibold">Free shipping unlocked!</p>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-garud-muted text-sm">Subtotal</span>
                  <span className="text-garud-teal font-bold text-lg">₹{state.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-garud-muted text-xs">Shipping &amp; coupons calculated at checkout</p>

                <Link href="/checkout" onClick={closeCart} className="btn-teal w-full text-center block">
                  Proceed to Checkout
                </Link>
                <Link href="/cart" onClick={closeCart} className="btn-outline-teal w-full text-center block text-xs">
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
