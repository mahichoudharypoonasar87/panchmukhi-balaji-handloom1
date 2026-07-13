"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/lib/firebase/firestore";
import { Order } from "@/types";
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils";

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserOrders(user.uid)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)] mb-8">
            My Account
          </h1>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ProfileSidebar />
            </div>

            <div className="lg:col-span-3">
              <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-5">
                Order History
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5 rounded-3xl border border-[var(--border)]">
                      <div className="skeleton h-4 w-32 mb-3 rounded" />
                      <div className="skeleton h-3 w-full rounded" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-[var(--border)]">
                  <ShoppingBag size={48} className="text-[var(--muted)] mx-auto mb-4" />
                  <p className="text-[var(--foreground)] font-body font-semibold mb-1">
                    No orders yet
                  </p>
                  <p className="text-[var(--muted)] text-sm font-utility mb-5">
                    Start shopping to see your orders here
                  </p>
                  <Link href="/shop" className="btn-gold text-sm">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-gold-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <div>
                          <p className="font-utility font-bold text-[var(--foreground)] text-sm">
                            #{order.orderNumber}
                          </p>
                          <p className="text-[var(--muted)] text-xs font-utility">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-utility font-bold text-white ${getOrderStatusColor(order.status)}`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>

                      {/* Items preview */}
                      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="relative w-14 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)]"
                          >
                            <img
                              src={item.productImage || "/placeholder-product.jpg"}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-14 h-16 rounded-xl flex items-center justify-center bg-[var(--border)] flex-shrink-0">
                            <span className="text-[var(--muted)] text-xs font-utility">
                              +{order.items.length - 4}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[var(--muted)] text-xs font-utility">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </p>
                          <p className="font-utility font-bold text-[var(--foreground)]">
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                        <Link
                          href={`/profile/orders/${order.id}`}
                          className="flex items-center gap-1 text-gold-500 hover:text-gold-400 text-xs font-utility font-semibold transition-colors"
                        >
                          View Details
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
