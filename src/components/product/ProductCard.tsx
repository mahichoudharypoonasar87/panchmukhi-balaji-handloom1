"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Eye, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";
import { formatCurrency, calculateDiscount, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
  className?: string;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({
  product,
  className,
  onQuickView,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const discount = calculateDiscount(product.baseMrp, product.basePrice);
  const primaryImage = product.images?.[0]?.url || "/placeholder-product.jpg";
  const hoverImage = product.images?.[1]?.url || primaryImage;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (inCart) {
      router.push("/cart");
      return;
    }
    setAddingToCart(true);
    await addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: primaryImage,
      price: product.basePrice,
      mrp: product.baseMrp,
      quantity: 1,
      stock: product.stock,
      sku: product.sku,
    });
    setAddingToCart(false);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    onQuickView?.(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn("product-card group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-3xl aspect-[3/4] bg-mahogany-950">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {product.isNewArrival && (
              <span className="badge-gold text-[10px] px-2 py-0.5">New</span>
            )}
            {product.isBestSeller && (
              <span className="badge-crimson text-[10px] px-2 py-0.5">Best Seller</span>
            )}
            {discount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-utility font-bold bg-green-600 text-white">
                {discount}% OFF
              </span>
            )}
            {product.stock === 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-utility font-bold bg-gray-700 text-gray-300">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center",
              "transition-all duration-300",
              inWishlist
                ? "bg-crimson-900 text-ivory-100 shadow-luxury"
                : "bg-black/40 text-ivory-200 hover:bg-crimson-900 hover:text-ivory-100"
            )}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={16}
              className={cn("transition-all", inWishlist && "fill-current")}
            />
          </button>

          {/* Product Image */}
          <div className="relative w-full h-full">
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton" />
            )}
            <Image
              src={isHovered && hoverImage !== primaryImage ? hoverImage : primaryImage}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                isHovered ? "scale-110" : "scale-100",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>

          {/* Quick Actions Overlay */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-3 left-3 right-3 flex gap-2"
          >
            {onQuickView && (
              <button
                onClick={handleQuickView}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl glass text-ivory-100 text-xs font-utility font-semibold hover:bg-white/20 transition-colors"
              >
                <Eye size={14} />
                Quick View
              </button>
            )}
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-gold-500 text-[10px] font-utility tracking-widest uppercase mb-1">
            {product.categoryName}
          </p>

          {/* Name */}
          <h3 className="font-body font-semibold text-[var(--foreground)] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-gold-500 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={11}
                    className={cn(
                      star <= Math.round(product.rating)
                        ? "text-gold-500 fill-current"
                        : "text-[var(--border)]"
                    )}
                  />
                ))}
              </div>
              <span className="text-[var(--muted)] text-[10px] font-utility">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-utility font-bold text-[var(--foreground)] text-base">
              {formatCurrency(product.basePrice)}
            </span>
            {product.baseMrp > product.basePrice && (
              <span className="font-utility text-[var(--muted)] text-xs line-through">
                {formatCurrency(product.baseMrp)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl",
              "font-utility text-xs font-semibold tracking-wider uppercase",
              "transition-all duration-300",
              product.stock === 0
                ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                : inCart
                ? "bg-gold-500 text-ebony hover:bg-gold-400"
                : "bg-crimson-900/80 text-ivory-100 hover:bg-crimson-900 hover:shadow-luxury"
            )}
          >
            {product.stock === 0 ? (
              "Out of Stock"
            ) : inCart ? (
              <>
                <ShoppingCart size={14} />
                View Cart
              </>
            ) : addingToCart ? (
              <div className="w-4 h-4 border-2 border-ivory-100/50 border-t-ivory-100 rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart size={14} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
