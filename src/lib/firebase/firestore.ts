import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import {
  Product,
  Category,
  Order,
  Cart,
  CartItem,
  Coupon,
  Banner,
  Review,
  SiteSettings,
  Notification,
  ProductFilters,
  PaginatedResponse,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const convertTimestamp = (data: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = convertTimestamp(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get products for the public shop page.
 * Filters by isActive == true.
 * Category filter: accepts EITHER a Firestore doc ID or a slug — we resolve
 * slugs automatically by looking up the categories collection first.
 */
export const getProducts = async (
  filters: ProductFilters = {},
  pageSize = 12,
  // lastDoc param kept for API compat but JS pagination is used instead
  _lastDoc?: unknown
): Promise<PaginatedResponse<Product>> => {
  try {
    // ── Step 1: Resolve category slug → Firestore doc ID ─────────────────
    let resolvedCategoryId: string | undefined;
    if (filters.category) {
      try {
        // Check if it looks like a slug (no special chars of a Firestore ID)
        const slugSnap = await getDocs(
          query(
            collection(db, "categories"),
            where("slug", "==", filters.category),
            limit(1)
          )
        );
        resolvedCategoryId = slugSnap.empty
          ? filters.category          // treat as direct Firestore ID
          : slugSnap.docs[0].id;      // found by slug
      } catch {
        resolvedCategoryId = filters.category;
      }
    }

    // ── Step 2: Build Firestore query with at most ONE where clause ────────
    // Only ONE equality where at a time = uses auto-created single-field index
    // = NO composite index required AT ALL.
    const constraints: QueryConstraint[] = [];

    if (resolvedCategoryId) {
      // Category selected → filter by categoryId
      constraints.push(where("categoryId", "==", resolvedCategoryId));
    }
    // No other Firestore where clauses — everything else done in JavaScript

    // Fetch enough documents to paginate after JS filtering
    // 200 is safe for a small handloom store (≈ max products they'll have)
    constraints.push(limit(200));

    const snapshot = await getDocs(
      query(collection(db, "products"), ...constraints)
    );

    // ── Step 3: Map documents ────────────────────────────────────────────
    let products = snapshot.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Product[];

    // ── Step 4: JavaScript filtering ────────────────────────────────────
    // isActive filter
    products = products.filter((p) => p.isActive !== false);

    // Price range
    if (filters.minPrice !== undefined) {
      products = products.filter((p) => (p.basePrice ?? 0) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => (p.basePrice ?? 0) <= filters.maxPrice!);
    }

    // In-stock only
    if (filters.inStock) {
      products = products.filter((p) => (p.stock ?? 0) > 0);
    }

    // Minimum rating
    if (filters.rating !== undefined) {
      products = products.filter((p) => (p.rating ?? 0) >= filters.rating!);
    }

    // Full-text search across name, description, category, tags
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.fabricType?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // ── Step 5: JavaScript sorting ───────────────────────────────────────
    switch (filters.sortBy) {
      case "price_asc":
        products.sort((a, b) => (a.basePrice ?? 0) - (b.basePrice ?? 0));
        break;
      case "price_desc":
        products.sort((a, b) => (b.basePrice ?? 0) - (a.basePrice ?? 0));
        break;
      case "popular":
        products.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
        break;
      case "rating":
        products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default: // "newest"
        products.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        );
    }

    // ── Step 6: Paginate ─────────────────────────────────────────────────
    const total   = products.length;
    const hasMore = total > pageSize;
    const data    = products.slice(0, pageSize);

    return { data, total, page: 1, pageSize, hasMore };
  } catch (err) {
    console.error("[getProducts] query failed:", err);
    return { data: [], total: 0, page: 1, pageSize, hasMore: false };
  }
};

/**
 * Get ALL products for the admin panel — no isActive filter, no pagination limit.
 */
export const getAllProductsAdmin = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "products"), orderBy("createdAt", "desc"))
    );
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Product[];
  } catch (err) {
    console.error("[getAllProductsAdmin] failed:", err);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...convertTimestamp(snap.data() as Record<string, unknown>) } as Product;
  } catch {
    return null;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const snap = await getDocs(
      query(collection(db, "products"), where("slug", "==", slug), limit(1))
    );
    if (snap.empty) return null;
    return {
      id: snap.docs[0].id,
      ...convertTimestamp(snap.docs[0].data() as Record<string, unknown>),
    } as Product;
  } catch {
    return null;
  }
};

