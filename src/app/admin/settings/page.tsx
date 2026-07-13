"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import {
  Store, Phone, Mail, MapPin, Truck, Percent, Image as ImageIcon,
  Facebook, Instagram, Youtube, Twitter, Save, Loader2, Globe
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getSiteSettings, updateSiteSettings } from "@/lib/firebase/firestore";
import { uploadFile, validateImageFile } from "@/lib/firebase/storage";
import { SiteSettings } from "@/types";
import toast from "react-hot-toast";

interface SettingsFormData {
  storeName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstRate: number;
  shippingCharge: number;
  freeShippingAbove: number;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  maintenance: boolean;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SettingsFormData>({
    defaultValues: {
      storeName: "Panchmukhi Balaji Handloom",
      tagline: "Authentic Rajasthani Handloom Textiles",
      gstRate: 5,
      shippingCharge: 80,
      freeShippingAbove: 999,
      city: "Poonasar",
      state: "Rajasthan",
    },
  });

  useEffect(() => {
    getSiteSettings()
      .then((settings) => {
        if (settings) {
          reset({
            storeName: settings.storeName,
            tagline: settings.tagline,
            description: settings.description,
            email: settings.email,
            phone: settings.phone,
            whatsappNumber: settings.whatsappNumber,
            address: settings.address,
            city: settings.city,
            state: settings.state,
            pincode: settings.pincode,
            gstRate: settings.gstRate,
            shippingCharge: settings.shippingCharge,
            freeShippingAbove: settings.freeShippingAbove,
            facebook: settings.socialLinks?.facebook,
            instagram: settings.socialLinks?.instagram,
            twitter: settings.socialLinks?.twitter,
            youtube: settings.socialLinks?.youtube,
            metaTitle: settings.seo?.metaTitle,
            metaDescription: settings.seo?.metaDescription,
            keywords: settings.seo?.keywords,
            maintenance: settings.maintenance,
          });
          if (settings.logo) setLogoUrl(settings.logo);
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 2);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid image");
      return;
    }
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file, `settings/logo_${Date.now()}.${file.name.split(".").pop()}`);
      setLogoUrl(url);
      toast.success("Logo uploaded!");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const settingsPayload: Partial<SiteSettings> = {
        storeName: data.storeName,
        tagline: data.tagline,
        description: data.description,
        email: data.email,
        phone: data.phone,
        whatsappNumber: data.whatsappNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        logo: logoUrl,
        currency: "INR",
        currencySymbol: "₹",
        gstRate: data.gstRate,
        shippingCharge: data.shippingCharge,
        freeShippingAbove: data.freeShippingAbove,
        socialLinks: {
          facebook: data.facebook,
          instagram: data.instagram,
          twitter: data.twitter,
          youtube: data.youtube,
        },
        seo: {
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          keywords: data.keywords,
        },
        maintenance: data.maintenance,
      };
      await updateSiteSettings(settingsPayload);
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    }
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

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
          Store Settings
        </h1>
        <p className="text-[var(--muted)] text-sm font-utility">
          Manage your store configuration
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Store Info */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
          <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Store size={18} className="text-gold-500" />
            Store Information
          </h2>

          {/* Logo */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-[var(--border)] overflow-hidden flex items-center justify-center">
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo" fill className="object-cover" sizes="80px" />
              ) : uploadingLogo ? (
                <Loader2 size={20} className="text-gold-500 animate-spin" />
              ) : (
                <ImageIcon size={20} className="text-[var(--muted)]" />
              )}
            </div>
            <label className="btn-outline text-xs cursor-pointer">
              Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Store Name
              </label>
              <input {...register("storeName")} className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Tagline
              </label>
              <input {...register("tagline")} className="input-luxury" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Store Description
              </label>
              <textarea {...register("description")} rows={3} className="input-luxury resize-none" />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
          <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Phone size={18} className="text-gold-500" />
            Contact Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input {...register("email")} type="email" className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Phone
              </label>
              <input {...register("phone")} className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                WhatsApp Number (with country code)
              </label>
              <input {...register("whatsappNumber")} placeholder="91XXXXXXXXXX" className="input-luxury" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Address
              </label>
              <input {...register("address")} placeholder="Panchori Road" className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                City
              </label>
              <input {...register("city")} className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                State
              </label>
              <input {...register("state")} className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Pincode
              </label>
              <input {...register("pincode")} className="input-luxury" />
            </div>
          </div>
        </div>

        {/* Pricing & Shipping */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
          <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Truck size={18} className="text-gold-500" />
            Pricing & Shipping
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                GST Rate (%)
              </label>
              <input type="number" {...register("gstRate", { valueAsNumber: true })} className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Shipping Charge (₹)
              </label>
              <input type="number" {...register("shippingCharge", { valueAsNumber: true })} className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Free Shipping Above (₹)
              </label>
              <input type="number" {...register("freeShippingAbove", { valueAsNumber: true })} className="input-luxury" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
          <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Globe size={18} className="text-gold-500" />
            Social Media Links
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
                <Facebook size={12} /> Facebook
              </label>
              <input {...register("facebook")} placeholder="https://facebook.com/..." className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
                <Instagram size={12} /> Instagram
              </label>
              <input {...register("instagram")} placeholder="https://instagram.com/..." className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
                <Twitter size={12} /> Twitter / X
              </label>
              <input {...register("twitter")} placeholder="https://twitter.com/..." className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
                <Youtube size={12} /> YouTube
              </label>
              <input {...register("youtube")} placeholder="https://youtube.com/..." className="input-luxury" />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
          <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4">
            SEO Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Default Meta Title
              </label>
              <input {...register("metaTitle")} className="input-luxury" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Default Meta Description
              </label>
              <textarea {...register("metaDescription")} rows={2} className="input-luxury resize-none" />
            </div>
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Keywords (comma separated)
              </label>
              <input {...register("keywords")} className="input-luxury" />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register("maintenance")} className="w-5 h-5 accent-crimson-600" />
            <div>
              <p className="text-[var(--foreground)] font-body font-semibold text-sm">
                Maintenance Mode
              </p>
              <p className="text-[var(--muted)] text-xs font-utility">
                Temporarily disable storefront access for customers
              </p>
            </div>
          </label>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-luxury">
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </button>
      </form>
    </AdminLayout>
  );
}
