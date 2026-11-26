'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandStory() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-garud-teal-deep py-20 md:py-32 overflow-hidden grain text-garud-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <p className="text-garud-cream/70 text-xs tracking-mega uppercase font-semibold mb-4">The Story</p>
            <h2 className="font-display text-4xl md:text-6xl tracking-widest text-garud-cream leading-tight mb-8 font-bold">
              BORN FROM<br />
              <span style={{ WebkitTextStroke: '1px #FBF4D8', color: 'transparent' }}>
                MYTH
              </span>
            </h2>

            <div className="cream-line mb-8 w-16" />

            <p className="text-garud-cream/80 text-sm leading-relaxed mb-5">
              Garud takes its name from the divine eagle of Hindu mythology — Vishnu&apos;s vehicle, the king of birds, the destroyer of serpents. Powerful, fearless, and free.
            </p>
            <p className="text-garud-cream/80 text-sm leading-relaxed mb-5">
              We believe clothing is not just fabric. It is identity. It is armour. It is a declaration to the world of who you are and what you stand for.
            </p>
            <p className="text-garud-cream/70 text-sm leading-relaxed mb-10">
              Every piece in the Garud collection carries the spirit of the warrior — crafted with premium materials, designed with intention, made for those who refuse to be ordinary.
            </p>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                { label: 'Premium Quality', desc: '240–420 GSM fabrics' },
                { label: 'Cultural Pride', desc: 'Indian mythology inspired' },
                { label: 'Warrior Spirit', desc: 'Built to last forever' },
                { label: 'Limited Drops', desc: 'Exclusive, never mass' },
              ].map((val, i) => (
                <div key={i} className="border border-garud-cream/15 bg-garud-teal/40 p-4">
                  <p className="text-garud-cream text-[10px] tracking-ultra uppercase font-bold mb-1">{val.label}</p>
                  <p className="text-garud-cream/65 text-xs">{val.desc}</p>
                </div>
              ))}
            </div>

            <Link href="/about" className="btn-cream">
              Our Full Story
            </Link>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden border border-garud-cream/20">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&fit=crop"
                alt="Garud Brand Story"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-garud-teal-deep/60 to-transparent" />
            </div>
            {/* Offset accent box */}
            <div className="absolute -bottom-6 -left-6 bg-garud-cream p-6 w-36 h-36 flex flex-col justify-center items-center text-center shadow-xl border border-garud-cream-border">
              <span className="font-display text-3xl text-garud-teal tracking-widest font-bold">2024</span>
              <span className="text-garud-muted text-[9px] tracking-ultra uppercase font-bold mt-1">Founded</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
