"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal, X, Grid3X3, LayoutList,
  ChevronDown, Search, Package
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import QuickViewModal from "@/components/product/QuickViewModal";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import { getProducts, getCategories } from "@/lib/firebase/firestore";
import { Product, Category, ProductFilters } from "@/types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest First" },
  { value: "popular",   label: "Most Popular" },
  { value: "rating",    label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc",label: "Price: High to Low" },
];

const PRICE_RANGES = [
  { label: "Under ₹500",       min: 0,    max: 500 },
  { label: "₹500 – ₹1,000",   min: 500,  max: 1000 },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "Above ₹5,000",     min: 5000, max: 9999999 },
];

// ── Inner component (uses useSearchParams) ──────────────────────────────────
function ShopContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [hasMore,     setHasMore]     = useState(false);
  const [gridCols,    setGridCols]    = useState<2 | 3>(3);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [quickView,   setQuickView]   = useState<Product | null>(null);

  // Parse initial filters from URL
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get("category") || undefined,
    search:   searchParams.get("search")   || undefined,
    sortBy:   "newest",
  });
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [page, setPage] = useState(0); // JS-side page index

  const PAGE_SIZE = 12;

  // ── Fetch all matching products (respects current filters) ────────────────
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // We fetch up to 200 products (enough for any small store).
      // All filtering/sorting is done in getProducts via JavaScript —
      // no Firestore composite indexes required.
      const result = await getProducts(filters, 200);
      setAllProducts(result.data);
      setProducts(result.data.slice(0, PAGE_SIZE));
      setHasMore(result.data.length > PAGE_SIZE);
      setPage(1);
    } catch (err) {
      console.error("[shop] fetchProducts error:", err);
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load more (JS pagination)
  const loadMore = () => {
    const next = page + 1;
    const slice = allProducts.slice(0, next * PAGE_SIZE);
    setProducts(slice);
    setHasMore(allProducts.length > next * PAGE_SIZE);
    setPage(next);
  };

  // Fetch categories once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const updateFilter = (key: keyof ProductFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({ sortBy: "newest" });
    setSearchInput("");
  };

  // Count active filters for the badge
  const activeFilterCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
    filters.inStock,
    filters.rating,
  ].filter(Boolean).length;

  // ── Search with 500ms debounce ─────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      updateFilter("search", searchInput.trim() || undefined);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Selected price range label ────────────────────────────────────────
  const selectedPriceLabel = PRICE_RANGES.find(
    (r) => r.min === filters.minPrice && r.max === filters.maxPrice
  )?.label;

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search sarees, fabrics, dupattas, colours..."
          className="input-luxury pl-11 pr-4"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(""); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-utility font-medium transition-all",
              filterOpen || activeFilterCount > 0
                ? "border-gold-500 bg-gold-500/10 text-gold-500"
                : "border-[var(--border)] text-[var(--muted)] hover:border-gold-500/50"
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold-500 text-ebony text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-crimson-400 text-xs font-utility hover:text-crimson-300 transition-colors"
            >
              <X size={12} /> Clear all
            </button>
          )}

          <span className="text-[var(--muted)] text-xs font-utility">
            {loading
              ? "Loading..."
              : `${allProducts.length} product${allProducts.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sortBy ?? "newest"}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
              className="appearance-none input-luxury py-2 pr-8 pl-3 text-xs cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
          </div>

          {/* Grid toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-[var(--border)] rounded-xl p-1">
            {([3, 2] as const).map((cols) => (
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
                {cols === 3 ? <Grid3X3 size={15} /> : <LayoutList size={15} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {/* Category */}
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2.5 uppercase tracking-wide">
                    Category
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateFilter("category", undefined)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-utility transition-all",
                        !filters.category
                          ? "bg-gold-500/20 text-gold-500"
                          : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                      )}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateFilter("category", cat.slug || cat.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-utility transition-all",
                          filters.category === cat.slug || filters.category === cat.id
                            ? "bg-gold-500/20 text-gold-500"
                            : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2.5 uppercase tracking-wide">
                    Price Range
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        updateFilter("minPrice", undefined);
                        updateFilter("maxPrice", undefined);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-utility transition-all",
                        !filters.minPrice && !filters.maxPrice
                          ? "bg-gold-500/20 text-gold-500"
                          : "text-[var(--muted)] hover:bg-white/5"
                      )}
                    >
                      All Prices
                    </button>
                    {PRICE_RANGES.map((r) => (
                      <button
                        key={r.label}
                        onClick={() => {
                          updateFilter("minPrice", r.min);
                          updateFilter("maxPrice", r.max);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-utility transition-all",
                          filters.minPrice === r.min && filters.maxPrice === r.max
                            ? "bg-gold-500/20 text-gold-500"
                            : "text-[var(--muted)] hover:bg-white/5"
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2.5 uppercase tracking-wide">
                    Min Rating
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateFilter("rating", undefined)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-utility transition-all",
                        !filters.rating
                          ? "bg-gold-500/20 text-gold-500"
                          : "text-[var(--muted)] hover:bg-white/5"
                      )}
                    >
                      All Ratings
                    </button>
                    {[4, 3, 2].map((r) => (
                      <button
                        key={r}
                        onClick={() => updateFilter("rating", r)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-utility flex items-center gap-1 transition-all",
                          filters.rating === r
                            ? "bg-gold-500/20 text-gold-500"
                            : "text-[var(--muted)] hover:bg-white/5"
                        )}
                      >
                        {"★".repeat(r)}
                        <span className="text-[10px]">& above</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2.5 uppercase tracking-wide">
                    Availability
                  </p>
                  <button
                    onClick={() => updateFilter("inStock", !filters.inStock)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs font-utility transition-all",
                      filters.inStock
                        ? "bg-gold-500/20 text-gold-500"
                        : "text-[var(--muted)] hover:bg-white/5"
                    )}
                  >
                    In Stock Only
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter tags */}
      {(filters.category || selectedPriceLabel) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-utility">
              {categories.find(
                (c) => c.slug === filters.category || c.id === filters.category
              )?.name || filters.category}
              <button onClick={() => updateFilter("category", undefined)}>
                <X size={11} />
              </button>
            </span>
          )}
          {selectedPriceLabel && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-utility">
              {selectedPriceLabel}
              <button onClick={() => {
                updateFilter("minPrice", undefined);
                updateFilter("maxPrice", undefined);
              }}>
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div
          className={cn(
            "grid gap-4 lg:gap-5",
            gridCols === 3
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2"
          )}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package size={52} className="text-[var(--muted)] mx-auto mb-4" />
          <p className="font-display text-xl text-[var(--foreground)] mb-2">
            No products found
          </p>
          <p className="text-[var(--muted)] text-sm font-body mb-6">
            Try changing your filters or search query
          </p>
          <button onClick={clearFilters} className="btn-gold text-sm">
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "grid gap-4 lg:gap-5",
              gridCols === 3
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2"
            )}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickView}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-10">
              <button
                onClick={loadMore}
                className="btn-outline text-sm"
              >
                Load More Products
              </button>
            </div>
          )}
        </>
      )}

      {/* Quick View */}
      {quickView && (
        <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
      )}
    </>
  );
}

// ── Page wrapper (Suspense for useSearchParams) ──────────────────────────────
export default function ShopPage() {
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
          <Suspense
            fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ShopContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
