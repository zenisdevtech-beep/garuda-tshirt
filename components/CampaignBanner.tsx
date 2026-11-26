'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function CampaignBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative h-[60vh] md:h-[75vh] min-h-[400px] overflow-hidden bg-garud-teal grain">
      {/* BG Image */}
      <Image
        src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=80&fit=crop"
        alt="Garud Campaign"
        fill
        className="object-cover opacity-35 mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-garud-teal/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-garud-teal-deep via-garud-teal/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-garud-cream/80 text-xs tracking-mega uppercase font-semibold mb-4">New Season Drop</p>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-widest text-garud-cream leading-none mb-2 font-bold">
            THE
          </h2>
          <h2
            className="font-display text-5xl md:text-7xl lg:text-8xl tracking-widest leading-none mb-8 font-bold"
            style={{ WebkitTextStroke: '1.5px #FBF4D8', color: 'transparent' }}
          >
            WARRIORS
          </h2>
          <p className="text-garud-cream/75 text-sm tracking-widest uppercase mb-8 max-w-md">
            The latest collection has arrived. Heavyweight fabrics. Premium prints. Limited pieces.
          </p>
          <Link href="/new-arrivals" className="btn-cream">
            Shop New Arrivals
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
