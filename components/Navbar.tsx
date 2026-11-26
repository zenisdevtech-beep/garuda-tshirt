'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'About', href: '/about' },
];

export default function Navbar() {
  const { totalItems, toggleCart } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-garud-cream/95 backdrop-blur-md shadow-[0_4px_24px_rgba(11,70,84,0.08)] border-b border-garud-cream-border'
            : 'bg-garud-cream border-b border-garud-cream-border/70'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Mobile Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="text-garud-teal hover:text-garud-teal-light transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Nav Links - Left */}
          <div className="hidden lg:flex items-center gap-9">
            {navLinks.slice(0, 2).map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs tracking-ultra uppercase font-semibold transition-colors duration-200 relative py-1 ${
                    active ? 'text-garud-ochre' : 'text-garud-teal hover:text-garud-ochre'
                  }`}
                >
                  {link.label}
                  {active && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-garud-ochre" />}
                </Link>
              );
            })}
          </div>

          {/* Transparent Logo - Center */}
          <Link
            href="/"
            className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 group"
            aria-label="Garud Home"
          >
            <div className="relative h-16 w-24">
              <Image
                src="/images/garud-logo.png"
                alt="Garud Logo"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-5 ml-auto lg:ml-0">
            <div className="hidden lg:flex items-center gap-9 mr-2">
              {navLinks.slice(2).map(link => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs tracking-ultra uppercase font-semibold transition-colors duration-200 relative py-1 ${
                      active ? 'text-garud-ochre' : 'text-garud-teal hover:text-garud-ochre'
                    }`}
                  >
                    {link.label}
                    {active && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-garud-ochre" />}
                  </Link>
                );
              })}
            </div>
            <Link href="/shop" className="text-garud-teal hover:text-garud-ochre transition-colors" aria-label="Search">
              <Search size={18} />
            </Link>
            <button
              onClick={toggleCart}
              className="text-garud-teal hover:text-garud-ochre transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-garud-teal text-garud-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-garud-cream flex flex-col">
          <div className="flex justify-between items-center px-6 h-20 border-b border-garud-cream-border">
            <div className="relative h-14 w-20">
              <Image
                src="/images/garud-logo.png"
                alt="Garud Logo"
                fill
                className="object-contain"
              />
            </div>
            <button onClick={() => setMenuOpen(false)} className="text-garud-teal hover:text-garud-teal-light transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center px-8 gap-7">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-4xl tracking-widest text-garud-teal hover:text-garud-ochre transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="px-8 py-8 border-t border-garud-cream-border">
            <p className="text-garud-muted text-xs tracking-ultra uppercase">Born from myth. Worn by warriors.</p>
          </div>
        </div>
      )}
    </>
  );
}
