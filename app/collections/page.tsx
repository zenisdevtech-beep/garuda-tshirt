import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Newsletter from '@/components/Newsletter';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Collections — GARUD',
  description: 'Explore curated Garud collections — Warriors, Heritage, Street, Outerwear, and Accessories.',
};

export default async function CollectionsPage() {
  const counts = await prisma.product.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: { _all: true },
  });
  const countMap = new Map(counts.map(c => [c.category, c._count._all]));

  const collections = [
    {
      id: 'warriors',
      title: 'THE WARRIORS DROP',
      subtitle: '220–260 GSM Heavyweight Tees',
      description:
        'Signature oversized silhouettes featuring mythological Garud iconography, Devanagari typography, and enzyme-washed finishes built for daily armour.',
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=85&fit=crop',
      href: '/shop?category=tshirts',
      count: countMap.get('tshirts') ?? 0,
      tag: 'Signature Line',
    },
    {
      id: 'heritage',
      title: 'HERITAGE FLEECE',
      subtitle: '320–450 GSM French Terry & Fleece',
      description:
        'Sculpted heavyweight hoodies and overshirts engineered with double-layered hoods, drop shoulders, and tonal crest embroidery.',
      image: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=1200&q=85&fit=crop',
      href: '/shop?category=hoodies',
      count: countMap.get('hoodies') ?? 0,
      tag: 'Winter Armour',
    },
    {
      id: 'street',
      title: 'URBAN VANGUARD',
      subtitle: 'Tailored Track Trousers & Joggers',
      description:
        'Precision-tapered cargo joggers and French terry track trousers designed for movement between gym and street.',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&q=85&fit=crop',
      href: '/shop?category=joggers',
      count: countMap.get('joggers') ?? 0,
      tag: 'Utility & Motion',
    },
    {
      id: 'outerwear',
      title: 'SOVEREIGN OUTERWEAR',
      subtitle: 'Limited Edition Bombers & Jackets',
      description:
        'Statement outerwear finished with custom Garud hardware, heavyweight twill, and back embroidery.',
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&q=85&fit=crop',
      href: '/shop?category=jackets',
      count: countMap.get('jackets') ?? 0,
      tag: 'Limited Release',
    },
    {
      id: 'accessories',
      title: 'RELICS & GEAR',
      subtitle: 'Structured Headwear & Essentials',
      description:
        'Structured 6-panel caps and everyday streetwear headwear finished with signature Garud embroidery.',
      image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200&q=85&fit=crop',
      href: '/shop?category=accessories',
      count: countMap.get('accessories') ?? 0,
      tag: 'Essentials',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent page-in">
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

      <section className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-24 space-y-20">
        {collections.map((col, idx) => {
          const isReversed = idx % 2 === 1;
          return (
            <div
              key={col.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center border-b border-garud-cream-border pb-16 last:border-b-0 last:pb-0"
            >
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
