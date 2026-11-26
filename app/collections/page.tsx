import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/data/products';
import Newsletter from '@/components/Newsletter';

export const metadata = {
  title: 'Collections — GARUD',
  description: 'Explore curated Garud collections — Warriors, Heritage, Street, Outerwear, and Accessories.',
};

const collections = [
  {
    id: 'warriors',
    title: 'THE WARRIORS DROP',
    subtitle: '240–260 GSM Heavyweight Tees',
    description:
      'Signature oversized silhouettes featuring mythological Garud iconography, Devanagari typography, and enzyme-washed finishes built for daily armour.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=85&fit=crop',
    href: '/shop?category=tshirts',
    count: products.filter(p => p.category === 'tshirts').length,
    tag: 'Signature Line',
  },
  {
    id: 'heritage',
    title: 'HERITAGE FLEECE',
    subtitle: '350–450 GSM French Terry & Fleece',
    description:
      'Sculpted heavyweight hoodies and crewnecks engineered with double-layered hoods, drop shoulders, and tonal crest embroidery.',
    image: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=1200&q=85&fit=crop',
    href: '/shop?category=hoodies',
    count: products.filter(p => p.category === 'hoodies').length,
    tag: 'Winter Armour',
  },
  {
    id: 'street',
    title: 'URBAN VANGUARD',
    subtitle: 'Tailored Joggers & Athletic Shorts',
    description:
      'Precision-tapered cargo joggers, French terry track pants, and quick-dry performance shorts designed for movement between gym and street.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&q=85&fit=crop',
    href: '/shop?category=joggers',
    count: products.filter(p => p.category === 'joggers').length,
    tag: 'Utility & Motion',
  },
  {
    id: 'outerwear',
    title: 'SOVEREIGN OUTERWEAR',
    subtitle: 'Limited Edition Bombers & Windbreakers',
    description:
      'Statement satin bombers, matte coach jackets, and technical puffers finished with custom Garud hardware and back embroidery.',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&q=85&fit=crop',
    href: '/shop?category=jackets',
    count: products.filter(p => p.category === 'jackets').length,
    tag: 'Limited Release',
  },
  {
    id: 'accessories',
    title: 'RELICS & GEAR',
    subtitle: 'Headwear, Bags & Everyday Carry',
    description:
      'Structured 6-panel caps, 400 GSM canvas totes, duffel bags, and antique-finished metal accessories to complete the uniform.',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200&q=85&fit=crop',
    href: '/shop?category=accessories',
    count: products.filter(p => p.category === 'accessories').length,
    tag: 'Essentials',
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-transparent page-in">
      {/* Editorial Header */}
      <section className="bg-garud-teal-deep text-garud-cream py-16 md:py-24 px-6 md:px-16 border-b border-garud-cream/10 grain">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="text-garud-cream/70 text-xs tracking-mega uppercase font-semibold mb-3">
              Curated Chapters · AW 2024
            </p>
            <h1 className="font-display text-5xl md:text-7xl tracking-widest text-garud-cream font-bold">
              COLLECTIONS
            </h1>
          </div>
          <p className="text-garud-cream/70 text-sm max-w-md leading-relaxed">
            Five distinct chapters of mythic Indian streetwear — each crafted around heavyweight textiles, architectural silhouettes, and timeless symbolism.
          </p>
        </div>
      </section>

      {/* Alternating Editorial Showcase */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-24 space-y-20">
        {collections.map((col, idx) => {
          const isReversed = idx % 2 === 1;
          return (
            <div
              key={col.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center border-b border-garud-cream-border pb-16 last:border-b-0 last:pb-0"
            >
              {/* Image */}
              <div className={`lg:col-span-7 ${isReversed ? 'lg:order-2' : ''}`}>
                <Link
                  href={col.href}
                  className="group block relative aspect-[16/10] overflow-hidden bg-garud-cream-dark border border-garud-cream-border"
                >
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-garud-teal-deep/70 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 bg-garud-cream text-garud-teal text-[10px] font-bold tracking-ultra uppercase px-3 py-1.5">
                    {col.tag}
                  </span>
                  <span className="absolute bottom-4 right-4 text-garud-cream text-xs tracking-ultra uppercase font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore Drop →
                  </span>
                </Link>
              </div>

              {/* Copy */}
              <div className={`lg:col-span-5 ${isReversed ? 'lg:order-1' : ''}`}>
                <p className="text-garud-muted text-[11px] tracking-mega uppercase font-semibold mb-2">
                  0{idx + 1} · {col.count} Pieces
                </p>
                <h2 className="font-display text-3xl md:text-5xl tracking-widest text-garud-teal font-bold mb-3">
                  {col.title}
                </h2>
                <p className="text-garud-ochre text-xs tracking-ultra uppercase font-semibold mb-5">
                  {col.subtitle}
                </p>
                <div className="teal-line mb-6 w-16" />
                <p className="text-garud-ink/80 text-sm leading-relaxed mb-8">
                  {col.description}
                </p>
                <Link href={col.href} className="btn-teal">
                  Shop {col.title.split(' ')[0]}
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      <Newsletter />
    </div>
  );
}
