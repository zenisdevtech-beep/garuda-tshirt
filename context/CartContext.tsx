'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ProductDTO } from '@/lib/product-utils';

export interface ServerCartItem {
  id: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
  availableStock: number;
  inStock: boolean;
  lineTotal: number;
  product: ProductDTO;
}

interface CartState {
  items: ServerCartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  couponMessage: string;
  couponValid: boolean;
  shippingCharge: number;
  freeShippingThreshold: number;
  total: number;
  codEnabled: boolean;
}

const emptyCart: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  discount: 0,
  couponCode: null,
  couponMessage: '',
  couponValid: false,
  shippingCharge: 0,
  freeShippingThreshold: 999,
  total: 0,
  codEnabled: true,
};

interface CartContextType {
  state: CartState;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  refreshCart: (coupon?: string | null) => Promise<void>;
  addItem: (params: {
    productId: string;
    size: string;
    color: string;
    quantity?: number;
    openDrawer?: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  removeItem: (itemId: string) => Promise<void>;
  updateItem: (itemId: string, updates: { quantity?: number; size?: string; color?: string }) => Promise<{ ok: boolean; error?: string }>;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CartState>(emptyCart);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<string | null>(null);

  const refreshCart = useCallback(async (couponOverride?: string | null) => {
    try {
      const code = couponOverride !== undefined ? couponOverride : activeCoupon;
      const url = code ? `/api/cart?coupon=${encodeURIComponent(code)}` : '/api/cart';
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as CartState;
        setState(data);
      }
    } finally {
      setLoading(false);
    }
  }, [activeCoupon]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async ({
    productId,
    size,
    color,
    quantity = 1,
    openDrawer = true,
  }: {
    productId: string;
    size: string;
    color: string;
    quantity?: number;
    openDrawer?: boolean;
  }) => {
    setError(null);
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, size, color, quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Could not add item');
      return { ok: false, error: data.error || 'Could not add item' };
    }
    setState(data);
    if (openDrawer) setIsOpen(true);
    return { ok: true };
  };

  const updateItem = async (
    itemId: string,
    updates: { quantity?: number; size?: string; color?: string }
  ) => {
    setError(null);
    const res = await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, ...updates }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Could not update item');
      return { ok: false, error: data.error || 'Could not update item' };
    }
    if (activeCoupon) {
      await refreshCart(activeCoupon);
    } else {
      setState(data);
    }
    return { ok: true };
  };

  const removeItem = async (itemId: string) => {
    const res = await fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      if (activeCoupon) {
        await refreshCart(activeCoupon);
      } else {
        setState(await res.json());
      }
    }
  };

  const applyCoupon = async (code: string) => {
    const res = await fetch('/api/cart/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = (await res.json()) as CartState;
    if (res.ok && data.couponValid) {
      setActiveCoupon(data.couponCode);
      setState(data);
      return { ok: true, message: data.couponMessage };
    }
    setActiveCoupon(null);
    setState(prev => ({ ...prev, discount: 0, couponCode: null, couponValid: false, couponMessage: data.couponMessage || 'Invalid coupon' }));
    return { ok: false, message: data.couponMessage || 'Invalid coupon code' };
  };

  const clearCart = async () => {
    const res = await fetch('/api/cart', { method: 'DELETE' });
    if (res.ok) {
      setActiveCoupon(null);
      setState(await res.json());
    }
  };

  return (
    <CartContext.Provider
      value={{
        state,
        isOpen,
        loading,
        error,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen(v => !v),
        refreshCart,
        addItem,
        removeItem,
        updateItem,
        applyCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
