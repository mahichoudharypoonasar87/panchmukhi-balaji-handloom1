"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import QuickViewModal from "@/components/product/QuickViewModal";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { getProductById } from "@/lib/firebase/firestore";
import { Product } from "@/types";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!wishlist.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(wishlist.map((id) => getProductById(id)))
      .then((results) => setProducts(results.filter(Boolean) as Product[]))
      .finally(() => setLoading(false));
  }, [wishlist]);

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-[var(--background)]">
          <div className="text-center p-8">
            <Heart size={56} className="text-[var(--muted)] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[var(--foreground)] mb-2">
              Sign in to view wishlist
            </h2>
            <Link href="/login" className="btn-luxury">Login to Continue</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/"
              className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-gold-500/50 transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                <Heart size={22} className="text-crimson-500 fill-current" />
                My Wishlist
              </h1>
              <p className="text-[var(--muted)] text-sm font-utility">
                {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={56} className="text-[var(--muted)] mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-[var(--foreground)] mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-[var(--muted)] text-sm font-body mb-6">
                Save your favorite items to view them anytime
              </p>
              <Link href="/shop" className="btn-gold">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
