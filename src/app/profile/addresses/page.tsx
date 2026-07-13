"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus, Edit2, Trash2, Home, Building2, X, Loader2, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/firebase/auth";
import { addressSchema, AddressFormData } from "@/lib/validations";
import { UserAddress } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi"
];

function AddressesContent() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { type: "home", isDefault: false, country: "India" },
  });

  const addresses = userProfile?.addresses || [];
  const addressType = watch("type");

  const handleEdit = (addr: UserAddress) => {
    setEditingId(addr.id);
    setValue("name", addr.name);
    setValue("phone", addr.phone);
    setValue("address", addr.address);
    setValue("city", addr.city);
    setValue("state", addr.state);
    setValue("pincode", addr.pincode);
    setValue("type", addr.type);
    setValue("isDefault", addr.isDefault);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const updated = addresses.filter((a) => a.id !== id);
    try {
      await updateUserProfile(user.uid, { addresses: updated });
      await refreshProfile();
      toast.success("Address removed");
    } catch {
      toast.error("Failed to remove address");
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    if (!user) return;
    try {
      let updated: UserAddress[];

      if (editingId) {
        updated = addresses.map((a) =>
          a.id === editingId ? { ...a, ...data, id: editingId } : a
        );
      } else {
        const newAddr: UserAddress = { ...data, id: `addr_${Date.now()}` };
        updated = [...addresses, newAddr];
      }

      // If marked default, unmark others
      if (data.isDefault) {
        updated = updated.map((a) => ({
          ...a,
          isDefault: a.id === (editingId || updated[updated.length - 1].id),
        }));
      }

      await updateUserProfile(user.uid, { addresses: updated });
      await refreshProfile();
      toast.success(editingId ? "Address updated!" : "Address added!");
      reset();
      setShowForm(false);
      setEditingId(null);
    } catch {
      toast.error("Failed to save address");
    }
  };

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
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold text-[var(--foreground)]">
                  Saved Addresses
                </h2>
                <button
                  onClick={() => {
                    setEditingId(null);
                    reset({ type: "home", isDefault: false, country: "India" });
                    setShowForm(true);
                  }}
                  className="btn-luxury text-xs"
                >
                  <Plus size={14} />
                  Add Address
                </button>
              </div>

              {/* Address Form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="p-6 rounded-3xl bg-[var(--card-bg)] border border-gold-500/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-base font-bold text-[var(--foreground)]">
                          {editingId ? "Edit Address" : "New Address"}
                        </h3>
                        <button
                          type="button"
                          onClick={() => { setShowForm(false); setEditingId(null); }}
                          className="text-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                            Full Name *
                          </label>
                          <input {...register("name")} className="input-luxury" />
                          {errors.name && <p className="text-crimson-400 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                          <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                            Phone Number *
                          </label>
                          <input {...register("phone")} maxLength={10} className="input-luxury" />
                          {errors.phone && <p className="text-crimson-400 text-xs mt-1">{errors.phone.message}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                            Address *
                          </label>
                          <textarea {...register("address")} rows={2} className="input-luxury resize-none" />
                          {errors.address && <p className="text-crimson-400 text-xs mt-1">{errors.address.message}</p>}
                        </div>
                        <div>
                          <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                            City *
                          </label>
                          <input {...register("city")} className="input-luxury" />
                          {errors.city && <p className="text-crimson-400 text-xs mt-1">{errors.city.message}</p>}
                        </div>
                        <div>
                          <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                            State *
                          </label>
                          <select {...register("state")} className="input-luxury">
                            <option value="">Select State</option>
                            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {errors.state && <p className="text-crimson-400 text-xs mt-1">{errors.state.message}</p>}
                        </div>
                        <div>
                          <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                            Pincode *
                          </label>
                          <input {...register("pincode")} maxLength={6} className="input-luxury" />
                          {errors.pincode && <p className="text-crimson-400 text-xs mt-1">{errors.pincode.message}</p>}
                        </div>
                        <div>
                          <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                            Address Type
                          </label>
                          <div className="flex gap-2">
                            {(["home", "office", "other"] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setValue("type", type)}
                                className={cn(
                                  "px-3 py-2 rounded-xl border text-xs font-utility font-medium capitalize transition-all",
                                  addressType === type
                                    ? "border-gold-500 bg-gold-500/10 text-gold-500"
                                    : "border-[var(--border)] text-[var(--muted)]"
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 mt-4">
                        <input type="checkbox" {...register("isDefault")} className="accent-gold-500" />
                        <span className="text-[var(--muted)] text-xs font-utility">
                          Set as default address
                        </span>
                      </label>

                      <div className="flex gap-3 mt-5">
                        <button type="submit" disabled={isSubmitting} className="btn-luxury text-sm">
                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Save Address"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowForm(false); setEditingId(null); }}
                          className="btn-outline text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Address List */}
              {addresses.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-[var(--border)]">
                  <MapPin size={48} className="text-[var(--muted)] mx-auto mb-4" />
                  <p className="text-[var(--foreground)] font-body font-semibold mb-1">
                    No saved addresses
                  </p>
                  <p className="text-[var(--muted)] text-sm font-utility">
                    Add an address for faster checkout
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <motion.div
                      key={addr.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] relative"
                    >
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 badge-gold text-[10px] flex items-center gap-1">
                          <Star size={10} className="fill-current" />
                          Default
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        {addr.type === "home" ? (
                          <Home size={16} className="text-gold-500" />
                        ) : (
                          <Building2 size={16} className="text-gold-500" />
                        )}
                        <span className="text-[var(--foreground)] font-utility font-semibold text-sm capitalize">
                          {addr.type}
                        </span>
                      </div>
                      <p className="text-[var(--foreground)] font-body font-semibold text-sm mb-1">
                        {addr.name}
                      </p>
                      <p className="text-[var(--muted)] text-sm font-body leading-relaxed mb-2">
                        {addr.address}<br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-[var(--muted)] text-xs font-utility mb-4">
                        📞 {addr.phone}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(addr)}
                          className="flex items-center gap-1 text-xs font-utility text-gold-500 hover:text-gold-400 transition-colors"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="flex items-center gap-1 text-xs font-utility text-crimson-400 hover:text-crimson-300 transition-colors ml-3"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
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

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <AddressesContent />
    </ProtectedRoute>
  );
}
