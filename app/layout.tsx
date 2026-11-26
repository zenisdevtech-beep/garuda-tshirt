import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import LogoWatermark from '@/components/LogoWatermark';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GARUD — Mythic Indian Streetwear',
  description: 'Born from myth. Worn by warriors. Garud is India\'s premium heritage streetwear brand inspired by the divine eagle.',
  keywords: 'garud, indian streetwear, premium clothing, warrior wear, indian fashion, oversized tees, hoodies',
  openGraph: {
    title: 'GARUD — Mythic Indian Streetwear',
    description: 'Born from myth. Worn by warriors.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="bg-garud-cream text-garud-ink font-body">
        <CartProvider>
          <LogoWatermark />
          <AnnouncementBar />
          <Navbar />
          <CartSidebar />
          <main className="relative z-10">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
