import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Twitter, Youtube } from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Collections', href: '/collections' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'T-Shirts', href: '/shop?category=tshirts' },
    { label: 'Hoodies', href: '/shop?category=hoodies' },
    { label: 'Jackets', href: '/shop?category=jackets' },
  ],
  Company: [
    { label: 'About Garud', href: '/about' },
    { label: 'Our Story', href: '/about#story' },
    { label: 'Lookbook', href: '/collections' },
  ],
  Support: [
    { label: 'Size Guide', href: '/shop' },
    { label: 'Shipping Info', href: '/cart' },
    { label: 'Returns & Exchanges', href: '/about' },
    { label: 'Contact Us', href: '/about' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/about' },
    { label: 'Terms of Service', href: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-garud-teal-deep border-t border-garud-cream/10 text-garud-cream">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand Column with Transparent Cream Logo */}
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
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 border border-garud-cream/20 flex items-center justify-center text-garud-cream/65 hover:text-garud-cream hover:border-garud-cream transition-colors"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-garud-cream text-[10px] tracking-ultra uppercase font-semibold mb-5">{heading}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
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

      {/* Bottom Bar */}
      <div className="border-t border-garud-cream/10">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-garud-cream/45 text-[10px] tracking-widest uppercase">
            © 2024 Garud. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Visa', 'Mastercard', 'UPI', 'Razorpay'].map(method => (
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
