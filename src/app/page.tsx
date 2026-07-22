import { Suspense } from "react";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HeroBannerCarousel from "@/components/home/HeroBannerCarousel";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TrendingProducts from "@/components/home/TrendingProducts";
import OfferBanner from "@/components/home/OfferBanner";
import CustomerReviews from "@/components/home/CustomerReviews";
import AboutStore from "@/components/home/AboutStore";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";

export const metadata: Metadata = {
  title: "Premium Rajasthani Handloom Sarees & Textiles",
  description:
    "Discover authentic Rajasthani handloom sarees, cotton fabrics, silk collections, and traditional Rajasthani textiles at Panchmukhi Balaji Handloom, Poonasar.",
};

// Revalidate every 5 minutes via ISR (avoids build-time Firebase calls failing)
export const revalidate = 300;

async function HeroBannerSection() {
  // Lazy-import so Firebase is never bundled into build-time static code.
  const { getBanners } = await import("@/lib/firebase/firestore");
  const heroBanners = await getBanners("hero").catch(() => []);

  // Real admin-uploaded "hero" banners take over the top slot; if none
  // exist yet, fall back to the static hero design.
  if (heroBanners.length > 0) {
    return <HeroBannerCarousel banners={heroBanners} />;
  }
  return <HeroSection />;
}

function HeroSkeleton() {
  return (
    <div className="relative min-h-[60vh] bg-hero-pattern flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );
}

async function HomeContent() {
  const { getCategories, getTrendingProducts, getBestSellers, getFeaturedProducts } =
    await import("@/lib/firebase/firestore");

  const [categories, trendingProducts, bestSellers, featuredProducts] =
    await Promise.all([
      getCategories().catch(() => []),
      getTrendingProducts(8).catch(() => []),
      getBestSellers(8).catch(() => []),
      getFeaturedProducts(8).catch(() => []),
    ]);

  return (
    <>
      <FeaturedCategories categories={categories} />
      <TrendingProducts
        products={trendingProducts.length ? trendingProducts : featuredProducts}
        title="Trending Now"
        subtitle="Most Popular"
      />
      <OfferBanner />
      <TrendingProducts
        products={bestSellers.length ? bestSellers : featuredProducts}
        title="Best Sellers"
        subtitle="Customer Favorites"
      />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<HeroSkeleton />}>
          <HeroBannerSection />
        </Suspense>
        <Suspense fallback={<HomeSkeleton />}>
          <HomeContent />
        </Suspense>
        <CustomerReviews />
        <AboutStore />
      </main>
      <Footer />
    </>
  );
}
