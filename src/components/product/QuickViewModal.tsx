"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingCart,
  Heart,
  Star,
  ZoomIn,
  ArrowRight,
  Check,
} from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, calculateDiscount, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  onClose,
}: QuickViewModalProps) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const discount = calculateDiscount(product.baseMrp, product.basePrice);
  const currentVariant = product.variants?.[selectedVariant];

  const currentPrice = currentVariant?.price || product.basePrice;
  const currentMrp = currentVariant?.mrp || product.baseMrp;
  const currentStock = currentVariant?.stock || product.stock;

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      onClose();
      return;
    }
    setAdding(true);
    await addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images?.[0]?.url || "",
      variantId: currentVariant?.id,
      size: currentVariant?.size,
      color: currentVariant?.color,
      colorHex: currentVariant?.colorHex,
      price: currentPrice,
      mrp: currentMrp,
      quantity,
      stock: currentStock,
      sku: currentVariant?.sku || product.sku,
    });
    setAdding(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ebony/80 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-[var(--card-bg)] rounded-4xl border border-[var(--border)] shadow-luxury w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Images */}
            <div className="relative">
              <div className="aspect-[4/5] relative overflow-hidden rounded-t-4xl md:rounded-l-4xl md:rounded-tr-none">
                <Image
                  src={product.images?.[selectedImage]?.url || "/placeholder-product.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Discount badge */}
                {discount > 0 && (
                  <div className="absolute top-3 left-3 badge-gold">
                    {discount}% OFF
                  </div>
                )}

                {/* Zoom hint */}
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-ivory-100 text-xs font-utility hover:bg-white/20 transition-colors"
                >
                  <ZoomIn size={12} />
                  Full View
                </Link>
              </div>

              {/* Thumbnail strip */}
              {product.images?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none">
                  {product.images.slice(0, 4).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        "relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                        selectedImage === i
                          ? "border-gold-500 shadow-gold-glow"
                          : "border-[var(--border)] hover:border-gold-500/50"
                      )}
                    >
                      <Image
                        src={img.url}
                        alt={`View ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col gap-4">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--border)] hover:bg-crimson-900 text-[var(--foreground)] hover:text-ivory-100 flex items-center justify-center transition-all"
              >
                <X size={16} />
              </button>

              {/* Category */}
              <p className="text-gold-500 text-xs font-utility tracking-widest uppercase">
                {product.categoryName}
              </p>

              {/* Name */}
              <h2 className="font-display text-xl font-bold text-[var(--foreground)] leading-snug">
                {product.name}
              </h2>

              {/* Rating */}
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        className={cn(
                          star <= Math.round(product.rating)
                            ? "text-gold-500 fill-current"
                            : "text-[var(--border)]"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[var(--muted)] text-xs font-utility">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-utility font-bold text-2xl text-[var(--foreground)]">
                  {formatCurrency(currentPrice)}
                </span>
                {currentMrp > currentPrice && (
                  <>
                    <span className="font-utility text-[var(--muted)] text-sm line-through">
                      {formatCurrency(currentMrp)}
                    </span>
                    <span className="badge-gold text-[10px]">
                      Save {formatCurrency(currentMrp - currentPrice)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-[var(--muted)] text-sm font-body leading-relaxed line-clamp-3">
                {product.shortDescription || product.description}
              </p>

              {/* Variants - Size */}
              {product.variants?.some((v) => v.size) && (
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2 uppercase tracking-wide">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants
                      .filter((v, i, arr) => arr.findIndex((x) => x.size === v.size) === i)
                      .map((variant, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedVariant(i)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-xs font-utility font-medium transition-all",
                            selectedVariant === i
                              ? "border-gold-500 bg-gold-500/10 text-gold-500"
                              : "border-[var(--border)] text-[var(--muted)] hover:border-gold-500/50"
                          )}
                        >
                          {variant.size}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Variants - Color */}
              {product.variants?.some((v) => v.color) && (
                <div>
                  <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2 uppercase tracking-wide">
                    Color:{" "}
                    <span className="text-gold-500 normal-case font-normal">
                      {product.variants[selectedVariant]?.color}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, i) => (
                      variant.colorHex && (
                        <button
                          key={i}
                          onClick={() => setSelectedVariant(i)}
                          title={variant.color}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 transition-all",
                            selectedVariant === i
                              ? "border-gold-500 scale-110 shadow-gold-glow"
                              : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: variant.colorHex }}
                        />
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2 uppercase tracking-wide">
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-gold-500 transition-colors font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="font-utility font-bold text-[var(--foreground)] w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-gold-500 transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                  <span className="text-[var(--muted)] text-xs font-utility">
                    {currentStock} in stock
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0 || adding}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl",
                    "font-utility text-sm font-semibold tracking-wide transition-all",
                    currentStock === 0
                      ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                      : inCart
                      ? "bg-gold-500 text-ebony hover:bg-gold-400"
                      : "btn-luxury"
                  )}
                >
                  {adding ? (
                    <div className="w-4 h-4 border-2 border-current/50 border-t-current rounded-full animate-spin" />
                  ) : inCart ? (
                    <>
                      <Check size={16} />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={cn(
                    "w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all",
                    inWishlist
                      ? "border-crimson-900 bg-crimson-900/20 text-crimson-400"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-crimson-900/50"
                  )}
                >
                  <Heart
                    size={18}
                    className={cn(inWishlist && "fill-current")}
                  />
                </button>
              </div>

              {/* View Full Details */}
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="text-center text-gold-500 hover:text-gold-400 text-xs font-utility flex items-center justify-center gap-1 transition-colors"
              >
                View Full Details <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
