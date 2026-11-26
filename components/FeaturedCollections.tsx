'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const collections = [
  {
    name: 'Warriors',
    tagline: 'The original drop',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80&fit=crop',
    href: '/shop?category=tshirts',
    count: '7 pieces',
  },
  {
    name: 'Heritage',
    tagline: 'Rooted in culture',
    image: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80&fit=crop',
    href: '/shop?category=hoodies',
    count: '2 pieces',
  },
  {
    name: 'Street',
    tagline: 'Urban warrior',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80&fit=crop',
    href: '/shop?category=joggers',
    count: '1 piece',
  },
];

export default function FeaturedCollections() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-transparent py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-3">Collections</p>
            <h2 className="font-display text-4xl md:text-6xl tracking-widest text-garud-teal font-bold">THE DROPS</h2>
          </div>
          <Link href="/collections" className="text-garud-muted hover:text-garud-teal text-xs tracking-ultra uppercase transition-colors font-semibold">
            View All Collections →
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link href={col.href} className="group block relative overflow-hidden aspect-[3/4] border border-garud-cream-border shadow-sm hover:shadow-xl transition-shadow duration-500">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-garud-teal-deep via-garud-teal-deep/40 to-transparent" />
                <div className="absolute inset-0 bg-garud-teal/15 group-hover:bg-garud-teal/0 transition-colors duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-garud-cream/80 text-[10px] tracking-mega uppercase mb-2 font-semibold">{col.count}</p>
                  <h3 className="font-display text-3xl md:text-4xl tracking-widest text-garud-cream font-bold mb-1">{col.name}</h3>
                  <p className="text-garud-cream/70 text-xs tracking-widest uppercase">{col.tagline}</p>
                  <div className="mt-4 flex items-center gap-2 text-garud-cream text-xs tracking-ultra uppercase font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Explore →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
