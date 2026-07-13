"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/firebase/firestore";
import { Product } from "@/types";

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    getProductById(params.id as string)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="text-gold-500 animate-spin" />
        </div>
      ) : product ? (
        <ProductForm initialData={product} productId={product.id} />
      ) : (
        <div className="text-center py-16">
          <p className="text-[var(--foreground)] font-body font-semibold">
            Product not found
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
