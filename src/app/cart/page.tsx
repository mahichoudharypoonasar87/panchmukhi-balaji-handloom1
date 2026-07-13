"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartCount, updateQuantity, removeFromCart, applyCoupon, loading } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-[var(--background)]">
          <div className="text-center p-8">
            <ShoppingCart size={60} className="text-[var(--muted)] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[var(--foreground)] mb-2">
              Sign in to view your cart
            </h2>
            <p className="text-[var(--muted)] font-body text-sm mb-6">
              Please login to add items and checkout
            </p>
            <Link href="/login" className="btn-luxury">
              Login to Continue
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-[var(--background)]">
          <div className="text-center p-8">
            <ShoppingBag size={60} className="text-[var(--muted)] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[var(--foreground)] mb-2">
              Your cart is empty
            </h2>
            <p className="text-[var(--muted)] font-body text-sm mb-6">
              Start adding beautiful handloom products to your cart
            </p>
            <Link href="/shop" className="btn-gold">
              Browse Products
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponInput.trim().toUpperCase());
    setApplyingCoupon(false);
    setCouponInput("");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-gold-500/50 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
                Shopping Cart
              </h1>
              <p className="text-[var(--muted)] text-sm font-utility">
                {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-4 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-gold-500/20 transition-all"
                  >
                    {/* Image */}
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="relative w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)]"
                    >
                      <Image
                        src={item.productImage || "/placeholder-product.jpg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="font-body font-semibold text-[var(--foreground)] text-sm leading-snug hover:text-gold-500 transition-colors line-clamp-2"
                      >
                        {item.productName}
                      </Link>

                      {/* Variant Info */}
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {item.size && (
                          <span className="text-[var(--muted)] text-xs font-utility bg-[var(--border)]/50 px-2 py-0.5 rounded-lg">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="flex items-center gap-1 text-[var(--muted)] text-xs font-utility bg-[var(--border)]/50 px-2 py-0.5 rounded-lg">
                            {item.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: item.colorHex }}
                              />
                            )}
                            {item.color}
                          </span>
                        )}
                      </div>

                      {/* Price + Qty Row */}
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-utility font-bold text-[var(--foreground)]">
                            {formatCurrency(item.price)}
                          </span>
                          {item.mrp > item.price && (
                            <span className="text-[var(--muted)] text-xs font-utility line-through">
                              {formatCurrency(item.mrp)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-gold-500 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-utility font-bold text-[var(--foreground)] w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-gold-500 transition-colors disabled:opacity-40"
                          >
                            <Plus size={12} />
                          </button>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-crimson-400 hover:bg-crimson-900/10 transition-all ml-1"
                          >
                            <Trash2 size={14} className="mx-auto" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <p className="text-gold-500 font-utility text-xs mt-1">
                        Subtotal: {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm font-utility font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] overflow-hidden">
                <div className="p-5 border-b border-[var(--border)]">
                  <h2 className="font-display text-lg font-bold text-[var(--foreground)]">
                    Order Summary
                  </h2>
                </div>

                <div className="p-5 space-y-3">
                  {/* Coupon */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                      />
                      <input
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        placeholder="Coupon code"
                        className="input-luxury pl-9 py-2.5 text-xs"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponInput}
                      className="btn-gold text-xs px-4 py-2.5 rounded-xl flex-shrink-0"
                    >
                      {applyingCoupon ? (
                        <div className="w-3 h-3 border border-current/50 border-t-current rounded-full animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>

                  {cart.couponCode && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
                      <span className="text-green-500 text-xs font-utility font-semibold">
                        🎉 {cart.couponCode} applied
                      </span>
                      <span className="text-green-500 text-xs font-utility font-bold">
                        −{formatCurrency(cart.couponDiscount || 0)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-[var(--border)] pt-3 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted)] font-utility">
                        Subtotal ({cartCount} items)
                      </span>
                      <span className="font-utility font-medium text-[var(--foreground)]">
                        {formatCurrency(cart.subtotal)}
                      </span>
                    </div>

                    {cart.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500 font-utility">
                          Discount
                        </span>
                        <span className="text-green-500 font-utility font-medium">
                          −{formatCurrency(cart.discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted)] font-utility">
                        GST (5%)
                      </span>
                      <span className="font-utility font-medium text-[var(--foreground)]">
                        {formatCurrency(cart.gst)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted)] font-utility">
                        Shipping
                      </span>
                      <span
                        className={cn(
                          "font-utility font-medium",
                          cart.shippingCharge === 0
                            ? "text-green-500"
                            : "text-[var(--foreground)]"
                        )}
                      >
                        {cart.shippingCharge === 0
                          ? "FREE"
                          : formatCurrency(cart.shippingCharge)}
                      </span>
                    </div>

                    {cart.shippingCharge > 0 && (
                      <p className="text-[var(--muted)] text-[10px] font-utility">
                        Add{" "}
                        {formatCurrency(
                          999 - (cart.subtotal - cart.discount)
                        )}{" "}
                        more for free shipping
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between border-t border-[var(--border)] pt-3">
                    <span className="font-utility font-bold text-[var(--foreground)]">
                      Total
                    </span>
                    <span className="font-utility font-bold text-xl text-gold-gradient">
                      {formatCurrency(cart.total)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="btn-gold w-full text-center flex items-center justify-center gap-2 mt-2"
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </Link>

                  <p className="text-center text-[var(--muted)] text-[10px] font-utility">
                    🔒 Secure & safe checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
