import Hero from '@/components/Hero';
import FeaturedCollections from '@/components/FeaturedCollections';
import ProductGrid from '@/components/ProductGrid';
import BrandStory from '@/components/BrandStory';
import CampaignBanner from '@/components/CampaignBanner';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/product-utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [newRows, bestRows] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      include: { variants: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { isActive: true, isBestseller: true },
      include: { variants: true },
      take: 8,
      orderBy: { reviewCount: 'desc' },
    }),
  ]);

  const newArrivals = newRows.map(serializeProduct);
  const featured = bestRows.map(serializeProduct);

  return (
    <div className="page-in">
      <Hero />
      <FeaturedCollections />
      <ProductGrid
        products={newArrivals}
        title="NEW ARRIVALS"
        subtitle="Just Dropped"
        viewAllHref="/new-arrivals"
        viewAllLabel="View All New"
      />
      <BrandStory />
      <CampaignBanner />
      <ProductGrid
        products={featured}
        title="BESTSELLERS"
        subtitle="Warriors Approve"
        viewAllHref="/shop?tag=bestseller"
        viewAllLabel="View All Bestsellers"
      />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
