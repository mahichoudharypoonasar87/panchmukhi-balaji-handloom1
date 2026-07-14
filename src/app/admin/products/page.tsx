"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, Eye, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAllProductsAdmin, deleteProduct } from "@/lib/firebase/firestore";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProductsAdmin();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
            Products
          </h1>
          <p className="text-[var(--muted)] text-sm font-utility">
            {products.length} total products
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-luxury text-sm">
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, SKU, category..."
          className="input-luxury pl-11"
        />
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="text-gold-500 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-[var(--foreground)] font-body font-semibold mb-1">
              {products.length === 0 ? "No products yet" : "No products match your search"}
            </p>
            {products.length === 0 && (
              <Link href="/admin/products/new" className="btn-gold text-sm mt-4 inline-flex">
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                    Product
                  </th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                    Category
                  </th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                    Price
                  </th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                    Stock
                  </th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[var(--muted)] text-xs font-utility font-semibold uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--border)] last:border-none hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border)]">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="w-full h-full bg-[var(--border)] flex items-center justify-center">
                              <span className="text-[var(--muted)] text-[10px]">No img</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[var(--foreground)] font-body font-medium text-xs line-clamp-1 max-w-[180px]">
                            {product.name}
                          </p>
                          <p className="text-[var(--muted)] text-[10px] font-utility">
                            SKU: {product.sku || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)] font-utility text-xs">
                      {product.categoryName || "—"}
                    </td>
                    <td className="px-5 py-3 text-[var(--foreground)] font-utility font-bold text-xs">
                      {formatCurrency(product.basePrice)}
                      {product.baseMrp > product.basePrice && (
                        <span className="text-[var(--muted)] font-normal line-through ml-1">
                          {formatCurrency(product.baseMrp)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "text-xs font-utility font-semibold",
                          product.stock === 0
                            ? "text-crimson-400"
                            : product.stock <= 5
                            ? "text-orange-400"
                            : "text-green-500"
                        )}
                      >
                        {product.stock ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-utility font-bold",
                          product.isActive
                            ? "bg-green-500/15 text-green-500"
                            : "bg-gray-500/15 text-gray-400"
                        )}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                          title="View on store"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-crimson-400 hover:bg-crimson-400/10 transition-all"
                          title="Delete"
                        >
                          {deletingId === product.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
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
