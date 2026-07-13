"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutList,
  ChevronDown,
  Search,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import QuickViewModal from "@/components/product/QuickViewModal";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import { getProducts, getCategories } from "@/lib/firebase/firestore";
import { Product, Category, ProductFilters } from "@/types";
import { cn, debounce } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 - ₹2,000", min: 1000, max: 2000 },
  { label: "₹2,000 - ₹5,000", min: 2000, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: 999999 },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<unknown>(null);
  const [gridCols, setGridCols] = useState(3);
  const [filterOpen, setFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get("category") || undefined,
    search: searchParams.get("search") || undefined,
    sortBy: "newest",
  });
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((...args: unknown[]) => {
      const value = args[0] as string;
      setFilters((prev) => ({ ...prev, search: value || undefined }));
    }, 500),
    []
  );

  const fetchProducts = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const result = await getProducts(filters, 12, reset ? undefined : (lastDoc as never));
        if (reset) {
          setProducts(result.data);
        } else {
          setProducts((prev) => [...prev, ...result.data]);
        }
        setHasMore(result.hasMore);
        setLastDoc(result.lastDoc);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchProducts(true);
  }, [filters]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const updateFilter = (key: keyof ProductFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setLastDoc(null);
  };

  const clearFilters = () => {
    setFilters({ sortBy: "newest" });
    setSearchInput("");
    setLastDoc(null);
  };

  const activeFilterCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
  ].filter(Boolean).length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        {/* Page Header */}
        <div className="bg-dark-luxury border-b border-gold-500/10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100 mb-1">
              Our Collection
            </h1>
            <p className="text-[#A08060] text-sm font-utility">
              Authentic Rajasthani Handloom Textiles
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                debouncedSearch(e.target.value);
              }}
              placeholder="Search sarees, fabrics, dupattas..."
              className="input-luxury pl-11 pr-4"
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              {/* Filter Toggle */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-utility font-medium transition-all",
                  filterOpen || activeFilterCount > 0
                    ? "border-gold-500 bg-gold-500/10 text-gold-500"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-gold-500/50"
                )}
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold-500 text-ebony text-xs font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-crimson-400 text-xs font-utility hover:text-crimson-300 transition-colors"
                >
                  <X size={12} />
                  Clear All
                </button>
              )}

              <span className="text-[var(--muted)] text-xs font-utility">
                {loading ? "Loading..." : `${products.length} products`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    updateFilter("sortBy", e.target.value)
                  }
                  className="appearance-none input-luxury py-2 pr-8 pl-3 text-xs cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
                />
              </div>

              {/* Grid Toggle */}
              <div className="hidden sm:flex items-center gap-1 border border-[var(--border)] rounded-xl p-1">
                {[
                  { cols: 3, icon: Grid3X3 },
                  { cols: 2, icon: LayoutList },
                ].map(({ cols, icon: Icon }) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      gridCols === cols
                        ? "bg-gold-500/20 text-gold-500"
                        : "text-[var(--muted)] hover:text-gold-500"
                    )}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2 uppercase tracking-wide">
                    Category
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateFilter("category", undefined)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-lg text-xs font-utility transition-all",
                        !filters.category
                          ? "bg-gold-500/20 text-gold-500"
                          : "text-[var(--muted)] hover:bg-white/5"
                      )}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateFilter("category", cat.id)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-xs font-utility transition-all",
                          filters.category === cat.id
                            ? "bg-gold-500/20 text-gold-500"
                            : "text-[var(--muted)] hover:bg-white/5"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2 uppercase tracking-wide">
                    Price Range
                  </p>
                  <div className="space-y-1">
                    {PRICE_RANGES.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          updateFilter("minPrice", range.min);
                          updateFilter("maxPrice", range.max);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-xs font-utility transition-all",
                          filters.minPrice === range.min &&
                          filters.maxPrice === range.max
                            ? "bg-gold-500/20 text-gold-500"
                            : "text-[var(--muted)] hover:bg-white/5"
                        )}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2 uppercase tracking-wide">
                    Minimum Rating
                  </p>
                  <div className="space-y-1">
                    {[4, 3, 2].map((r) => (
                      <button
                        key={r}
                        onClick={() => updateFilter("rating", r)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-xs font-utility transition-all flex items-center gap-1",
                          filters.rating === r
                            ? "bg-gold-500/20 text-gold-500"
                            : "text-[var(--muted)] hover:bg-white/5"
                        )}
                      >
                        {"★".repeat(r)} & above
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2 uppercase tracking-wide">
                    Availability
                  </p>
                  <button
                    onClick={() =>
                      updateFilter("inStock", !filters.inStock)
                    }
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-xs font-utility transition-all",
                      filters.inStock
                        ? "bg-gold-500/20 text-gold-500"
                        : "text-[var(--muted)] hover:bg-white/5"
                    )}
                  >
                    In Stock Only
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Filter Tags */}
          {filters.category && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-utility">
                {categories.find((c) => c.id === filters.category)?.name ||
                  filters.category}
                <button onClick={() => updateFilter("category", undefined)}>
                  <X size={12} />
                </button>
              </span>
            </div>
          )}

          {/* Products Grid */}
          {loading && products.length === 0 ? (
            <div
              className={cn(
                "grid gap-4 lg:gap-6",
                gridCols === 3
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2"
              )}
            >
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-[var(--foreground)] mb-2">
                No products found
              </p>
              <p className="text-[var(--muted)] text-sm font-body mb-6">
                Try adjusting your filters or search query
              </p>
              <button onClick={clearFilters} className="btn-gold text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-4 lg:gap-6",
                  gridCols === 3
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2"
                )}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => fetchProducts(false)}
                    disabled={loading}
                    className="btn-outline text-sm"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-current/50 border-t-current rounded-full animate-spin" />
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </>
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
