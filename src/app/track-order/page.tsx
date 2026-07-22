"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package, Phone, Search, CheckCircle, Truck, Clock,
  XCircle, MapPin, Loader2, ShoppingBag, RefreshCw
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { trackOrder } from "@/lib/firebase/firestore";
import { trackOrderSchema, TrackOrderFormData } from "@/lib/validations";
import { Order } from "@/types";
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusLabel, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_FLOW = [
  "pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"
];

const STATUS_ICONS: Record<string, typeof Package> = {
  pending: Clock,
  confirmed: CheckCircle,
  packed: Package,
  shipped: Truck,
  out_for_delivery: MapPin,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function TrackOrderPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrackOrderFormData>({ resolver: zodResolver(trackOrderSchema) });

  const onSubmit = async (data: TrackOrderFormData) => {
    setSearched(true);
    try {
      const result = await trackOrder(data.orderNumber.trim(), data.phone);
      setOrder(result);
      if (!result) {
        toast.error("Order not found. Please check your details.");
      }
    } catch {
      toast.error("Failed to fetch order details");
    }
  };

  const isCancelled = order?.status === "cancelled";
  const isPostDelivery = order?.status === "return_requested" || order?.status === "refunded";

  // A returned/refunded order already passed through every earlier step,
  // so the progress bar treats it as fully completed and a separate
  // banner underneath explains the return/refund state.
  const currentStatusIndex = order
    ? isPostDelivery
      ? STATUS_FLOW.length - 1
      : STATUS_FLOW.indexOf(order.status)
    : -1;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        <div className="bg-dark-luxury border-b border-gold-500/10 py-10">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <Package size={36} className="text-gold-500 mx-auto mb-3" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100 mb-2">
              Track Your Order
            </h1>
            <p className="text-[#A08060] text-sm font-utility">
              Enter your order number and phone number to check status
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Search Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] mb-8"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Order Number
                </label>
                <div className="relative">
                  <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    {...register("orderNumber")}
                    placeholder="e.g. PBH1A2B3C4D"
                    className="input-luxury pl-9"
                  />
                </div>
                {errors.orderNumber && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.orderNumber.message}</p>
                )}
              </div>
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    {...register("phone")}
                    placeholder="10-digit mobile number"
                    className="input-luxury pl-9"
                    maxLength={10}
                  />
                </div>
                {errors.phone && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Search size={16} />
                  Track Order
                </>
              )}
            </button>
          </form>

          {/* Order Result */}
          <AnimatePresence>
            {searched && !order && !isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <XCircle size={48} className="text-crimson-400 mx-auto mb-3" />
                <p className="text-[var(--foreground)] font-body font-semibold">
                  Order Not Found
                </p>
                <p className="text-[var(--muted)] text-sm font-utility mt-1">
                  Please check your order number and phone number
                </p>
              </motion.div>
            )}

            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Order Header */}
                <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-[var(--muted)] text-xs font-utility">Order Number</p>
                      <p className="font-display text-lg font-bold text-[var(--foreground)]">
                        #{order.orderNumber}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-utility font-bold text-white",
                        getOrderStatusColor(order.status)
                      )}
                    >
                      {getOrderStatusLabel(order.status).toUpperCase()}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--muted)] text-xs font-utility mb-0.5">Order Date</p>
                      <p className="text-[var(--foreground)] font-body">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--muted)] text-xs font-utility mb-0.5">Total Amount</p>
                      <p className="text-[var(--foreground)] font-utility font-bold">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                {!isCancelled && (
                  <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                    <h3 className="font-display text-lg font-bold text-[var(--foreground)] mb-6">
                      Order Status
                    </h3>
                    <div className="relative">
                      {STATUS_FLOW.map((status, i) => {
                        const Icon = STATUS_ICONS[status];
                        const isCompleted = i <= currentStatusIndex;
                        const isCurrent = i === currentStatusIndex && !isPostDelivery;
                        return (
                          <div key={status} className="flex gap-4 pb-8 last:pb-0 relative">
                            {i < STATUS_FLOW.length - 1 && (
                              <div
                                className={cn(
                                  "absolute left-[19px] top-10 w-0.5 h-full",
                                  isCompleted ? "bg-gold-500" : "bg-[var(--border)]"
                                )}
                              />
                            )}
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                                isCompleted
                                  ? "bg-gold-500 text-ebony"
                                  : "bg-[var(--border)] text-[var(--muted)]",
                                isCurrent && "ring-4 ring-gold-500/30"
                              )}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="pt-2">
                              <p
                                className={cn(
                                  "font-utility font-semibold text-sm capitalize",
                                  isCompleted ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                                )}
                              >
                                {status.replace(/_/g, " ")}
                              </p>
                              {order.timeline.find((t) => t.status === status) && (
                                <p className="text-[var(--muted)] text-xs font-utility mt-0.5">
                                  {formatDateTime(
                                    order.timeline.find((t) => t.status === status)?.timestamp
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isPostDelivery && (
                  <div
                    className={cn(
                      "p-6 rounded-3xl border text-center",
                      order.status === "refunded"
                        ? "bg-gray-500/10 border-gray-500/30"
                        : "bg-gold-500/5 border-gold-500/30"
                    )}
                  >
                    {order.status === "refunded" ? (
                      <>
                        <CheckCircle size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300 font-body font-semibold">Order Refunded</p>
                        <p className="text-[var(--muted)] text-sm font-utility mt-1">
                          Please allow a few business days for it to reflect in your account.
                        </p>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={32} className="text-gold-500 mx-auto mb-2" />
                        <p className="text-gold-500 font-body font-semibold">Return/Refund Requested</p>
                        <p className="text-[var(--muted)] text-sm font-utility mt-1">
                          We&apos;re reviewing your request and will reach out shortly.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {isCancelled && (
                  <div className="p-6 rounded-3xl bg-crimson-900/10 border border-crimson-900/30 text-center">
                    <XCircle size={32} className="text-crimson-400 mx-auto mb-2" />
                    <p className="text-crimson-400 font-body font-semibold">Order Cancelled</p>
                    {order.cancelReason && (
                      <p className="text-[var(--muted)] text-sm font-utility mt-1">
                        Reason: {order.cancelReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <h3 className="font-display text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-gold-500" />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)]">
                          <img
                            src={item.productImage || "/placeholder-product.jpg"}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[var(--foreground)] text-sm font-body font-medium">
                            {item.productName}
                          </p>
                          <p className="text-[var(--muted)] text-xs font-utility">
                            Qty: {item.quantity} {item.size && `· Size: ${item.size}`}
                          </p>
                        </div>
                        <span className="text-[var(--foreground)] font-utility font-bold text-sm">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <h3 className="font-display text-lg font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-gold-500" />
                    Delivery Address
                  </h3>
                  <p className="text-[var(--muted)] text-sm font-body">
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                    Phone: {order.shippingAddress.phone}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}
