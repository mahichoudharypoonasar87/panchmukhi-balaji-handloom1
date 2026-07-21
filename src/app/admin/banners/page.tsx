"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit2, Trash2, X, Loader2, ImagePlus, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAllBannersAdmin, createBanner, updateBanner, deleteBanner } from "@/lib/firebase/firestore";
import { uploadBannerImage, validateImageFile } from "@/lib/firebase/storage";
import { bannerSchema, BannerFormData } from "@/lib/validations";
import { Banner } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { type: "hero", isActive: true, order: 0 },
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      // Admin sees ALL banners (active + inactive) so they can be managed —
      // the public getBanners() only returns active ones for the storefront.
      const data = await getAllBannersAdmin();
      setBanners(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid image");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadBannerImage(file, `banner_${Date.now()}`);
      setImageUrl(url);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setValue("title", banner.title);
    setValue("subtitle", banner.subtitle);
    setValue("description", banner.description);
    setValue("link", banner.link);
    setValue("buttonText", banner.buttonText);
    setValue("type", banner.type);
    setValue("order", banner.order);
    setValue("isActive", banner.isActive);
    setImageUrl(banner.image);
    setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete banner "${title}"?`)) return;
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner deleted");
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    setTogglingId(banner.id);
    try {
      await updateBanner(banner.id, { isActive: !banner.isActive });
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
      );
      toast.success(banner.isActive ? "Banner hidden" : "Banner activated");
    } catch {
      toast.error("Failed to update banner");
    } finally {
      setTogglingId(null);
    }
  };

  const onSubmit = async (data: BannerFormData) => {
    if (!imageUrl) {
      toast.error("Please upload a banner image");
      return;
    }
    try {
      if (editingId) {
        await updateBanner(editingId, { ...data, image: imageUrl });
        toast.success("Banner updated!");
      } else {
        await createBanner({ ...data, image: imageUrl });
        toast.success("Banner created!");
      }
      reset({ type: "hero", isActive: true, order: 0 });
      setImageUrl("");
      setShowForm(false);
      setEditingId(null);
      fetchBanners();
    } catch {
      toast.error("Failed to save banner");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
            Banners
          </h1>
          <p className="text-[var(--muted)] text-sm font-utility">
            {banners.length} banners
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            reset({ type: "hero", isActive: true, order: 0 });
            setImageUrl("");
            setShowForm(true);
          }}
          className="btn-luxury text-sm"
        >
          <Plus size={16} />
          Add Banner
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
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 rounded-3xl bg-[var(--card-bg)] border border-gold-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-[var(--foreground)]">
                  {editingId ? "Edit Banner" : "New Banner"}
                </h2>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                  <X size={18} />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:row-span-4">
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Banner Image *
                  </label>
                  <label className="relative aspect-video rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-gold-500/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors">
                    {imageUrl ? (
                      <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="400px" />
                    ) : uploading ? (
                      <Loader2 size={24} className="text-gold-500 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus size={24} className="text-[var(--muted)] mb-2" />
                        <span className="text-[var(--muted)] text-xs font-utility">Upload Banner</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Title *</label>
                  <input {...register("title")} className="input-luxury" />
                  {errors.title && <p className="text-crimson-400 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Subtitle</label>
                  <input {...register("subtitle")} className="input-luxury" />
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Banner Type</label>
                  <select {...register("type")} className="input-luxury">
                    <option value="hero">Hero</option>
                    <option value="offer">Offer</option>
                    <option value="category">Category</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Link URL</label>
                  <input {...register("link")} placeholder="/shop?category=sarees" className="input-luxury" />
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Button Text</label>
                  <input {...register("buttonText")} placeholder="Shop Now" className="input-luxury" />
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">Display Order</label>
                  <input type="number" {...register("order", { valueAsNumber: true })} className="input-luxury" />
                </div>
              </div>

              <label className="flex items-center gap-2 mt-4">
                <input type="checkbox" {...register("isActive")} className="accent-gold-500" />
                <span className="text-[var(--muted)] text-xs font-utility">Active</span>
              </label>

              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={isSubmitting} className="btn-luxury text-sm">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Save Banner"}
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
      ) : banners.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-[var(--border)]">
          <ImageIcon size={48} className="text-[var(--muted)] mx-auto mb-4" />
          <p className="text-[var(--foreground)] font-body font-semibold">No banners yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] overflow-hidden">
              <div className="relative aspect-video">
                <Image src={banner.image} alt={banner.title} fill className="object-cover" sizes="300px" />
                <span className={cn(
                  "absolute top-2 right-2 px-2 py-1 rounded-full text-[9px] font-utility font-bold uppercase",
                  banner.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                )}>
                  {banner.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="p-4">
                <p className="font-body font-semibold text-[var(--foreground)] text-sm truncate">{banner.title}</p>
                <p className="text-[var(--muted)] text-xs font-utility capitalize mb-3">{banner.type} banner · order {banner.order}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    disabled={togglingId === banner.id}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-utility transition-all",
                      banner.isActive ? "text-orange-400 hover:bg-orange-400/10" : "text-green-500 hover:bg-green-500/10"
                    )}
                  >
                    {togglingId === banner.id ? <Loader2 size={12} className="animate-spin" /> : banner.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                    {banner.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => handleEdit(banner)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 text-xs font-utility transition-all">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(banner.id, banner.title)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-crimson-400 hover:bg-crimson-400/10 text-xs font-utility transition-all">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
