"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Star,
  Share2,
  Check,
  Truck,
  Shield,
  RefreshCw,
  ChevronDown,
  MessageCircle,
  ZoomIn,
} from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, calculateDiscount, cn } from "@/lib/utils";
import ProductReviews from "./ProductReviews";
import { useRouter } from "next/navigation";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const discount = calculateDiscount(product.baseMrp, product.basePrice);
  const currentVariant = product.variants?.[selectedVariantIdx];
  const currentPrice = currentVariant?.price || product.basePrice;
  const currentMrp = currentVariant?.mrp || product.baseMrp;
  const currentStock = currentVariant?.stock ?? product.stock;
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
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

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleWhatsApp = () => {
    const msg = `Hello! I'm interested in *${product.name}* priced at ${formatCurrency(currentPrice)}.\n\nProduct Link: ${window.location.href}\n\nPlease share availability and delivery details.`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const accordionItems = [
    {
      key: "description",
      title: "Description",
      content: product.description,
    },
    {
      key: "details",
      title: "Product Details",
      content: [
        product.fabricType && `Fabric: ${product.fabricType}`,
        product.material && `Material: ${product.material}`,
        product.occasion && `Occasion: ${product.occasion}`,
        product.weight && `Weight: ${product.weight}`,
        product.origin && `Origin: ${product.origin}`,
        `SKU: ${product.sku}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      key: "care",
      title: "Wash & Care",
      content:
        product.washCare ||
        "• Hand wash in cold water\n• Do not bleach\n• Dry in shade\n• Iron on low heat\n• Dry clean recommended for silk",
    },
    {
      key: "shipping",
      title: "Shipping & Returns",
      content:
        "• Free shipping on orders above ₹999\n• Standard delivery: 5-7 business days\n• Express delivery available\n• 7-day easy returns for unwashed, unused items\n• COD available on all orders",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Gallery */}
        <div className="space-y-3">
          {/* Main Image */}
          <div
            className="relative aspect-[4/5] rounded-4xl overflow-hidden bg-[var(--card-bg)] cursor-zoom-in border border-[var(--border)]"
            onClick={() => setZoomedIn(!zoomedIn)}
          >
            <Image
              src={
                product.images?.[selectedImage]?.url ||
                "/placeholder-product.jpg"
              }
              alt={
                product.images?.[selectedImage]?.alt || product.name
              }
              fill
              className={cn(
                "object-cover transition-transform duration-700",
                zoomedIn ? "scale-150" : "scale-100"
              )}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNewArrival && (
                <span className="badge-gold">New</span>
              )}
              {discount > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-utility font-bold bg-green-600 text-white">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Zoom hint */}
            <button className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-ivory-100 text-xs font-utility">
              <ZoomIn size={12} />
              {zoomedIn ? "Click to zoom out" : "Click to zoom in"}
            </button>
          </div>

          {/* Thumbnail Row */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-16 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                    selectedImage === i
                      ? "border-gold-500 shadow-gold-glow"
                      : "border-[var(--border)] hover:border-gold-500/50 opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `View ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-5">
          {/* Category breadcrumb */}
          <p className="text-gold-500 text-xs font-utility tracking-widest uppercase">
            {product.categoryName}
          </p>

          {/* Name */}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--foreground)] leading-snug">
            {product.name}
          </h1>

          {/* Rating Row */}
          <div className="flex items-center gap-4">
            {product.reviewCount > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={15}
                      className={cn(
                        s <= Math.round(product.rating)
                          ? "text-gold-500 fill-current"
                          : "text-[var(--border)]"
                      )}
                    />
                  ))}
                </div>
                <span className="text-[var(--foreground)] font-utility text-sm font-semibold">
                  {product.rating}
                </span>
                <span className="text-[var(--muted)] text-xs font-utility">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            ) : (
              <span className="text-[var(--muted)] text-xs font-utility">
                No reviews yet
              </span>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-utility transition-colors",
                  inWishlist
                    ? "text-crimson-400"
                    : "text-[var(--muted)] hover:text-crimson-400"
                )}
              >
                <Heart
                  size={15}
                  className={cn(inWishlist && "fill-current")}
                />
                {inWishlist ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-utility text-[var(--muted)] hover:text-gold-500 transition-colors"
              >
                <Share2 size={15} />
                Share
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-utility font-bold text-3xl text-[var(--foreground)]">
              {formatCurrency(currentPrice)}
            </span>
            {currentMrp > currentPrice && (
              <>
                <span className="font-utility text-[var(--muted)] text-base line-through">
                  {formatCurrency(currentMrp)}
                </span>
                <span className="badge-gold">
                  Save {formatCurrency(currentMrp - currentPrice)}
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p className="text-[var(--muted)] font-body text-sm leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Size Variants */}
          {product.variants?.some((v) => v.size) && (
            <div>
              <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2.5 uppercase tracking-wide">
                Select Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants
                  .filter(
                    (v, i, arr) =>
                      arr.findIndex((x) => x.size === v.size) === i
                  )
                  .map((variant, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariantIdx(i)}
                      className={cn(
                        "px-4 py-2 rounded-xl border text-sm font-utility font-medium transition-all",
                        selectedVariantIdx === i
                          ? "border-gold-500 bg-gold-500/10 text-gold-500"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-gold-500/50",
                        variant.stock === 0 &&
                          "opacity-40 cursor-not-allowed line-through"
                      )}
                      disabled={variant.stock === 0}
                    >
                      {variant.size}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Color Variants */}
          {product.variants?.some((v) => v.color) && (
            <div>
              <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2.5 uppercase tracking-wide">
                Color:{" "}
                <span className="text-gold-500 normal-case font-normal">
                  {product.variants[selectedVariantIdx]?.color}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(
                  (variant, i) =>
                    variant.colorHex && (
                      <button
                        key={i}
                        onClick={() => setSelectedVariantIdx(i)}
                        title={variant.color}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all relative",
                          selectedVariantIdx === i
                            ? "border-gold-500 scale-110 shadow-gold-glow"
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: variant.colorHex }}
                      >
                        {selectedVariantIdx === i && (
                          <Check
                            size={14}
                            className="absolute inset-0 m-auto text-white drop-shadow"
                          />
                        )}
                      </button>
                    )
                )}
              </div>
            </div>
          )}

          {/* Quantity + Stock */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[var(--foreground)] text-xs font-utility font-semibold mb-2 uppercase tracking-wide">
                Quantity
              </p>
              <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl w-fit px-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-[var(--foreground)] hover:text-gold-500 transition-colors font-bold text-xl"
                >
                  −
                </button>
                <span className="font-utility font-bold text-[var(--foreground)] w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(currentStock, quantity + 1))
                  }
                  className="w-9 h-9 flex items-center justify-center text-[var(--foreground)] hover:text-gold-500 transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-5">
              <p
                className={cn(
                  "text-xs font-utility",
                  currentStock > 5
                    ? "text-green-500"
                    : currentStock > 0
                    ? "text-orange-400"
                    : "text-crimson-400"
                )}
              >
                {currentStock === 0
                  ? "Out of Stock"
                  : currentStock <= 5
                  ? `Only ${currentStock} left!`
                  : `${currentStock} in stock`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={currentStock === 0 || adding}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl",
                "font-utility font-semibold text-sm tracking-wide transition-all duration-300",
                currentStock === 0
                  ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                  : inCart
                  ? "bg-gold-500 text-ebony hover:bg-gold-400 shadow-gold-glow"
                  : "btn-luxury"
              )}
            >
              {adding ? (
                <div className="w-4 h-4 border-2 border-current/50 border-t-current rounded-full animate-spin" />
              ) : inCart ? (
                <>
                  <Check size={18} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleWhatsApp}
              className="sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-utility font-semibold text-sm tracking-wide transition-all"
            >
              <MessageCircle size={18} />
              Order via WhatsApp
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Truck, text: "Free shipping above ₹999" },
              { icon: Shield, text: "Secure & safe payment" },
              { icon: RefreshCw, text: "7-day easy returns" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-[var(--muted)] text-xs font-utility"
              >
                <Icon size={12} className="text-gold-500 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Accordion */}
          <div className="border-t border-[var(--border)] pt-4 space-y-1">
            {accordionItems.map(({ key, title, content }) => (
              <div
                key={key}
                className="border border-[var(--border)] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenAccordion(openAccordion === key ? null : key)
                  }
                  className="w-full flex items-center justify-between px-4 py-3 text-[var(--foreground)] font-utility font-medium text-sm hover:bg-white/5 transition-colors"
                >
                  {title}
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-[var(--muted)] transition-transform",
                      openAccordion === key && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openAccordion === key && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-[var(--muted)] text-sm font-body leading-relaxed whitespace-pre-line">
                          {content}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <ProductReviews productId={product.id} productName={product.name} />
      </div>
    </div>
  );
}
