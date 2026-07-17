"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types";

const FALLBACK_CATEGORIES = [
  { id: "1", name: "Handloom Sarees", slug: "sarees", description: "", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop", productCount: 0, order: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "Cotton Fabrics",  slug: "cotton", description: "", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop", productCount: 0, order: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "3", name: "Silk Collection", slug: "silk",   description: "", image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop", productCount: 0, order: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "4", name: "Dupattas",        slug: "dupattas", description: "", image: "https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=400&h=500&fit=crop", productCount: 0, order: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "5", name: "Dress Materials", slug: "dress-materials", description: "", image: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&h=500&fit=crop", productCount: 0, order: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "6", name: "Stoles & Scarves",slug: "stoles",  description: "", image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop", productCount: 0, order: 6, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

interface FeaturedCategoriesProps {
  categories?: Category[];
}

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const display =
    categories && categories.length > 0
      ? categories.slice(0, 6)
      : FALLBACK_CATEGORIES;

  return (
    <section className="py-16 lg:py-24 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="section-subtitle">Shop by Category</p>
          <h2 className="section-title">
            Our <span className="text-gold-gradient">Collections</span>
          </h2>
          <div className="divider-gold" />
          <p className="text-[var(--muted)] font-body text-sm mt-4 max-w-lg mx-auto">
            Explore our curated range of authentic Rajasthani handloom textiles,
            each piece telling a story of tradition and artistry
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {display.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Link
                href={`/shop?category=${category.slug || category.id}`}
                className="group block text-center"
              >
                {/* Image */}
                <div className="relative aspect-square rounded-3xl overflow-hidden mb-3 border border-[var(--border)] group-hover:border-gold-500/50 transition-all duration-500 group-hover:shadow-gold-glow">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ebony/70 via-transparent to-transparent" />

                  {/* Show count only if > 0 */}
                  {(category.productCount ?? 0) > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 text-center">
                      <span className="text-ivory-100 text-[10px] font-utility">
                        {category.productCount}+ items
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-body font-semibold text-[var(--foreground)] text-sm leading-snug group-hover:text-gold-500 transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 font-utility font-semibold text-sm tracking-wide transition-colors group"
          >
            View All Categories
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
