"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Eye, Loader2, ShoppingCart } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAllOrders, updateOrderStatus } from "@/lib/firebase/firestore";
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel, ORDER_STATUSES, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders(100);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, undefined, "Admin");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o))
      );
      toast.success("Order status updated!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search);
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
          Orders
        </h1>
        <p className="text-[var(--muted)] text-sm font-utility">
          {orders.length} total orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, name, phone..."
            className="input-luxury pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-luxury sm:w-56"
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="text-gold-500 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={48} className="text-[var(--muted)] mx-auto mb-4" />
            <p className="text-[var(--foreground)] font-body font-semibold">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Order</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Customer</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Items</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Date</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Total</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Status</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[var(--border)] last:border-none hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-gold-500 font-utility font-semibold text-xs">
                      #{order.orderNumber}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[var(--foreground)] font-body text-xs font-medium">{order.customerName}</p>
                      <p className="text-[var(--muted)] text-[10px] font-utility">{order.customerPhone}</p>
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)] font-utility text-xs">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)] font-utility text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-[var(--foreground)] font-utility font-bold text-xs">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={cn(
                          "text-[10px] font-utility font-bold text-white rounded-full px-2 py-1.5 border-none cursor-pointer",
                          getOrderStatusColor(order.status)
                        )}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value} className="bg-[var(--card-bg)] text-[var(--foreground)]">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-gold-500 hover:bg-gold-500/10 transition-all inline-flex"
                      >
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