export const getFeaturedProducts = async (count = 8): Promise<Product[]> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, "products"),
        where("isActive", "==", true),
        where("isFeatured", "==", true),
        orderBy("createdAt", "desc"),
        limit(count)
      )
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Product[];
  } catch {
    return [];
  }
};

export const getTrendingProducts = async (count = 8): Promise<Product[]> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, "products"),
        where("isActive", "==", true),
        where("isTrending", "==", true),
        orderBy("createdAt", "desc"),
        limit(count)
      )
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Product[];
  } catch {
    return [];
  }
};

export const getBestSellers = async (count = 8): Promise<Product[]> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, "products"),
        where("isActive", "==", true),
        where("isBestSeller", "==", true),
        orderBy("createdAt", "desc"),
        limit(count)
      )
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Product[];
  } catch {
    return [];
  }
};

export const getRelatedProducts = async (
  categoryId: string,
  excludeId: string,
  count = 4
): Promise<Product[]> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, "products"),
        where("isActive", "==", true),
        where("categoryId", "==", categoryId),
        limit(count + 1)
      )
    );
    return snap.docs
      .map((d) => ({ id: d.id, ...convertTimestamp(d.data() as Record<string, unknown>) }))
      .filter((p) => p.id !== excludeId)
      .slice(0, count) as Product[];
  } catch {
    return [];
  }
};

