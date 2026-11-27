'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, User, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import type { ProductDTO } from '@/lib/product-utils';

const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'About', href: '/about' },
];

export default function Navbar() {
  const { state, toggleCart } = useCart();
  const { user, wishlistIds } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductDTO[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } finally {
        setSearching(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery, searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setSearchOpen(false);
    router.push(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop');
  };

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-garud-cream/95 backdrop-blur-md shadow-[0_4px_24px_rgba(11,70,84,0.08)] border-b border-garud-cream-border'
            : 'bg-garud-cream border-b border-garud-cream-border/70'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-6">
          {/* Left: Mobile Menu + Brand Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-garud-teal hover:text-garud-ochre transition-colors lg:hidden p-1"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
              aria-label="Garud Home"
            >
              <div className="relative h-12 w-14 flex-shrink-0">
                <Image
                  src="/images/garud-logo.png"
                  alt="Garud Logo"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <span className="font-display text-2xl tracking-[0.22em] text-garud-teal font-bold hidden sm:inline">
                GARUD
              </span>
            </Link>
          </div>

          {/* Center: Clean Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-9">
            {navLinks.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] tracking-[0.22em] uppercase font-semibold transition-colors duration-200 relative py-1.5 whitespace-nowrap ${
                    active ? 'text-garud-ochre' : 'text-garud-teal hover:text-garud-ochre'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[1.5px] bg-garud-ochre transition-transform duration-300 origin-left ${
                      active ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: Icons + Auth */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-garud-teal hover:text-garud-ochre transition-colors p-1"
              aria-label="Search products"
              title="Search"
            >
              <Search size={18} />
            </button>

            <Link
              href={user ? '/account?tab=wishlist' : '/login'}
              className="text-garud-teal hover:text-garud-ochre transition-colors relative hidden sm:block p-1"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart size={18} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-garud-ochre text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            <button
              onClick={toggleCart}
              className="text-garud-teal hover:text-garud-ochre transition-colors relative p-1"
              aria-label="Cart"
              title="Cart"
            >
              <ShoppingBag size={19} />
              {state.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-garud-teal text-garud-cream text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {state.totalItems}
                </span>
              )}
            </button>

            <span className="hidden sm:block h-4 w-[1px] bg-garud-cream-border" />

            {user ? (
              <Link
                href="/account"
                className="text-garud-teal hover:text-garud-ochre transition-colors flex items-center gap-1.5 text-[11px] tracking-[0.18em] uppercase font-semibold"
                aria-label="Customer Account"
                title={user.name}
              >
                <User size={17} />
                <span className="hidden md:inline">{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-garud-teal hover:text-garud-ochre text-[11px] tracking-[0.18em] uppercase font-semibold transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-garud-teal text-garud-cream hover:bg-garud-teal-light text-[11px] tracking-[0.18em] uppercase font-semibold px-4 py-2 transition-colors whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-garud-teal-deep/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-garud-cream border border-garud-cream-border w-full max-w-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xl tracking-widest text-garud-teal font-bold">SEARCH GARUD</span>
              <button onClick={() => setSearchOpen(false)} className="text-garud-muted hover:text-garud-teal">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-5">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tees, hoodies, jackets, SKU..."
                className="flex-1 bg-white border border-garud-cream-border text-garud-ink px-4 py-3 text-sm outline-none focus:border-garud-teal"
              />
              <button type="submit" className="btn-teal px-6 py-3">
                Search
              </button>
            </form>

            {searching && <p className="text-garud-muted text-xs">Searching...</p>}
            {!searching && searchQuery.trim() && searchResults.length === 0 && (
              <p className="text-garud-muted text-sm py-4">No products found matching &ldquo;{searchQuery}&rdquo;.</p>
            )}
            {searchResults.length > 0 && (
              <div className="divide-y divide-garud-cream-border max-h-80 overflow-y-auto">
                {searchResults.map(p => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-4 py-3 hover:bg-garud-cream-dark/60 px-2 transition-colors"
                  >
                    <div className="relative w-12 h-14 bg-garud-cream-dark flex-shrink-0 border border-garud-cream-border">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-garud-teal font-semibold text-sm truncate">{p.name}</p>
                      <p className="text-garud-muted text-xs">{p.categoryLabel}</p>
                    </div>
                    <span className="text-garud-teal font-bold text-sm">₹{p.price.toLocaleString('en-IN')}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-garud-cream flex flex-col">
          <div className="flex justify-between items-center px-6 h-[72px] border-b border-garud-cream-border">
            <div className="flex items-center gap-2">
              <div className="relative h-11 w-14">
                <Image src="/images/garud-logo.png" alt="Garud Logo" fill className="object-contain" />
              </div>
              <span className="font-display text-xl tracking-[0.22em] text-garud-teal font-bold">GARUD</span>
            </div>
            <button onClick={() => setMenuOpen(false)} className="text-garud-teal hover:text-garud-teal-light transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center px-8 gap-6 overflow-y-auto">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-3xl tracking-widest text-garud-teal hover:text-garud-ochre transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="teal-line my-2" />
            {user ? (
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="text-sm tracking-ultra uppercase font-semibold text-garud-teal"
              >
                Account ({user.name})
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-outline-teal text-xs px-5 py-2.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn-teal text-xs px-5 py-2.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-ultra uppercase font-semibold text-garud-muted"
            >
              Contact Us
            </Link>
          </div>
          <div className="px-8 py-6 border-t border-garud-cream-border">
            <p className="text-garud-muted text-xs tracking-ultra uppercase">Born from myth. Worn by warriors.</p>
          </div>
        </div>
      )}
    </>
  );
}
