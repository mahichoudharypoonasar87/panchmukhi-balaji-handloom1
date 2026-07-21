"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Package, MapPin, CreditCard, ArrowLeft, CheckCircle,
  Truck, MessageCircle, Ban, Loader2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getOrderById, cancelOrderByCustomer } from "@/lib/firebase/firestore";
import { Order } from "@/types";
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusLabel, cn } from "@/lib/utils";
import toast from "react-hot-toast";

function OrderDetailContent() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";

  useEffect(() => {
    if (!params.id) return;
    getOrderById(params.id as string)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <div>
          <Package size={48} className="text-[var(--muted)] mx-auto mb-4" />
          <p className="font-display text-xl font-bold text-[var(--foreground)] mb-2">
            Order Not Found
          </p>
          <Link href="/profile/orders" className="btn-gold text-sm">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const handleSupportWhatsApp = () => {
    const msg = `Hello! I need help regarding my order #${order.orderNumber}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await cancelOrderByCustomer(order.id, cancelReason.trim());
      setOrder((prev) =>
        prev
          ? { ...prev, status: "cancelled", cancelReason: cancelReason.trim() || "Cancelled by customer" }
          : prev
      );
      toast.success("Order cancelled");
      setShowCancelForm(false);
      setCancelReason("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order. Please try again or contact support.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/profile/orders"
              className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-[var(--foreground)]">
                Order #{order.orderNumber}
              </h1>
              <p className="text-[var(--muted)] text-sm font-utility">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </div>
            <span
              className={`ml-auto px-4 py-1.5 rounded-full text-xs font-utility font-bold text-white ${getOrderStatusColor(order.status)}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          {/* Cancel Order — only while pending, matching what Firestore
              rules allow a customer to change themselves. */}
          {order.status === "pending" && (
            <div className="mb-6 p-5 rounded-3xl bg-[var(--card-bg)] border border-crimson-900/30">
              {!showCancelForm ? (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-[var(--foreground)] font-body font-semibold text-sm">
                      Need to cancel this order?
                    </p>
                    <p className="text-[var(--muted)] text-xs font-utility mt-0.5">
                      You can cancel free of charge while it&apos;s still pending confirmation.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCancelForm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-crimson-900/40 text-crimson-400 hover:bg-crimson-900/10 text-xs font-utility font-semibold transition-all flex-shrink-0"
                  >
                    <Ban size={14} />
                    Cancel Order
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-[var(--foreground)] font-body font-semibold text-sm mb-1">
                    Cancel Order #{order.orderNumber}?
                  </p>
                  <p className="text-[var(--muted)] text-xs font-utility mb-3">
                    This can&apos;t be undone. Let us know why (optional) — it helps us improve.
                  </p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancelling (optional)"
                    rows={2}
                    className="input-luxury resize-none text-sm mb-3"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crimson-900 hover:bg-crimson-800 text-ivory-100 text-xs font-utility font-semibold transition-all"
                    >
                      {cancelling ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                      Confirm Cancellation
                    </button>
                    <button
                      onClick={() => { setShowCancelForm(false); setCancelReason(""); }}
                      disabled={cancelling}
                      className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-utility font-semibold transition-all"
                    >
                      Never Mind
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Package size={18} className="text-gold-500" />
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3 pb-4 border-b border-[var(--border)] last:border-none last:pb-0">
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)]">
                        <img
                          src={item.productImage || "/placeholder-product.jpg"}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[var(--foreground)] text-sm font-body font-semibold">
                          {item.productName}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {item.size && (
                            <span className="text-[var(--muted)] text-xs font-utility">Size: {item.size}</span>
                          )}
                          {item.color && (
                            <span className="text-[var(--muted)] text-xs font-utility">· Color: {item.color}</span>
                          )}
                        </div>
                        <p className="text-[var(--muted)] text-xs font-utility mt-1">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="font-utility font-bold text-[var(--foreground)]">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              {order.timeline?.length > 0 && (
                <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <Truck size={18} className="text-gold-500" />
                    Order Timeline
                  </h2>
                  <div className="space-y-4">
                    {order.timeline.map((t, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={14} className="text-gold-500" />
                        </div>
                        <div>
                          <p className="text-[var(--foreground)] text-sm font-utility font-semibold capitalize">
                            {t.status.replace(/_/g, " ")}
                          </p>
                          <p className="text-[var(--muted)] text-xs font-utility">
                            {formatDateTime(t.timestamp)}
                          </p>
                          {t.note && (
                            <p className="text-[var(--muted)] text-xs font-body mt-0.5">{t.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support */}
              <button
                onClick={handleSupportWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-utility font-semibold text-sm transition-all"
              >
                <MessageCircle size={16} />
                Need Help? Chat With Support
              </button>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Price Summary */}
              <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                <h3 className="font-display text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-gold-500" />
                  Payment Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)] font-utility">Subtotal</span>
                    <span className="text-[var(--foreground)] font-utility">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-500 font-utility">Discount</span>
                      <span className="text-green-500 font-utility">−{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)] font-utility">GST</span>
                    <span className="text-[var(--foreground)] font-utility">{formatCurrency(order.gst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)] font-utility">Shipping</span>
                    <span className={cn("font-utility", order.shippingCharge === 0 && "text-green-500")}>
                      {order.shippingCharge === 0 ? "FREE" : formatCurrency(order.shippingCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-2 mt-2">
                    <span className="font-utility font-bold text-[var(--foreground)]">Total</span>
                    <span className="font-utility font-bold text-gold-500">{formatCurrency(order.total)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <p className="text-[var(--muted)] text-xs font-utility">
                    Payment Method: <span className="text-[var(--foreground)] font-semibold capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "WhatsApp Order"}</span>
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                <h3 className="font-display text-base font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-gold-500" />
                  Delivery Address
                </h3>
                <p className="text-[var(--muted)] text-sm font-body leading-relaxed">
                  {order.shippingAddress.name}<br />
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                  📞 {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
