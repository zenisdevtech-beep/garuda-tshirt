import Hero from '@/components/Hero';
import FeaturedCollections from '@/components/FeaturedCollections';
import ProductGrid from '@/components/ProductGrid';
import BrandStory from '@/components/BrandStory';
import CampaignBanner from '@/components/CampaignBanner';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';
import { getFeaturedProducts, getNewArrivals } from '@/data/products';

export default function HomePage() {
  const featured = getFeaturedProducts();
  const newArrivals = getNewArrivals();

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
