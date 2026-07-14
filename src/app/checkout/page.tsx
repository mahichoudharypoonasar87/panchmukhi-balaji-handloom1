"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin, Phone, Mail, User, FileText,
  MessageCircle, Truck, CheckCircle, ArrowLeft, Lock
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/firebase/firestore";
import { checkoutSchema, CheckoutFormData } from "@/lib/validations";
import {
  formatCurrency, generateOrderNumber,
  generateWhatsAppMessage, openWhatsApp, cn
} from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { cart, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: userProfile?.displayName || "",
      email: user?.email || "",
      phone: userProfile?.phone || "",
      country: "India",
      paymentMethod: "whatsapp",
    },
  });

  const paymentMethod = watch("paymentMethod");

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-[var(--background)]">
          <div className="text-center p-8">
            <Lock size={48} className="text-[var(--muted)] mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-[var(--foreground)] mb-3">
              Login to Checkout
            </h2>
            <Link href="/login" className="btn-luxury">Login</Link>
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
            <h2 className="font-display text-xl font-bold text-[var(--foreground)] mb-3">
              Your cart is empty
            </h2>
            <Link href="/shop" className="btn-gold">Browse Products</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Order success screen
  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-[var(--background)]">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--foreground)] mb-2">
              Order Placed!
            </h2>
            <p className="text-[var(--muted)] font-body text-sm mb-2">
              Order #{orderPlaced}
            </p>
            <p className="text-[var(--muted)] font-body text-sm mb-6">
              Thank you! We'll confirm your order shortly.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/profile/orders" className="btn-gold w-full text-center">
                View My Orders
              </Link>
              <Link href="/shop" className="btn-outline w-full text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart || !user) return;
    setPlacing(true);

    try {
      const orderNumber = generateOrderNumber();

      // ── Build order items (no undefined values) ────────────────────────────
      const orderItems = cart.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage || "",
        variantId: item.variantId || null,
        size: item.size || null,
        color: item.color || null,
        price: item.price,
        mrp: item.mrp,
        quantity: item.quantity,
        total: item.price * item.quantity,
      }));

      // ── Build the full order object — NO undefined values ──────────────────
      // Firestore rejects documents with undefined fields. Use null explicitly.
      const orderPayload = {
        orderNumber,
        userId: user.uid,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        shippingAddress: {
          name: data.name,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country || "India",
        },
        items: orderItems,
        status: "pending" as const,
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending" as const,
        subtotal: cart.subtotal ?? 0,
        discount: cart.discount ?? 0,
        couponCode: cart.couponCode || null,
        couponDiscount: cart.couponDiscount ?? 0,
        shippingCharge: cart.shippingCharge ?? 0,
        gst: cart.gst ?? 0,
        total: cart.total ?? 0,
        orderNotes: data.orderNotes || null,
        timeline: [
          {
            status: "pending",
            timestamp: new Date().toISOString(), // string, not Date — avoids serialization issues
            note: "Order placed by customer",
            updatedBy: "customer",
          },
        ],
        isReviewed: false,
      };

      // ── Save to Firestore ──────────────────────────────────────────────────
      const orderId = await createOrder(orderPayload as unknown as Parameters<typeof createOrder>[0]);

      // ── Clear cart ────────────────────────────────────────────────────────
      await clearCart();

      // ── Open WhatsApp if selected ─────────────────────────────────────────
      if (data.paymentMethod === "whatsapp") {
        const waMessage = generateWhatsAppMessage({
          orderNumber,
          customerName: data.name,
          customerPhone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          items: cart.items.map((i) => ({
            productName: i.productName,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            price: i.price,
          })),
          subtotal: cart.subtotal,
          discount: cart.discount,
          shippingCharge: cart.shippingCharge,
          gst: cart.gst,
          total: cart.total,
          paymentMethod: data.paymentMethod,
          notes: data.orderNotes,
        });
        setTimeout(() => openWhatsApp(whatsappNumber, waMessage), 600);
      }

      setOrderPlaced(orderNumber);
      toast.success("Order placed successfully!");
    } catch (err: unknown) {
      console.error("Order failed:", err);
      // Show the actual Firebase error to help debug
      const msg =
        err instanceof Error ? err.message : "Failed to place order. Please try again.";
      toast.error(msg.includes("Missing or insufficient permissions")
        ? "Permission error — please update Firestore rules (see README step 18)"
        : msg.slice(0, 120));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
              Checkout
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* ── Left: Form ── */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Details */}
                <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <h2 className="font-display text-lg font-bold text-[var(--foreground)] flex items-center gap-2 mb-5">
                    <User size={18} className="text-gold-500" />
                    Customer Details
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        Full Name *
                      </label>
                      <input
                        {...register("name")}
                        placeholder="Your full name"
                        className="input-luxury"
                      />
                      {errors.name && (
                        <p className="text-crimson-400 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input
                          {...register("phone")}
                          placeholder="10-digit mobile"
                          className="input-luxury pl-9"
                          maxLength={10}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-crimson-400 text-xs mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input
                          {...register("email")}
                          placeholder="your@email.com"
                          className="input-luxury pl-9"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-crimson-400 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <h2 className="font-display text-lg font-bold text-[var(--foreground)] flex items-center gap-2 mb-5">
                    <MapPin size={18} className="text-gold-500" />
                    Delivery Address
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        Full Address *
                      </label>
                      <textarea
                        {...register("address")}
                        placeholder="House No, Street, Area, Landmark"
                        rows={2}
                        className="input-luxury resize-none"
                      />
                      {errors.address && (
                        <p className="text-crimson-400 text-xs mt-1">{errors.address.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        City *
                      </label>
                      <input {...register("city")} placeholder="City" className="input-luxury" />
                      {errors.city && (
                        <p className="text-crimson-400 text-xs mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        State *
                      </label>
                      <select {...register("state")} className="input-luxury">
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-crimson-400 text-xs mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        Pincode *
                      </label>
                      <input
                        {...register("pincode")}
                        placeholder="6-digit pincode"
                        className="input-luxury"
                        maxLength={6}
                      />
                      {errors.pincode && (
                        <p className="text-crimson-400 text-xs mt-1">{errors.pincode.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        Country
                      </label>
                      <input
                        {...register("country")}
                        defaultValue="India"
                        className="input-luxury"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <h2 className="font-display text-lg font-bold text-[var(--foreground)] flex items-center gap-2 mb-5">
                    <Lock size={18} className="text-gold-500" />
                    Payment Method
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      {
                        value: "whatsapp",
                        label: "Order via WhatsApp",
                        desc: "Place order on WhatsApp — quick & easy",
                        icon: MessageCircle,
                        color: "text-green-500",
                        activeBorder: "border-green-500/40 bg-green-500/5",
                      },
                      {
                        value: "cod",
                        label: "Cash on Delivery",
                        desc: "Pay when you receive your order",
                        icon: Truck,
                        color: "text-gold-500",
                        activeBorder: "border-gold-500/40 bg-gold-500/5",
                      },
                    ].map(({ value, label, desc, icon: Icon, color, activeBorder }) => (
                      <label
                        key={value}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          paymentMethod === value
                            ? activeBorder
                            : "border-[var(--border)] hover:border-[var(--muted)]"
                        )}
                      >
                        <input
                          {...register("paymentMethod")}
                          type="radio"
                          value={value}
                          className="mt-0.5 accent-gold-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Icon size={15} className={color} />
                            <span className="font-utility font-semibold text-[var(--foreground)] text-sm">
                              {label}
                            </span>
                          </div>
                          <p className="text-[var(--muted)] text-xs font-body mt-0.5">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <h2 className="font-display text-base font-bold text-[var(--foreground)] flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-gold-500" />
                    Order Notes (Optional)
                  </h2>
                  <textarea
                    {...register("orderNotes")}
                    placeholder="Special instructions, gift message, preferred delivery time..."
                    rows={3}
                    className="input-luxury resize-none"
                  />
                </div>
              </div>

              {/* ── Right: Summary ── */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] overflow-hidden">
                  <div className="p-5 border-b border-[var(--border)]">
                    <h2 className="font-display text-lg font-bold text-[var(--foreground)]">
                      Order Summary
                    </h2>
                  </div>
                  <div className="p-5">
                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border)]">
                            <img
                              src={item.productImage || "/placeholder-product.jpg"}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-ebony text-[9px] font-utility font-bold rounded-full flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[var(--foreground)] text-xs font-body font-medium line-clamp-1">
                              {item.productName}
                            </p>
                            {item.size && (
                              <p className="text-[var(--muted)] text-[10px] font-utility">
                                {item.size}
                              </p>
                            )}
                          </div>
                          <span className="text-[var(--foreground)] text-xs font-utility font-bold flex-shrink-0">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Price breakdown */}
                    <div className="border-t border-[var(--border)] pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted)] font-utility">Subtotal</span>
                        <span className="font-utility font-medium text-[var(--foreground)]">
                          {formatCurrency(cart.subtotal)}
                        </span>
                      </div>
                      {(cart.discount ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-500 font-utility">Discount</span>
                          <span className="text-green-500 font-utility font-medium">
                            −{formatCurrency(cart.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted)] font-utility">GST (5%)</span>
                        <span className="font-utility font-medium text-[var(--foreground)]">
                          {formatCurrency(cart.gst)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted)] font-utility">Shipping</span>
                        <span
                          className={cn(
                            "font-utility font-medium",
                            (cart.shippingCharge ?? 0) === 0 ? "text-green-500" : "text-[var(--foreground)]"
                          )}
                        >
                          {(cart.shippingCharge ?? 0) === 0 ? "FREE" : formatCurrency(cart.shippingCharge)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between border-t border-[var(--border)] pt-3 mt-3">
                      <span className="font-utility font-bold text-[var(--foreground)]">Total</span>
                      <span className="font-utility font-bold text-xl text-gold-gradient">
                        {formatCurrency(cart.total)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={placing}
                      className={cn(
                        "w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl",
                        "font-utility font-bold text-sm tracking-wide transition-all",
                        paymentMethod === "whatsapp"
                          ? "bg-green-600 hover:bg-green-500 text-white"
                          : "btn-gold"
                      )}
                    >
                      {placing ? (
                        <div className="w-4 h-4 border-2 border-current/50 border-t-current rounded-full animate-spin" />
                      ) : paymentMethod === "whatsapp" ? (
                        <>
                          <MessageCircle size={16} />
                          Place Order on WhatsApp
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Place Order (COD)
                        </>
                      )}
                    </button>

                    <p className="text-center text-[var(--muted)] text-[10px] font-utility mt-3">
                      🔒 Your data is safe & secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
