import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Collections', href: '/collections' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Bestsellers', href: '/shop?tag=bestseller' },
    { label: 'T-Shirts', href: '/shop?category=tshirts' },
    { label: 'Hoodies & Jackets', href: '/shop?category=hoodies' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Story', href: '/about#story' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'My Account', href: '/account' },
  ],
  Support: [
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Returns & Exchanges', href: '/returns' },
    { label: 'FAQs', href: '/faq' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-garud-teal-deep border-t border-garud-cream/10 text-garud-cream relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4 group">
              <div className="relative h-20 w-24">
                <Image
                  src="/images/garud-logo-cream.png"
                  alt="Garud Logo"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
            <p className="text-garud-cream/65 text-xs leading-relaxed mb-6">
              Born from myth.<br />Worn by warriors.<br />Premium Indian streetwear.
            </p>
            <Link href="/contact" className="text-garud-cream/80 hover:text-garud-cream text-xs underline">
              support@garudwear.in
            </Link>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-garud-cream text-[10px] tracking-ultra uppercase font-semibold mb-5">{heading}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-garud-cream/60 text-xs hover:text-garud-cream transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-garud-cream/10">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-garud-cream/45 text-[10px] tracking-widest uppercase">
            © 2024–2026 Garud. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Razorpay', 'UPI', 'Cards', 'COD'].map(method => (
              <span key={method} className="text-garud-cream/45 text-[10px] tracking-widest uppercase">{method}</span>
            ))}
          </div>
          <p className="text-garud-cream/45 text-[10px] tracking-widest uppercase">
            Made in Bharat 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
