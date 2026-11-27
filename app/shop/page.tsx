'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import { Filter, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import type { ProductDTO } from '@/lib/product-utils';

const categories = [
  { value: '', label: 'All' },
  { value: 'tshirts', label: 'T-Shirts' },
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'joggers', label: 'Joggers' },
  { value: 'jackets', label: 'Jackets' },
  { value: 'accessories', label: 'Accessories' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'popularity', label: 'Popularity' },
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
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedTag(searchParams.get('tag') || '');
  }, [searchParams]);

  const fetchProducts = useCallback(async (targetPage: number, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedTag) params.set('tag', selectedTag);
      if (selectedSize) params.set('size', selectedSize);
      if (inStockOnly) params.set('inStock', 'true');
      if (maxPrice < 10000) params.set('maxPrice', String(maxPrice));
      params.set('sort', sortBy);
      params.set('page', String(targetPage));
      params.set('limit', '8');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => (append ? [...prev, ...data.products] : data.products));
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, selectedTag, selectedSize, inStockOnly, maxPrice, sortBy]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedTag('');
    setSelectedSize('');
    setInStockOnly(false);
    setSortBy('featured');
    setMaxPrice(10000);
    router.replace('/shop');
  };

  const hasActiveFilters =
    Boolean(query || selectedCategory || selectedTag || selectedSize || inStockOnly || maxPrice < 10000);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-garud-teal-deep border-b border-garud-cream/10 py-14 px-6 md:px-16 text-garud-cream">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-garud-cream/70 text-xs tracking-mega uppercase font-semibold mb-2">Warriors Collection</p>
            <h1 className="font-display text-4xl md:text-6xl tracking-widest text-garud-cream font-bold">SHOP ALL</h1>
            <p className="text-garud-cream/65 text-sm mt-2">{total} products</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-garud-cream/50" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-garud-teal border border-garud-cream/25 text-garud-cream placeholder:text-garud-cream/45 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-garud-cream"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
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

        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-garud-cream-dark border border-garud-cream-border p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-garud-teal text-[10px] tracking-ultra uppercase mb-3 font-bold">Collection / Tag</p>
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

                <div>
                  <p className="text-garud-teal text-[10px] tracking-ultra uppercase mb-3 font-bold">Size</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedSize('')}
                      className={`text-xs px-2.5 py-1 border font-semibold ${
                        selectedSize === '' ? 'bg-garud-teal text-garud-cream border-garud-teal' : 'border-garud-cream-border bg-garud-cream text-garud-muted'
                      }`}
                    >
                      All
                    </button>
                    {sizes.map(sz => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`text-xs px-2.5 py-1 border font-semibold ${
                          selectedSize === sz ? 'bg-garud-teal text-garud-cream border-garud-teal' : 'border-garud-cream-border bg-garud-cream text-garud-muted'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-garud-teal text-[10px] tracking-ultra uppercase mb-2 font-bold">
                      Max Price: ₹{maxPrice.toLocaleString('en-IN')}
                    </p>
                    <input
                      type="range"
                      min={500}
                      max={10000}
                      step={250}
                      value={maxPrice}
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-garud-teal"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-garud-teal font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={e => setInStockOnly(e.target.checked)}
                      className="accent-garud-teal"
                    />
                    In Stock Only
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="teal-line mb-10" />

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="aspect-[3/4] bg-garud-cream-dark animate-pulse border border-garud-cream-border" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-garud-muted text-sm mb-4">No products match your filters.</p>
            <button onClick={clearFilters} className="btn-outline-teal text-xs">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {page < totalPages && (
              <div className="mt-14 text-center">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchProducts(next, true);
                  }}
                  disabled={loading}
                  className="btn-outline-teal"
                >
                  {loading ? 'Loading...' : `Load More (${products.length} of ${total})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent flex items-center justify-center text-garud-teal">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
