import { Suspense } from "react";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TrendingProducts from "@/components/home/TrendingProducts";
import OfferBanner from "@/components/home/OfferBanner";
import CustomerReviews from "@/components/home/CustomerReviews";
import AboutStore from "@/components/home/AboutStore";
import { getCategories, getTrendingProducts, getBestSellers, getFeaturedProducts } from "@/lib/firebase/firestore";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";

export const metadata: Metadata = {
  title: "Premium Rajasthani Handloom Sarees & Textiles",
  description:
    "Discover authentic handloom sarees, cotton fabrics, silk collections, and traditional Rajasthani textiles at Panchmukhi Balaji Handloom, Poonasar.",
};

// Revalidate page every 5 minutes
export const revalidate = 300;

async function HomeContent() {
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
        <HeroSection />
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
