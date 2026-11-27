'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import type { ProductDTO } from '@/lib/product-utils';

const categories = [
  { value: '', label: 'All New' },
  { value: 'tshirts', label: 'T-Shirts' },
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'joggers', label: 'Joggers' },
  { value: 'jackets', label: 'Jackets' },
  { value: 'accessories', label: 'Accessories' },
];

export default function NewArrivalsPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [items, setItems] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ tag: 'new', sort: sortBy, limit: '24' });
    if (selectedCategory) params.set('category', selectedCategory);
    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => setItems(d.products || []))
      .finally(() => setLoading(false));
  }, [selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-transparent page-in">
      <section className="bg-garud-teal-deep text-garud-cream py-16 md:py-24 px-6 md:px-16 border-b border-garud-cream/10 grain">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-garud-cream/75 text-xs tracking-mega uppercase font-semibold mb-3">
              Just Landed · Season 01
            </p>
            <h1 className="font-display text-5xl md:text-7xl tracking-widest text-garud-cream font-bold">
              NEW ARRIVALS
            </h1>
            <p className="text-garud-cream/70 text-sm mt-3">
              {items.length} fresh silhouettes from the latest Garud drop.
            </p>
          </div>
          <Link href="/collections" className="btn-outline-cream text-center self-start md:self-auto">
            Browse Collections
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-16 py-12">
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-xs tracking-ultra uppercase px-4 py-2 border font-semibold transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-garud-teal text-garud-cream border-garud-teal'
                    : 'border-garud-cream-border text-garud-muted bg-garud-cream-dark/40 hover:border-garud-teal hover:text-garud-teal'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-garud-cream-dark border border-garud-cream-border text-garud-teal font-medium text-xs py-2.5 px-4 outline-none hover:border-garud-teal transition-colors cursor-pointer"
          >
            <option value="newest">Latest Drop</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="teal-line mb-10" />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="aspect-[3/4] bg-garud-cream-dark animate-pulse border border-garud-cream-border" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-garud-muted text-sm mb-4">No new arrivals in this category yet.</p>
            <button onClick={() => setSelectedCategory('')} className="btn-outline-teal text-xs">
              Show All New Arrivals
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {items.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
