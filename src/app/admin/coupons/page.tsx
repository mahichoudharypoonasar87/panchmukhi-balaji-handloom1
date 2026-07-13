"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit2, Trash2, X, Loader2, Ticket, Copy } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { couponSchema, CouponFormData } from "@/lib/validations";
import { Coupon } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: { discountType: "percentage", isActive: true, userLimit: 1, minOrderValue: 0 },
  });

  const discountType = watch("discountType");

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        validFrom: d.data().validFrom?.toDate?.() || new Date(d.data().validFrom),
        validUntil: d.data().validUntil?.toDate?.() || new Date(d.data().validUntil),
      })) as Coupon[];
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setValue("code", coupon.code);
    setValue("description", coupon.description);
    setValue("discountType", coupon.discountType);
    setValue("discountValue", coupon.discountValue);
    setValue("minOrderValue", coupon.minOrderValue);
    setValue("maxDiscount", coupon.maxDiscount);
    setValue("usageLimit", coupon.usageLimit);
    setValue("userLimit", coupon.userLimit);
    setValue("isActive", coupon.isActive);
    setValue("validFrom", new Date(coupon.validFrom).toISOString().split("T")[0]);
    setValue("validUntil", new Date(coupon.validUntil).toISOString().split("T")[0]);
    setShowForm(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  const onSubmit = async (data: CouponFormData) => {
    try {
      const payload = {
        ...data,
        code: data.code.toUpperCase(),
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
      };

      if (editingId) {
        await updateDoc(doc(db, "coupons", editingId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        toast.success("Coupon updated!");
      } else {
        await addDoc(collection(db, "coupons"), {
          ...payload,
          usageCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Coupon created!");
      }
      reset({ discountType: "percentage", isActive: true, userLimit: 1, minOrderValue: 0 });
      setShowForm(false);
      setEditingId(null);
      fetchCoupons();
    } catch {
      toast.error("Failed to save coupon");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Coupons</h1>
          <p className="text-[var(--muted)] text-sm font-utility">{coupons.length} coupons</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            reset({ discountType: "percentage", isActive: true, userLimit: 1, minOrderValue: 0 });
            setShowForm(true);
          }}
          className="btn-luxury text-sm"
        >
          <Plus size={16} />
          Add Coupon
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-3xl bg-[var(--card-bg)] border border-gold-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-[var(--foreground)]">
                  {editingId ? "Edit Coupon" : "New Coupon"}
                </h2>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                  <X size={18} />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Coupon Code *</label>
                  <input {...register("code")} placeholder="HANDLOOM20" className="input-luxury uppercase" />
                  {errors.code && <p className="text-crimson-400 text-xs mt-1">{errors.code.message}</p>}
                </div>
                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Description *</label>
                  <input {...register("description")} placeholder="Flat 20% off" className="input-luxury" />
                </div>
                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Discount Type</label>
                  <select {...register("discountType")} className="input-luxury">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Discount Value {discountType === "percentage" ? "(%)" : "(₹)"} *
                  </label>
                  <input type="number" {...register("discountValue", { valueAsNumber: true })} className="input-luxury" />
                  {errors.discountValue && <p className="text-crimson-400 text-xs mt-1">{errors.discountValue.message}</p>}
                </div>
                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Min Order Value (₹)</label>
                  <input type="number" {...register("minOrderValue", { valueAsNumber: true })} className="input-luxury" />
                </div>
                {discountType === "percentage" && (
                  <div>
                    <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Max Discount (₹)</label>
                    <input type="number" {...register("maxDiscount", { valueAsNumber: true })} className="input-luxury" />
                  </div>
                )}
                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Usage Limit (Total)</label>
                  <input type="number" {...register("usageLimit", { valueAsNumber: true })} placeholder="Unlimited" className="input-luxury" />
                </div>
                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Per User Limit</label>
                  <input type="number" {...register("userLimit", { valueAsNumber: true })} className="input-luxury" />
                </div>
                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Valid From *</label>
                  <input type="date" {...register("validFrom")} className="input-luxury" />
                  {errors.validFrom && <p className="text-crimson-400 text-xs mt-1">{errors.validFrom.message}</p>}
                </div>
                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Valid Until *</label>
                  <input type="date" {...register("validUntil")} className="input-luxury" />
                  {errors.validUntil && <p className="text-crimson-400 text-xs mt-1">{errors.validUntil.message}</p>}
                </div>
              </div>

              <label className="flex items-center gap-2 mt-4">
                <input type="checkbox" {...register("isActive")} className="accent-gold-500" />
                <span className="text-[var(--muted)] text-xs font-utility">Active</span>
              </label>

              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={isSubmitting} className="btn-luxury text-sm">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Save Coupon"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-outline text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-gold-500 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-[var(--border)]">
          <Ticket size={48} className="text-[var(--muted)] mx-auto mb-4" />
          <p className="text-[var(--foreground)] font-body font-semibold">No coupons yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gold-500/5 rounded-full -mr-8 -mt-8" />
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="flex items-center gap-2 font-utility font-bold text-gold-500 text-sm bg-gold-500/10 px-3 py-1.5 rounded-lg"
                >
                  {coupon.code}
                  <Copy size={12} />
                </button>
                <span className={cn(
                  "px-2 py-1 rounded-full text-[9px] font-utility font-bold",
                  coupon.isActive ? "bg-green-500/15 text-green-500" : "bg-gray-500/15 text-gray-400"
                )}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-[var(--foreground)] text-sm font-body font-medium mb-1">
                {coupon.description}
              </p>
              <p className="text-gold-500 font-utility font-bold text-lg mb-2">
                {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `${formatCurrency(coupon.discountValue)} OFF`}
              </p>
              <p className="text-[var(--muted)] text-xs font-utility mb-1">
                Min order: {formatCurrency(coupon.minOrderValue)}
              </p>
              <p className="text-[var(--muted)] text-xs font-utility mb-3">
                Used: {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
              </p>
              <p className="text-[var(--muted)] text-[10px] font-utility mb-3">
                Valid: {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
              </p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(coupon)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 text-xs font-utility transition-all">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(coupon.id, coupon.code)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-crimson-400 hover:bg-crimson-400/10 text-xs font-utility transition-all">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
