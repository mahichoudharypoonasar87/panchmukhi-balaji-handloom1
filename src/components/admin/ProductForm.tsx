"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save, X, Plus, Trash2, Loader2, ImagePlus, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { productSchema, ProductFormData } from "@/lib/validations";
import { createProduct, updateProduct, getCategories } from "@/lib/firebase/firestore";
import { uploadProductImage, validateImageFile } from "@/lib/firebase/storage";
import { generateSlug, cn } from "@/lib/utils";
import { Product, Category, ProductVariant, ProductImage } from "@/types";
import toast from "react-hot-toast";

interface ProductFormProps {
  initialData?: Product;
  productId?: string;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>(initialData?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || []);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description,
          shortDescription: initialData.shortDescription,
          categoryId: initialData.categoryId,
          categoryName: initialData.categoryName,
          basePrice: initialData.basePrice,
          baseMrp: initialData.baseMrp,
          stock: initialData.stock,
          sku: initialData.sku,
          tags: initialData.tags,
          isFeatured: initialData.isFeatured,
          isTrending: initialData.isTrending,
          isBestSeller: initialData.isBestSeller,
          isNewArrival: initialData.isNewArrival,
          isActive: initialData.isActive,
          fabricType: initialData.fabricType,
          occasion: initialData.occasion,
          washCare: initialData.washCare,
          material: initialData.material,
          origin: initialData.origin,
          weight: initialData.weight,
          metaTitle: initialData.metaTitle,
          metaDescription: initialData.metaDescription,
        }
      : {
          isActive: true,
          isNewArrival: true,
          isFeatured: false,
          isTrending: false,
          isBestSeller: false,
          origin: "Poonasar, Rajasthan, India",
        },
  });

  const name = watch("name");
  const categoryId = watch("categoryId");

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Auto-generate slug from name (only for new products)
  useEffect(() => {
    if (name && !isEdit) {
      setValue("slug", generateSlug(name));
    }
  }, [name, isEdit, setValue]);

  // Auto-set categoryName AND categorySlug when category is selected
  useEffect(() => {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      setValue("categoryName", cat.name);
      // categorySlug is stored on the product so the shop can filter by URL slug
      // This field isn't in the schema validation but we add it to the saved data
    }
  }, [categoryId, categories, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const tempId = productId || `temp_${Date.now()}`;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateImageFile(file, 5);
        if (!validation.valid) {
          toast.error(validation.error || "Invalid image");
          continue;
        }
        const url = await uploadProductImage(file, tempId, images.length + i);
        setImages((prev) => [
          ...prev,
          { url, alt: name || "Product image", order: prev.length },
        ]);
      }
      toast.success("Images uploaded!");
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var_${Date.now()}`,
        size: "",
        color: "",
        colorHex: "#8B1A1A",
        price: watch("basePrice") || 0,
        mrp: watch("baseMrp") || 0,
        stock: 0,
        sku: "",
      },
    ]);
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    setSubmitting(true);
    try {
      const discount =
        data.baseMrp > 0
          ? Math.round(((data.baseMrp - data.basePrice) / data.baseMrp) * 100)
          : 0;

      // Find the selected category to also save its slug
      const selectedCategory = categories.find((c) => c.id === data.categoryId);

      const productData = {
        ...data,
        images,
        variants,
        discount,
        // ── KEY FIX ──────────────────────────────────────────────────────────
        // Save categorySlug so the shop's ?category=<slug> filter works correctly.
        // Without this, getProducts couldn't match URL slugs to products.
        categorySlug: selectedCategory?.slug || generateSlug(data.categoryName),
        // ─────────────────────────────────────────────────────────────────────
        rating: initialData?.rating || 0,
        reviewCount: initialData?.reviewCount || 0,
        tags: data.tags || [],
      };

      if (isEdit && productId) {
        await updateProduct(productId, productData);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(
          productData as Omit<Product, "id" | "createdAt" | "updatedAt">
        );
        toast.success("Product created successfully!");
      }
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── LEFT: Main content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Product Name *
                </label>
                <input
                  {...register("name")}
                  className="input-luxury"
                  placeholder="e.g. Rajasthani Cotton Handloom Saree"
                />
                {errors.name && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  URL Slug *
                </label>
                <input
                  {...register("slug")}
                  className="input-luxury"
                  placeholder="auto-generated-from-name"
                />
                {errors.slug && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Short Description * (shown in product cards)
                </label>
                <textarea
                  {...register("shortDescription")}
                  rows={2}
                  className="input-luxury resize-none"
                  placeholder="Brief one-liner — max 300 characters"
                />
                {errors.shortDescription && (
                  <p className="text-crimson-400 text-xs mt-1">
                    {errors.shortDescription.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Full Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={5}
                  className="input-luxury resize-none"
                  placeholder="Detailed product description..."
                />
                {errors.description && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-1">
              Product Images *
            </h2>
            <p className="text-[var(--muted)] text-xs font-utility mb-4">
              First image = main thumbnail. Recommended: 800×1000 px, max 5 MB each.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] group"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-crimson-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={11} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 badge-gold text-[8px] px-1.5 py-0.5">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {/* Upload button */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--border)] hover:border-gold-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                {uploadingImages ? (
                  <Loader2 size={20} className="text-gold-500 animate-spin" />
                ) : (
                  <>
                    <ImagePlus size={20} className="text-[var(--muted)] mb-1" />
                    <span className="text-[var(--muted)] text-[10px] font-utility text-center px-1">
                      Add Image
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Variants */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--foreground)]">
                  Variants
                </h2>
                <p className="text-[var(--muted)] text-xs font-utility">
                  Size/Color variants — leave empty to use base price & stock
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="btn-outline text-xs py-2 px-3"
              >
                <Plus size={14} />
                Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="text-[var(--muted)] text-sm font-utility text-center py-4 border border-dashed border-[var(--border)] rounded-xl">
                No variants — product uses base price & stock from the sidebar
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-2 px-1 pb-1">
                  {["Size", "Color", "Hex", "Price ₹", "Stock", ""].map((h) => (
                    <span key={h} className="text-[var(--muted)] text-[10px] font-utility uppercase">
                      {h}
                    </span>
                  ))}
                </div>
                {variants.map((variant, i) => (
                  <div
                    key={variant.id}
                    className="grid grid-cols-6 gap-2 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]"
                  >
                    <input
                      placeholder="Size"
                      value={variant.size || ""}
                      onChange={(e) => updateVariant(i, "size", e.target.value)}
                      className="input-luxury py-2 text-xs"
                    />
                    <input
                      placeholder="Color name"
                      value={variant.color || ""}
                      onChange={(e) => updateVariant(i, "color", e.target.value)}
                      className="input-luxury py-2 text-xs"
                    />
                    <input
                      type="color"
                      value={variant.colorHex || "#8B1A1A"}
                      onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                      className="w-full h-9 rounded-lg border border-[var(--border)] cursor-pointer p-0.5"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={variant.price || ""}
                      onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                      className="input-luxury py-2 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={variant.stock || ""}
                      onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
                      className="input-luxury py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="flex items-center justify-center text-crimson-400 hover:bg-crimson-900/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4">
              Product Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Fabric Type
                </label>
                <input
                  {...register("fabricType")}
                  className="input-luxury"
                  placeholder="e.g. Pure Cotton"
                />
              </div>
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Material
                </label>
                <input
                  {...register("material")}
                  className="input-luxury"
                  placeholder="e.g. Handwoven Cotton"
                />
              </div>
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Occasion
                </label>
                <input
                  {...register("occasion")}
                  className="input-luxury"
                  placeholder="e.g. Festive, Casual, Wedding"
                />
              </div>
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Weight
                </label>
                <input
                  {...register("weight")}
                  className="input-luxury"
                  placeholder="e.g. 500g"
                />
              </div>
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Origin
                </label>
                <input
                  {...register("origin")}
                  className="input-luxury"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Wash & Care Instructions
                </label>
                <textarea
                  {...register("washCare")}
                  rows={3}
                  className="input-luxury resize-none"
                  placeholder="e.g. Hand wash in cold water, dry in shade..."
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-4">
              SEO (Optional)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Meta Title
                </label>
                <input
                  {...register("metaTitle")}
                  className="input-luxury"
                  placeholder="Leave blank to use product name"
                />
              </div>
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Meta Description
                </label>
                <textarea
                  {...register("metaDescription")}
                  rows={2}
                  className="input-luxury resize-none"
                  placeholder="Leave blank to use short description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="space-y-6">
          {/* Pricing & Inventory */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h2 className="font-display text-base font-bold text-[var(--foreground)] mb-4">
              Pricing & Inventory
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  {...register("basePrice", { valueAsNumber: true })}
                  className="input-luxury"
                  placeholder="1499"
                />
                {errors.basePrice && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.basePrice.message}</p>
                )}
              </div>
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  MRP / Original Price (₹) *
                </label>
                <input
                  type="number"
                  {...register("baseMrp", { valueAsNumber: true })}
                  className="input-luxury"
                  placeholder="1999"
                />
                {errors.baseMrp && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.baseMrp.message}</p>
                )}
              </div>
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                  className="input-luxury"
                  placeholder="50"
                />
                {errors.stock && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.stock.message}</p>
                )}
              </div>
              <div>
                <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                  SKU *
                </label>
                <input
                  {...register("sku")}
                  className="input-luxury"
                  placeholder="PBH-SAREE-001"
                />
                {errors.sku && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.sku.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h2 className="font-display text-base font-bold text-[var(--foreground)] mb-4">
              Category *
            </h2>
            {categories.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-[var(--muted)] text-xs font-utility mb-2">
                  No categories found
                </p>
                <Link
                  href="/admin/categories"
                  className="text-gold-500 text-xs font-utility hover:text-gold-400"
                >
                  Create a category first →
                </Link>
              </div>
            ) : (
              <>
                <select {...register("categoryId")} className="input-luxury">
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-crimson-400 text-xs mt-1">{errors.categoryId.message}</p>
                )}
              </>
            )}
          </div>

          {/* Visibility */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
            <h2 className="font-display text-base font-bold text-[var(--foreground)] mb-4">
              Visibility
            </h2>
            <div className="space-y-3">
              {[
                { key: "isActive" as const, label: "Active (visible on store)" },
                { key: "isFeatured" as const, label: "Featured Product" },
                { key: "isTrending" as const, label: "Trending Product" },
                { key: "isBestSeller" as const, label: "Best Seller" },
                { key: "isNewArrival" as const, label: "New Arrival" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(key)}
                    className="w-4 h-4 accent-gold-500"
                  />
                  <span className="text-[var(--foreground)] text-sm font-body">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-luxury w-full justify-center"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  {isEdit ? "Update Product" : "Create Product"}
                </>
              )}
            </button>
            <Link
              href="/admin/products"
              className="btn-outline w-full justify-center text-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