export const createProduct = async (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const ref = await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<void> => {
  await updateDoc(doc(db, "products", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "products", id));
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
export const getCategories = async (): Promise<Category[]> => {
  try {
    const snap = await getDocs(
      query(collection(db, "categories"), where("isActive", "==", true), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Category[];
  } catch {
    return [];
  }
};

export const createCategory = async (
  data: Omit<Category, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const ref = await addDoc(collection(db, "categories"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<void> => {
  await updateDoc(doc(db, "categories", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "categories", id));
};

// ─────────────────────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────────────────────
export const subscribeToCart = (userId: string, callback: (cart: Cart | null) => void) => {
  return onSnapshot(doc(db, "carts", userId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...convertTimestamp(snap.data() as Record<string, unknown>) } as Cart);
    } else {
      callback(null);
    }
  });
};

const calcTotals = (
  items: CartItem[],
  couponDiscount = 0
): Pick<Cart, "subtotal" | "discount" | "shippingCharge" | "gst" | "total"> => {
  const subtotal = items.reduce((s, i) => s + i.mrp * i.quantity, 0);
  const itemDiscount = items.reduce((s, i) => s + (i.mrp - i.price) * i.quantity, 0);
  const discount = itemDiscount + couponDiscount;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shippingCharge = afterDiscount >= 999 ? 0 : 80;
  const gst = Math.round(afterDiscount * 0.05);
  const total = afterDiscount + shippingCharge + gst;
  return { subtotal, discount, shippingCharge, gst, total };
};

export const addToCart = async (userId: string, item: Omit<CartItem, "id">): Promise<void> => {
  const cartRef = doc(db, "carts", userId);
  const cartSnap = await getDoc(cartRef);
  const newItem: CartItem = {
    ...item,
    id: `${item.productId}_${item.variantId || "default"}_${Date.now()}`,
  };

  if (!cartSnap.exists()) {
    await setDoc(cartRef, {
      userId,
      items: [newItem],
      couponDiscount: 0,
      ...calcTotals([newItem]),
      updatedAt: serverTimestamp(),
    });
  } else {
    const cartData = cartSnap.data() as Cart;
    const idx = cartData.items.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId
    );
    const updatedItems =
      idx > -1
        ? cartData.items.map((i, n) =>
            n === idx ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) } : i
          )
        : [...cartData.items, newItem];

    await updateDoc(cartRef, {
      items: updatedItems,
      ...calcTotals(updatedItems, cartData.couponDiscount || 0),
      updatedAt: serverTimestamp(),
    });
  }
};

export const updateCartItem = async (
  userId: string,
  itemId: string,
  quantity: number
): Promise<void> => {
  const cartRef = doc(db, "carts", userId);
  const snap = await getDoc(cartRef);
  if (!snap.exists()) return;
  const cartData = snap.data() as Cart;
  const updatedItems =
    quantity <= 0
      ? cartData.items.filter((i) => i.id !== itemId)
      : cartData.items.map((i) =>
          i.id === itemId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
        );
  await updateDoc(cartRef, {
    items: updatedItems,
    ...calcTotals(updatedItems, cartData.couponDiscount || 0),
    updatedAt: serverTimestamp(),
  });
};

export const removeFromCart = async (userId: string, itemId: string): Promise<void> => {
  await updateCartItem(userId, itemId, 0);
};

export const clearCart = async (userId: string): Promise<void> => {
  await setDoc(doc(db, "carts", userId), {
    userId,
    items: [],
    couponCode: null,
    couponDiscount: 0,
    subtotal: 0,
    discount: 0,
    shippingCharge: 0,
    gst: 0,
    total: 0,
    updatedAt: serverTimestamp(),
  });
};

export const applyCoupon = async (
  userId: string,
  couponCode: string
): Promise<{ success: boolean; discount: number; message: string }> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, "coupons"),
        where("code", "==", couponCode.toUpperCase()),
        where("isActive", "==", true),
        limit(1)
      )
    );
    if (snap.empty) return { success: false, discount: 0, message: "Invalid coupon code" };

    const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
    const now = new Date();
    if (coupon.validUntil && new Date(coupon.validUntil) < now)
      return { success: false, discount: 0, message: "Coupon has expired" };
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)
      return { success: false, discount: 0, message: "Coupon usage limit reached" };

    const cartSnap = await getDoc(doc(db, "carts", userId));
    if (!cartSnap.exists()) return { success: false, discount: 0, message: "Cart is empty" };
    const cartData = cartSnap.data() as Cart;

    if (cartData.subtotal < coupon.minOrderValue)
      return {
        success: false,
        discount: 0,
        message: `Minimum order ₹${coupon.minOrderValue} required`,
      };

    let discount =
      coupon.discountType === "percentage"
        ? Math.round((cartData.subtotal * coupon.discountValue) / 100)
        : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

    await updateDoc(doc(db, "carts", userId), {
      couponCode: coupon.code,
      couponDiscount: discount,
      ...calcTotals(cartData.items, discount),
      updatedAt: serverTimestamp(),
    });
    return { success: true, discount, message: `Coupon applied! You saved ₹${discount}` };
  } catch {
    return { success: false, discount: 0, message: "Failed to apply coupon" };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * createOrder — simple setDoc (no batch).
 *
 * The original implementation used writeBatch to also decrement product stock
 * and update user stats. This FAILS for non-admin users because Firestore
 * security rules only allow admins to write product documents.
 *
 * Fix: just create the order document (user has permission for that) and
 * optionally update user stats in a separate try/catch so it never blocks
 * the order from being saved.
 */
export const createOrder = async (
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  // 1. Create the order document
  const orderRef = doc(collection(db, "orders"));
  await setDoc(orderRef, {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 2. Update user stats — best effort (non-blocking)
  try {
    await updateDoc(doc(db, "users", orderData.userId), {
      orderCount: increment(1),
      totalSpent: increment(orderData.total),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-critical — user stats may lag slightly
  }

  // 3. Update coupon usage — best effort (non-blocking)
  if (orderData.couponCode) {
    try {
      const couponSnap = await getDocs(
        query(
          collection(db, "coupons"),
          where("code", "==", orderData.couponCode),
          limit(1)
        )
      );
      if (!couponSnap.empty) {
        await updateDoc(couponSnap.docs[0].ref, { usageCount: increment(1) });
      }
    } catch {
      // Non-critical
    }
  }

  return orderRef.id;
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const snap = await getDoc(doc(db, "orders", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...convertTimestamp(snap.data() as Record<string, unknown>) } as Order;
  } catch {
    return null;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const snap = await getDocs(
      query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Order[];
  } catch {
    return [];
  }
};

export const getAllOrders = async (pageSize = 100): Promise<Order[]> => {
  try {
    const snap = await getDocs(
      query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(pageSize))
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Order[];
  } catch {
    return [];
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  note?: string,
  updatedBy?: string
): Promise<void> => {
  try {
    const snap = await getDoc(doc(db, "orders", orderId));
    if (!snap.exists()) {
      console.warn("[updateOrderStatus] order not found:", orderId);
      return;
    }
 
    const existing = snap.data() as Order;
 
    // Build timeline entry — omit undefined fields Firestore would reject
    const timelineEntry: Record<string, unknown> = {
      status,
      timestamp: new Date().toISOString(),
    };
    if (note)      timelineEntry.note      = note;
    if (updatedBy) timelineEntry.updatedBy = updatedBy;
 
    const timeline = [...(existing.timeline || []), timelineEntry];
 
    await updateDoc(doc(db, "orders", orderId), {
      status,
      timeline,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[updateOrderStatus] error:", err);
    throw err; // re-throw so the UI can show an error
  }
};

export const trackOrder = async (
  orderNumber: string,
  phone: string
): Promise<Order | null> => {
  try {
    // Query only by orderNumber — no composite index needed
    const snap = await getDocs(
      query(
        collection(db, "orders"),
        where("orderNumber", "==", orderNumber.trim().toUpperCase()),
        limit(1)
      )
    );
 
    if (snap.empty) return null;
 
    const order = {
      id: snap.docs[0].id,
      ...convertTimestamp(snap.docs[0].data() as Record<string, unknown>),
    } as Order;
 
    // Verify phone in JavaScript (avoids need for composite index)
    const savedPhone = (order.customerPhone || "").replace(/\s/g, "");
    const inputPhone  = phone.trim().replace(/\s/g, "");
 
    if (savedPhone !== inputPhone) return null;
 
    return order;
  } catch (err) {
    console.error("[trackOrder] error:", err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────────────────────────
export const addToWishlist = async (userId: string, productId: string): Promise<void> => {
  await updateDoc(doc(db, "users", userId), {
    wishlist: arrayUnion(productId),
    updatedAt: serverTimestamp(),
  });
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  await updateDoc(doc(db, "users", userId), {
    wishlist: arrayRemove(productId),
    updatedAt: serverTimestamp(),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// BANNERS
// ─────────────────────────────────────────────────────────────────────────────
export const getBanners = async (type?: string): Promise<Banner[]> => {
  try {
    const constraints: QueryConstraint[] = [
      where("isActive", "==", true),
      orderBy("order", "asc"),
    ];
    if (type) constraints.unshift(where("type", "==", type));
    const snap = await getDocs(query(collection(db, "banners"), ...constraints));
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Banner[];
  } catch {
    return [];
  }
};

export const createBanner = async (
  data: Omit<Banner, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const ref = await addDoc(collection(db, "banners"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateBanner = async (id: string, data: Partial<Banner>): Promise<void> => {
  await updateDoc(doc(db, "banners", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteBanner = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "banners", id));
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, "reviews"),
        where("productId", "==", productId),
        where("isApproved", "==", true),
        orderBy("createdAt", "desc")
      )
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Review[];
  } catch {
    return [];
  }
};

export const createReview = async (
  data: Omit<Review, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const ref = await addDoc(collection(db, "reviews"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update product rating (best effort)
  try {
    const productSnap = await getDoc(doc(db, "products", data.productId));
    if (productSnap.exists()) {
      const p = productSnap.data() as Product;
      const newCount = (p.reviewCount || 0) + 1;
      const newRating = ((p.rating || 0) * (p.reviewCount || 0) + data.rating) / newCount;
      await updateDoc(doc(db, "products", data.productId), {
        rating: Math.round(newRating * 10) / 10,
        reviewCount: newCount,
        updatedAt: serverTimestamp(),
      });
    }
  } catch {
    // Non-critical
  }

  return ref.id;
};

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    if (!snap.exists()) return null;
    return { id: snap.id, ...convertTimestamp(snap.data() as Record<string, unknown>) } as SiteSettings;
  } catch {
    return null;
  }
};

export const updateSiteSettings = async (data: Partial<SiteSettings>): Promise<void> => {
  await setDoc(doc(db, "settings", "site"), { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(20)
      )
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Notification[];
  } catch {
    return [];
  }
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await updateDoc(doc(db, "notifications", id), { isRead: true });
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  try {
    const [ordersSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, "orders")),
      getDocs(collection(db, "users")),
    ]);
 
    const orders = ordersSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,                                          // ← THIS WAS MISSING
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Order;
    });
 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
 
    return {
      totalUsers: usersSnap.size,
      totalOrders: orders.length,
      totalRevenue: orders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + (o.total || 0), 0),
      todaySales: orders
        .filter(
          (o) =>
            new Date(o.createdAt) >= today && o.status !== "cancelled"
        )
        .reduce((s, o) => s + (o.total || 0), 0),
      pendingOrders:   orders.filter((o) => o.status === "pending").length,
      cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
      deliveredOrders: orders.filter((o) => o.status === "delivered").length,
      recentOrders: orders
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10),
    };
  } catch (err) {
    console.error("[getDashboardStats] error:", err);
    return {
      totalUsers: 0, totalOrders: 0, totalRevenue: 0, todaySales: 0,
      pendingOrders: 0, cancelledOrders: 0, deliveredOrders: 0,
      recentOrders: [],
    };
  }
};
 
