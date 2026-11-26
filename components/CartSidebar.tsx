'use client';

import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function CartSidebar() {
  const { state, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-garud-teal-deep/60 cart-overlay z-50"
            onClick={closeCart}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-garud-cream z-50 flex flex-col border-l border-garud-cream-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-garud-cream-border">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-garud-teal" />
                <span className="font-display text-xl tracking-widest text-garud-teal font-bold">CART</span>
                {totalItems > 0 && (
                  <span className="bg-garud-teal text-garud-cream text-[10px] font-bold px-2 py-0.5">
                    {totalItems}
                  </span>
                )}
              </div>
              <button onClick={closeCart} className="text-garud-muted hover:text-garud-teal transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {state.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center">
                  <ShoppingBag size={40} className="text-garud-teal/20" />
                  <p className="text-garud-muted text-sm">Your cart is empty, warrior.</p>
                  <button onClick={closeCart} className="btn-outline-teal text-xs">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-garud-cream-border">
                  {state.items.map((item, i) => (
                    <li key={i} className="flex gap-4 px-6 py-4">
                      <div className="relative w-20 h-24 flex-shrink-0 bg-garud-cream-dark border border-garud-cream-border overflow-hidden">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-garud-ink text-sm font-semibold leading-tight mb-1 truncate">{item.product.name}</p>
                        <p className="text-garud-muted text-xs mb-1">{item.size} · {item.color}</p>
                        <p className="text-garud-teal text-sm font-bold mb-3">
                          ₹{item.product.price.toLocaleString('en-IN')}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                            className="w-7 h-7 border border-garud-cream-border flex items-center justify-center text-garud-teal hover:border-garud-teal transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-garud-ink text-sm w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                            className="w-7 h-7 border border-garud-cream-border flex items-center justify-center text-garud-teal hover:border-garud-teal transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="ml-auto text-garud-muted hover:text-red-600 transition-colors"
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

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-garud-cream-border p-6 space-y-4 bg-garud-cream-dark/50">
                {/* Free shipping bar */}
                {totalPrice < 999 && (
                  <div>
                    <div className="flex justify-between text-xs text-garud-muted mb-1.5">
                      <span>Add ₹{(999 - totalPrice).toLocaleString('en-IN')} for free shipping</span>
                      <span>{Math.round((totalPrice / 999) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-garud-cream-border">
                      <div
                        className="h-full bg-garud-teal transition-all duration-300"
                        style={{ width: `${Math.min((totalPrice / 999) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {totalPrice >= 999 && (
                  <p className="text-garud-teal text-xs text-center font-semibold">Free shipping unlocked!</p>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-garud-muted text-sm">Subtotal</span>
                  <span className="text-garud-teal font-bold text-lg">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-garud-muted text-xs">Taxes and shipping calculated at checkout</p>

                <Link href="/cart" onClick={closeCart} className="btn-teal w-full text-center block">
                  Proceed to Checkout
                </Link>
                <button onClick={closeCart} className="btn-outline-teal w-full text-center block text-xs">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
