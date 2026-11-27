'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  wishlistIds: string[];
  refreshAuth: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<{ ok: boolean; wishlisted?: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const refreshWishlist = useCallback(async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlistIds((data.items || []).map((p: { id: string }) => p.id));
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        if (data.user) {
          await refreshWishlist();
        } else {
          setWishlistIds([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [refreshWishlist]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const toggleWishlist = async (productId: string) => {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Please sign in to save wishlist items.' };
    }
    if (data.wishlisted) {
      setWishlistIds(prev => (prev.includes(productId) ? prev : [...prev, productId]));
    } else {
      setWishlistIds(prev => prev.filter(id => id !== productId));
    }
    return { ok: true, wishlisted: data.wishlisted };
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setWishlistIds([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, wishlistIds, refreshAuth, refreshWishlist, toggleWishlist, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
