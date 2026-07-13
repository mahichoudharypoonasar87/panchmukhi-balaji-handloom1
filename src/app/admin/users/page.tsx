"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Search, Users, Shield, ShieldOff, Loader2, Mail, Phone } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { UserProfile } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })) as UserProfile[];
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdmin = async (uid: string, currentStatus: boolean) => {
    setUpdatingId(uid);
    try {
      await updateDoc(doc(db, "users", uid), { isAdmin: !currentStatus });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isAdmin: !currentStatus } : u))
      );
      toast.success(`Admin access ${!currentStatus ? "granted" : "revoked"}`);
    } catch {
      toast.error("Failed to update user");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
          Users
        </h1>
        <p className="text-[var(--muted)] text-sm font-utility">
          {users.length} registered users
        </p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="input-luxury pl-11"
        />
      </div>

      <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="text-gold-500 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="text-[var(--muted)] mx-auto mb-4" />
            <p className="text-[var(--foreground)] font-body font-semibold">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">User</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Contact</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Orders</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Total Spent</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Joined</th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="border-b border-[var(--border)] last:border-none hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                            <span className="text-gold-500 text-xs font-bold">
                              {user.displayName?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <span className="text-[var(--foreground)] font-body text-xs font-medium">
                          {user.displayName || "Unnamed"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[var(--muted)] text-xs font-utility flex items-center gap-1">
                        <Mail size={10} /> {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-[var(--muted)] text-xs font-utility flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {user.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[var(--foreground)] font-utility text-xs">
                      {user.orderCount || 0}
                    </td>
                    <td className="px-5 py-3 text-[var(--foreground)] font-utility font-bold text-xs">
                      {formatCurrency(user.totalSpent || 0)}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)] font-utility text-xs">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleAdmin(user.uid, user.isAdmin)}
                        disabled={updatingId === user.uid}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-utility font-bold transition-all",
                          user.isAdmin
                            ? "bg-gold-500/15 text-gold-500 hover:bg-gold-500/25"
                            : "bg-gray-500/15 text-gray-400 hover:bg-gray-500/25"
                        )}
                      >
                        {updatingId === user.uid ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : user.isAdmin ? (
                          <Shield size={11} />
                        ) : (
                          <ShieldOff size={11} />
                        )}
                        {user.isAdmin ? "Admin" : "User"}
                      </button>
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
