"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import QuickViewModal from "@/components/product/QuickViewModal";

interface TrendingProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export default function TrendingProducts({
  products,
  title = "Trending Now",
  subtitle = "Most Popular",
}: TrendingProductsProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  if (!products.length) return null;

  return (
    <>
      <section className="py-16 lg:py-24 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4"
          >
            <div>
              <p className="section-subtitle">{subtitle}</p>
              <h2 className="section-title">
                <span className="text-gold-gradient">{title}</span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp size={16} className="text-gold-500" />
                <span className="text-[var(--muted)] text-xs font-utility">
                  Based on customer favorites this month
                </span>
              </div>
            </div>
            <Link
              href="/shop?trending=true"
              className="inline-flex items-center gap-1.5 text-gold-500 hover:text-gold-400 font-utility font-semibold text-sm tracking-wide transition-colors group flex-shrink-0"
            >
              View All
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
