'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-garud-teal-deep grain flex flex-col justify-between">
      {/* Background Photography */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-35 mix-blend-luminosity"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80&fit=crop)` }}
      />

      {/* Deep Peacock Teal Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-garud-teal-deep via-garud-teal/75 to-garud-teal-deep/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-garud-teal-deep/95 via-garud-teal/55 to-transparent" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center max-w-7xl w-full mx-auto px-6 md:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Editorial Copy */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <p className="text-garud-cream/80 text-xs tracking-mega uppercase font-semibold mb-5 flex items-center gap-3">
              <span className="w-10 h-[1px] bg-garud-ochre inline-block" />
              Mythic Indian Streetwear · AW 2024
            </p>

            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] leading-[0.95] tracking-wider text-garud-cream mb-2 font-bold">
              BORN FROM
            </h1>
            <h1
              className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] leading-[0.95] tracking-wider mb-7 font-bold"
              style={{
                WebkitTextStroke: '1.5px #FBF4D8',
                color: 'transparent',
              }}
            >
              MYTH
            </h1>

            <p className="text-garud-cream/75 text-sm md:text-base tracking-widest uppercase mb-10 font-light max-w-lg leading-relaxed">
              Worn by warriors. Forged in heritage. Heavyweight streetwear crafted for the modern Indian vanguard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/collections" className="btn-cream text-center">
                Explore Collections
              </Link>
              <Link href="/new-arrivals" className="btn-outline-cream text-center">
                New Arrivals
              </Link>
            </div>
          </motion.div>

          {/* Right Transparent Floating Emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="lg:col-span-5 hidden md:flex justify-center lg:justify-end"
          >
            <div className="relative max-w-sm w-full aspect-square flex flex-col items-center justify-center p-8 border border-garud-cream/15 bg-garud-teal/30 backdrop-blur-sm">
              {/* Corner accents */}
              <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-garud-ochre" />
              <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-garud-ochre" />
              <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-garud-ochre" />
              <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-garud-ochre" />

              <div className="relative w-full h-full">
                <Image
                  src="/images/garud-logo-cream.png"
                  alt="Garud Mythic Emblem"
                  fill
                  className="object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                  priority
                />
              </div>
              <p className="text-garud-cream/70 text-[10px] tracking-mega uppercase font-semibold mt-4">
                Est. 2024 · Bharat
              </p>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="hidden md:flex absolute bottom-24 right-10 flex-col items-center gap-2 text-garud-cream/50"
        >
          <span className="text-[10px] tracking-ultra uppercase">Scroll</span>
          <ChevronDown size={14} className="animate-bounce" />
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 bg-garud-cream border-t border-garud-cream-border"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-4 grid grid-cols-3 gap-4">
          {[
            { num: '10,000+', label: 'Warriors' },
            { num: '50+', label: 'Styles' },
            { num: '4.9★', label: 'Avg Rating' },
          ].map((stat, i) => (
            <div key={i} className={`text-center ${i > 0 ? 'border-l border-garud-cream-border' : ''}`}>
              <p className="font-display text-xl md:text-2xl text-garud-teal tracking-widest font-bold">{stat.num}</p>
              <p className="text-[10px] text-garud-muted tracking-ultra uppercase font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
