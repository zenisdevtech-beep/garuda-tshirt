'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Arjun Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The quality is insane. I\'ve bought premium streetwear from international brands but Garud hits different. The 240GSM fabric is thick, the print is perfect, and the fit is exactly what I wanted.',
    product: 'Garud Mythic Tee',
  },
  {
    name: 'Rahul Verma',
    location: 'Delhi',
    rating: 5,
    text: 'Finally an Indian brand that gets it. The Garud Heavyweight Hoodie is my most worn piece. 400GSM — it\'s like wearing armour. Fast delivery, premium packaging. 10/10.',
    product: 'Garud Heavyweight Hoodie',
  },
  {
    name: 'Vikram Singh',
    location: 'Bangalore',
    rating: 5,
    text: 'Ordered the Divine Wings Tee. The heritage crest print is stunning in person. Photographs beautifully too. The cultural identity in the design is what sets Garud apart.',
    product: 'Divine Wings Tee',
  },
  {
    name: 'Aditya Nair',
    location: 'Pune',
    rating: 5,
    text: 'Bought the bomber jacket for a festival and everyone kept asking where it\'s from. The eagle embroidery on the back is an absolute statement. Sizing is perfect.',
    product: 'Garud Bomber Jacket',
  },
  {
    name: 'Karan Mehra',
    location: 'Hyderabad',
    rating: 4,
    text: 'The Warrior Script Tee with Devanagari text is exactly what I\'ve been looking for. Comfortable, premium, and culturally rooted. Shipping was quick.',
    product: 'Warrior Script Tee',
  },
  {
    name: 'Suresh Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'As someone who\'s worn both Indian and international streetwear, Garud competes with the best. The attention to detail — from the GSM weight to the print placement — is extraordinary.',
    product: 'Eagle Crest Hoodie',
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-garud-cream-dark/60 py-20 md:py-28 border-t border-garud-cream-border">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-3">Social Proof</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-widest text-garud-teal font-bold">THE WARRIORS SPEAK</h2>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-14"
        >
          {[
            { num: '10,000+', label: 'Warriors' },
            { num: '4.9/5', label: 'Avg Rating' },
            { num: '98%', label: 'Would Recommend' },
          ].map((stat, i) => (
            <div key={i} className={`text-center py-6 border ${i === 1 ? 'border-garud-teal bg-garud-teal text-garud-cream' : 'border-garud-cream-border bg-garud-cream text-garud-teal'}`}>
              <p className="font-display text-3xl md:text-4xl tracking-widest mb-1 font-bold">{stat.num}</p>
              <p className={`text-[10px] tracking-ultra uppercase font-semibold ${i === 1 ? 'text-garud-cream/70' : 'text-garud-muted'}`}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-garud-cream border border-garud-cream-border p-6 hover:border-garud-teal transition-colors duration-300"
            >
              <Quote size={18} className="text-garud-teal mb-4 opacity-50" />
              <p className="text-garud-ink/85 text-sm leading-relaxed mb-5">{t.text}</p>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={11}
                    className={s <= t.rating ? 'fill-garud-teal text-garud-teal' : 'fill-garud-cream-border text-garud-cream-border'}
                  />
                ))}
              </div>
              <div>
                <p className="text-garud-teal font-bold text-sm">{t.name}</p>
                <p className="text-garud-muted text-xs">{t.location} · {t.product}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
