import Image from 'next/image';
import Link from 'next/link';
import Newsletter from '@/components/Newsletter';

export const metadata = {
  title: 'About GARUD — Our Story',
  description: 'Born from myth. Worn by warriors. The story of Garud — India\'s premium heritage streetwear brand.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero */}
      <section className="relative h-[65vh] min-h-[450px] overflow-hidden bg-garud-teal-deep grain text-garud-cream">
        <Image
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1920&q=80&fit=crop"
          alt="About Garud"
          fill
          className="object-cover opacity-35 mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-garud-teal-deep/75" />
        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-16 pb-16 max-w-7xl mx-auto">
          <p className="text-garud-cream/75 text-xs tracking-mega uppercase font-semibold mb-3">The Story Behind</p>
          <h1 className="font-display text-5xl md:text-8xl tracking-widest text-garud-cream leading-tight font-bold">
            GARUD
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section id="story" className="py-20 md:py-28 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-garud-teal text-xs tracking-mega uppercase font-semibold mb-4">Who We Are</p>
            <h2 className="font-display text-4xl md:text-6xl tracking-widest text-garud-teal font-bold mb-8">BORN FROM<br />MYTHOLOGY</h2>
            <div className="teal-line mb-8 w-16" />
            <p className="text-garud-ink/80 text-sm leading-relaxed mb-5">
              Garud takes its name from the divine eagle of Hindu mythology — the mighty Garuda, vehicle of Lord Vishnu, king of birds, and destroyer of serpents. A symbol of power, speed, and divine strength that has inspired warriors for thousands of years.
            </p>
            <p className="text-garud-ink/80 text-sm leading-relaxed mb-5">
              We founded Garud with one belief: Indian streetwear deserves to be premium. For too long, premium streetwear meant foreign brands. We believe Bharat has its own warrior culture, its own aesthetic language — and that deserves to be on the fabric you wear.
            </p>
            <p className="text-garud-ink/80 text-sm leading-relaxed">
              Every Garud piece is designed with intention. From the GSM of the fabric to the placement of the print, to the cultural symbolism woven into the design — nothing is accidental. We create clothing for people who live with purpose.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                num: '01',
                title: 'Premium Materials',
                desc: 'We use 220–450GSM fabrics sourced from certified Indian mills. No compromise on weight, feel, or durability. Every thread matters.',
              },
              {
                num: '02',
                title: 'Cultural Identity',
                desc: 'Every design draws from India\'s rich mythological and cultural heritage. Garud is not just fashion — it is a declaration of identity.',
              },
              {
                num: '03',
                title: 'Limited Drops',
                desc: 'We don\'t mass-produce. Every collection drops in limited quantities, preserving exclusivity and ensuring every warrior gets something rare.',
              },
              {
                num: '04',
                title: 'Made with Pride',
                desc: 'Designed in India. Manufactured in India. Worn by warriors of India. Garud is Bharat\'s answer to global premium streetwear.',
              },
            ].map(item => (
              <div key={item.num} className="border border-garud-cream-border bg-garud-cream-dark/50 p-5 hover:border-garud-teal transition-colors">
                <div className="flex gap-4">
                  <span className="font-display text-3xl text-garud-teal/40 tracking-widest flex-shrink-0 font-bold">{item.num}</span>
                  <div>
                    <h3 className="text-garud-teal font-bold text-sm mb-2 tracking-wide">{item.title}</h3>
                    <p className="text-garud-muted text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-garud-teal-deep py-16 grain text-garud-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '2024', label: 'Founded' },
            { num: '10,000+', label: 'Warriors' },
            { num: '50+', label: 'Styles' },
            { num: '4.9★', label: 'Avg Rating' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="font-display text-4xl md:text-5xl text-garud-cream tracking-widest mb-2 font-bold">{stat.num}</p>
              <p className="text-garud-cream/65 text-[10px] tracking-ultra uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6 bg-garud-cream">
        <h2 className="font-display text-4xl md:text-6xl tracking-widest text-garud-teal font-bold mb-6">JOIN THE WARRIORS</h2>
        <p className="text-garud-muted text-sm mb-8 max-w-md mx-auto">
          Every piece of Garud clothing is a statement. Shop the collection and declare who you are.
        </p>
        <Link href="/shop" className="btn-teal">
          Shop All Collections
        </Link>
      </section>

      <Newsletter />
    </div>
  );
}
