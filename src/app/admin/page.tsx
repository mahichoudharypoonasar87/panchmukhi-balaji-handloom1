"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, ShoppingCart, IndianRupee, TrendingUp, Clock,
  XCircle, CheckCircle, Package, ArrowRight
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatCard from "@/components/admin/StatCard";
import { getDashboardStats } from "@/lib/firebase/firestore";
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils";
import { Order } from "@/types";
import { Loader2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  todaySales: number;
  pendingOrders: number;
  cancelledOrders: number;
  deliveredOrders: number;
  recentOrders: Order[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data as Stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="text-gold-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
          Dashboard Overview
        </h1>
        <p className="text-[var(--muted)] text-sm font-utility">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={IndianRupee}
          color="gold"
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats?.todaySales || 0)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="gold"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          color="crimson"
        />
        <StatCard
          title="Delivered Orders"
          value={stats?.deliveredOrders || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Cancelled Orders"
          value={stats?.cancelledOrders || 0}
          icon={XCircle}
          color="crimson"
        />
        <StatCard
          title="Total Products"
          value="—"
          icon={Package}
          color="blue"
        />
      </div>

      {/* Recent Orders */}
      <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="font-display text-lg font-bold text-[var(--foreground)]">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-gold-500 hover:text-gold-400 text-xs font-utility font-semibold transition-colors"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                  Order
                </th>
                <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                  Customer
                </th>
                <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                  Date
                </th>
                <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                  Amount
                </th>
                <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)] text-sm">
                    No orders yet
                  </td>
                </tr>
              ) : (
                stats?.recentOrders?.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--border)] last:border-none hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-gold-500 hover:text-gold-400 font-utility font-semibold text-xs"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--foreground)] font-body text-xs">
                      {order.customerName}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--muted)] font-utility text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--foreground)] font-utility font-bold text-xs">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-utility font-bold text-white ${getOrderStatusColor(order.status)}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
