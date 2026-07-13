"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { User, Mail, Phone, Camera, Loader2, Package, Heart, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/firebase/auth";
import { uploadUserAvatar, validateImageFile } from "@/lib/firebase/storage";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface ProfileFormData {
  displayName: string;
  phone: string;
}

function ProfileContent() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: userProfile?.displayName || "",
      phone: userProfile?.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, {
        displayName: data.displayName,
        phone: data.phone,
      });
      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file, 2);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadUserAvatar(file, user.uid);
      await updateUserProfile(user.uid, { photoURL: url });
      await refreshProfile();
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
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

            <div className="lg:col-span-3 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Package, label: "Total Orders", value: userProfile?.orderCount || 0 },
                  { icon: Star, label: "Total Spent", value: formatCurrency(userProfile?.totalSpent || 0) },
                  { icon: Heart, label: "Wishlist", value: userProfile?.wishlist?.length || 0 },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] text-center"
                  >
                    <Icon size={20} className="text-gold-500 mx-auto mb-2" />
                    <p className="font-utility font-bold text-[var(--foreground)] text-lg">
                      {value}
                    </p>
                    <p className="text-[var(--muted)] text-xs font-utility">{label}</p>
                  </div>
                ))}
              </div>

              {/* Profile Form */}
              <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-5">
                  Personal Information
                </h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gold-500/50"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-500/50 flex items-center justify-center">
                        <User size={32} className="text-gold-500" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center cursor-pointer hover:bg-gold-400 transition-colors">
                      {uploading ? (
                        <Loader2 size={14} className="text-ebony animate-spin" />
                      ) : (
                        <Camera size={14} className="text-ebony" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-[var(--foreground)] font-body font-semibold">
                      {userProfile?.displayName}
                    </p>
                    <p className="text-[var(--muted)] text-xs font-utility">
                      Click camera icon to update photo
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input {...register("displayName")} className="input-luxury pl-9" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input {...register("phone")} placeholder="10-digit mobile number" className="input-luxury pl-9" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input
                          value={user?.email || ""}
                          disabled
                          className="input-luxury pl-9 opacity-60 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-luxury text-sm">
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
