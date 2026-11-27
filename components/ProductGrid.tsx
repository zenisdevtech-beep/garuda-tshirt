'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import ProductCard from './ProductCard';
import type { ProductDTO } from '@/lib/product-utils';

interface ProductGridProps {
  products: ProductDTO[];
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export default function ProductGrid({
  products,
  title,
  subtitle,
  viewAllHref = '/shop',
  viewAllLabel = 'View All',
}: ProductGridProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-transparent py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            {subtitle && (
              <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-3">{subtitle}</p>
            )}
            <h2 className="font-display text-4xl md:text-6xl tracking-widest text-garud-teal font-bold">{title}</h2>
          </div>
          <Link href={viewAllHref} className="text-garud-muted hover:text-garud-teal text-xs tracking-ultra uppercase transition-colors font-semibold">
            {viewAllLabel} →
          </Link>
        </motion.div>

        <div className="teal-line mb-12" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: Math.min(i * 0.08, 0.6) }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 text-center"
        >
          <Link href={viewAllHref} className="btn-outline-teal inline-block">
            {viewAllLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
