import { MetadataRoute } from "next";

// Force this route to be server-rendered on demand (never pre-rendered at
// build time). This prevents Firebase from being called during `next build`
// when env vars may not yet be injected, avoiding `auth/invalid-api-key`.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://panchmukhi-balaji-handloom1.vercel.app/";

  // Static routes — always included
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/return-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic routes from Firestore — only reached at request time, not build time
  try {
    const { getProducts, getCategories } = await import("@/lib/firebase/firestore");
    const [productsResult, categories] = await Promise.all([
      getProducts({}, 200),
      getCategories(),
    ]);

    const productRoutes: MetadataRoute.Sitemap = productsResult.data.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/shop?category=${category.slug}`,
      lastModified: new Date(category.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (err) {
    // Firebase unavailable (no credentials, network issue, etc.) — return static only
    console.warn("[sitemap] Could not fetch dynamic routes:", err);
    return staticRoutes;
  }
}
