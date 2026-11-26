'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

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
  const [sortBy, setSortBy] = useState('featured');

  const newItems = useMemo(() => {
    let list = products.filter(p => p.tags.includes('new'));
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-transparent page-in">
      {/* Drop Header */}
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
              {newItems.length} fresh silhouettes from the latest Garud drop.
            </p>
          </div>
          <Link href="/collections" className="btn-outline-cream text-center self-start md:self-auto">
            Browse Collections
          </Link>
        </div>
      </section>

      {/* Filters & Grid */}
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
            <option value="featured">Latest Drop</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="teal-line mb-10" />

        {newItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-garud-muted text-sm mb-4">No new arrivals in this category yet.</p>
            <button onClick={() => setSelectedCategory('')} className="btn-outline-teal text-xs">
              Show All New Arrivals
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10"
          >
            {newItems.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.35) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
