"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit2, Trash2, X, Loader2, ImagePlus, FolderTree } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
} from "@/lib/firebase/firestore";
import { uploadCategoryImage, validateImageFile } from "@/lib/firebase/storage";
import { categorySchema, CategoryFormData } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { Category } from "@/types";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { isActive: true, order: 0 },
  });

  const categoryName = watch("name");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryName && !editingId) {
      setValue("slug", generateSlug(categoryName));
    }
  }, [categoryName, editingId, setValue]);

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
      const url = await uploadCategoryImage(file, `cat_${Date.now()}`);
      setImageUrl(url);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setValue("name", cat.name);
    setValue("slug", cat.slug);
    setValue("description", cat.description);
    setValue("order", cat.order);
    setValue("isActive", cat.isActive);
    setImageUrl(cat.image);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!imageUrl) {
      toast.error("Please upload a category image");
      return;
    }
    try {
      if (editingId) {
        await updateCategory(editingId, { ...data, image: imageUrl });
        toast.success("Category updated!");
      } else {
        await createCategory({
          ...data,
          image: imageUrl,
          productCount: 0,
          description: data.description || "",
        });
        toast.success("Category created!");
      }
      reset({ isActive: true, order: 0 });
      setImageUrl("");
      setShowForm(false);
      setEditingId(null);
      fetchCategories();
    } catch {
      toast.error("Failed to save category");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
            Categories
          </h1>
          <p className="text-[var(--muted)] text-sm font-utility">
            {categories.length} categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            reset({ isActive: true, order: 0 });
            setImageUrl("");
            setShowForm(true);
          }}
          className="btn-luxury text-sm"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Form */}
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
                  {editingId ? "Edit Category" : "New Category"}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div className="sm:row-span-3">
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Category Image *
                  </label>
                  <label className="relative aspect-square rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-gold-500/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors">
                    {imageUrl ? (
                      <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="200px" />
                    ) : uploading ? (
                      <Loader2 size={24} className="text-gold-500 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus size={24} className="text-[var(--muted)] mb-2" />
                        <span className="text-[var(--muted)] text-xs font-utility">Upload Image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Category Name *
                  </label>
                  <input {...register("name")} className="input-luxury" placeholder="e.g. Handloom Sarees" />
                  {errors.name && <p className="text-crimson-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Slug *
                  </label>
                  <input {...register("slug")} className="input-luxury" placeholder="sarees" />
                  {errors.slug && <p className="text-crimson-400 text-xs mt-1">{errors.slug.message}</p>}
                </div>

                <div className="sm:col-span-1">
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Description
                  </label>
                  <textarea {...register("description")} rows={2} className="input-luxury resize-none" />
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Display Order
                  </label>
                  <input type="number" {...register("order", { valueAsNumber: true })} className="input-luxury" />
                </div>
              </div>

              <label className="flex items-center gap-2 mt-4">
                <input type="checkbox" {...register("isActive")} className="accent-gold-500" />
                <span className="text-[var(--muted)] text-xs font-utility">Active (visible on store)</span>
              </label>

              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={isSubmitting} className="btn-luxury text-sm">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Save Category"}
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

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-gold-500 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-[var(--border)]">
          <FolderTree size={48} className="text-[var(--muted)] mx-auto mb-4" />
          <p className="text-[var(--foreground)] font-body font-semibold">No categories yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center gap-4"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)]">
                <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-[var(--foreground)] text-sm truncate">
                  {cat.name}
                </p>
                <p className="text-[var(--muted)] text-xs font-utility">
                  {cat.productCount} products
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-2 rounded-lg text-[var(--muted)] hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-2 rounded-lg text-[var(--muted)] hover:text-crimson-400 hover:bg-crimson-400/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
