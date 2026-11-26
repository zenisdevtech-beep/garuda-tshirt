'use client';

import { useState, useMemo, Suspense } from 'react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

const categories = [
  { value: '', label: 'All' },
  { value: 'tshirts', label: 'T-Shirts' },
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'joggers', label: 'Joggers' },
  { value: 'jackets', label: 'Jackets' },
  { value: 'accessories', label: 'Accessories' },
];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const tagFilters = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New Arrivals' },
  { value: 'bestseller', label: 'Bestsellers' },
  { value: 'sale', label: 'On Sale' },
  { value: 'limited', label: 'Limited' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialTag = searchParams.get('tag') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [sortBy, setSortBy] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory) result = result.filter(p => p.category === selectedCategory);
    if (selectedTag) result = result.filter(p => p.tags.includes(selectedTag as 'new' | 'bestseller' | 'sale' | 'limited'));
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'newest': result.sort((a, b) => (b.tags.includes('new') ? 1 : 0) - (a.tags.includes('new') ? 1 : 0)); break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => (b.tags.includes('bestseller') ? 1 : 0) - (a.tags.includes('bestseller') ? 1 : 0));
    }

    return result;
  }, [selectedCategory, selectedTag, sortBy, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
    setSortBy('featured');
    setPriceRange([0, 10000]);
  };

  const hasActiveFilters = selectedCategory || selectedTag || priceRange[0] > 0 || priceRange[1] < 10000;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Page Header */}
      <div className="bg-garud-teal-deep border-b border-garud-cream/10 py-14 px-6 md:px-16 text-garud-cream">
        <div className="max-w-7xl mx-auto">
          <p className="text-garud-cream/70 text-xs tracking-mega uppercase font-semibold mb-2">Warriors Collection</p>
          <h1 className="font-display text-4xl md:text-6xl tracking-widest text-garud-cream font-bold">SHOP ALL</h1>
          <p className="text-garud-cream/65 text-sm mt-2">{filtered.length} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          {/* Category Tabs */}
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

          {/* Sort + Filter */}
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-garud-ochre text-xs tracking-ultra uppercase flex items-center gap-1 hover:text-garud-teal font-semibold transition-colors"
              >
                <X size={12} /> Clear
              </button>
            )}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-garud-cream-dark border border-garud-cream-border text-garud-teal font-medium text-xs py-2.5 px-4 outline-none hover:border-garud-teal transition-colors cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="border border-garud-cream-border bg-garud-cream-dark/50 text-garud-teal hover:border-garud-teal px-4 py-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-ultra transition-colors"
            >
              <Filter size={12} />
              Filters
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-garud-cream-dark border border-garud-cream-border p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tag Filter */}
                <div>
                  <p className="text-garud-teal text-[10px] tracking-ultra uppercase mb-3 font-bold">Filter by Type</p>
                  <div className="flex flex-wrap gap-2">
                    {tagFilters.map(tag => (
                      <button
                        key={tag.value}
                        onClick={() => setSelectedTag(tag.value)}
                        className={`text-xs tracking-ultra uppercase px-3 py-1.5 border font-semibold transition-colors ${
                          selectedTag === tag.value
                            ? 'bg-garud-teal text-garud-cream border-garud-teal'
                            : 'border-garud-cream-border bg-garud-cream text-garud-muted hover:border-garud-teal hover:text-garud-teal'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Price Range */}
                <div>
                  <p className="text-garud-teal text-[10px] tracking-ultra uppercase mb-3 font-bold">
                    Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    step={100}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-garud-teal"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teal line */}
        <div className="teal-line mb-10" />

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-garud-muted text-sm mb-4">No products match your filters.</p>
            <button onClick={clearFilters} className="btn-outline-teal text-xs">Clear Filters</button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10"
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-garud-cream flex items-center justify-center text-garud-teal">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
