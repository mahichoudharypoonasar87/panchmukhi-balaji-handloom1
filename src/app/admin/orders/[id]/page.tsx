"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Package, MapPin, User, Phone, Mail, CreditCard,
  MessageCircle, Loader2, CheckCircle
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getOrderById, updateOrderStatus } from "@/lib/firebase/firestore";
import { Order } from "@/types";
import {
  formatCurrency, formatDateTime, getOrderStatusColor,
  getOrderStatusLabel, ORDER_STATUSES, cn
} from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";

  const fetchOrder = async () => {
    if (!params.id) return;
    const data = await getOrderById(params.id as string);
    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus, undefined, "Admin");
      await fetchOrder();
      toast.success("Status updated!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleContactCustomer = () => {
    if (!order) return;
    const msg = `Hello ${order.customerName}, this is regarding your order #${order.orderNumber} from Panchmukhi Balaji Handloom.`;
    window.open(`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="text-gold-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-[var(--foreground)] font-body font-semibold">Order not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/orders"
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-[var(--foreground)]">
            Order #{order.orderNumber}
          </h1>
          <p className="text-[var(--muted)] text-sm font-utility">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4">
              Order Status
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={cn("px-4 py-2 rounded-full text-xs font-utility font-bold text-white", getOrderStatusColor(order.status))}>
                {getOrderStatusLabel(order.status)}
              </span>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="input-luxury w-auto py-2"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {updating && <Loader2 size={16} className="text-gold-500 animate-spin" />}
            </div>
          </div>

          {/* Items */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Package size={18} className="text-gold-500" />
              Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-[var(--border)] last:border-none last:pb-0">
                  <img
                    src={item.productImage || "/placeholder-product.jpg"}
                    alt={item.productName}
                    className="w-14 h-16 rounded-xl object-cover border border-[var(--border)]"
                  />
                  <div className="flex-1">
                    <p className="text-[var(--foreground)] text-sm font-body font-medium">{item.productName}</p>
                    <p className="text-[var(--muted)] text-xs font-utility">
                      {item.size && `Size: ${item.size} `}{item.color && `· Color: ${item.color}`}
                    </p>
                    <p className="text-[var(--muted)] text-xs font-utility">
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
              <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4">
                Status Timeline
              </h2>
              <div className="space-y-3">
                {order.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[var(--foreground)] text-sm font-utility font-semibold capitalize">
                        {t.status.replace(/_/g, " ")}
                      </p>
                      <p className="text-[var(--muted)] text-xs font-utility">
                        {formatDateTime(t.timestamp)} {t.updatedBy && `· by ${t.updatedBy}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h3 className="font-display text-base font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <User size={16} className="text-gold-500" />
              Customer
            </h3>
            <p className="text-[var(--foreground)] font-body font-semibold text-sm">{order.customerName}</p>
            <p className="text-[var(--muted)] text-xs font-utility flex items-center gap-1 mt-1">
              <Phone size={11} /> {order.customerPhone}
            </p>
            <p className="text-[var(--muted)] text-xs font-utility flex items-center gap-1 mt-1">
              <Mail size={11} /> {order.customerEmail}
            </p>
            <button
              onClick={handleContactCustomer}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-utility font-semibold transition-all"
            >
              <MessageCircle size={14} />
              Contact via WhatsApp
            </button>
          </div>

          {/* Address */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h3 className="font-display text-base font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-gold-500" />
              Delivery Address
            </h3>
            <p className="text-[var(--muted)] text-sm font-body leading-relaxed">
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>

          {/* Payment */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h3 className="font-display text-base font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-gold-500" />
              Payment Details
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
                <span className="text-[var(--foreground)] font-utility">
                  {order.shippingCharge === 0 ? "FREE" : formatCurrency(order.shippingCharge)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2 mt-2">
                <span className="font-bold text-[var(--foreground)]">Total</span>
                <span className="font-bold text-gold-500">{formatCurrency(order.total)}</span>
              </div>
            </div>
            <p className="text-[var(--muted)] text-xs font-utility mt-3 pt-3 border-t border-[var(--border)] capitalize">
              Method: {order.paymentMethod === "cod" ? "Cash on Delivery" : "WhatsApp Order"}
            </p>
            {order.orderNotes && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <p className="text-[var(--muted)] text-xs font-utility font-semibold mb-1">Order Notes:</p>
                <p className="text-[var(--muted)] text-xs font-body">{order.orderNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
