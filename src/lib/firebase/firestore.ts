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
  getCountFromServer,
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

/**
 * Removes undefined values from an object recursively.
 * Firestore throws: "Unsupported field value: undefined"
 * This sanitizer replaces undefined with null and removes undefined keys.
 */
function sanitize(obj: unknown): unknown {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v !== undefined) {
      result[k] = sanitize(v);
    }
  }
  return result;
}

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
        const slugSnap = await getDocs(
          query(
            collection(db, "categories"),
            where("slug", "==", filters.category),
            limit(1)
          )
        );
        resolvedCategoryId = slugSnap.empty
          ? filters.category
          : slugSnap.docs[0].id;
      } catch {
        resolvedCategoryId = filters.category;
      }
    }

    // ── Step 2: Build Firestore query with at most ONE where clause ────────
    const constraints: QueryConstraint[] = [];

    if (resolvedCategoryId) {
      constraints.push(where("categoryId", "==", resolvedCategoryId));
    }

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
    products = products.filter((p) => p.isActive !== false);

    if (filters.minPrice !== undefined) {
      products = products.filter((p) => (p.basePrice ?? 0) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => (p.basePrice ?? 0) <= filters.maxPrice!);
    }

    if (filters.inStock) {
      products = products.filter((p) => (p.stock ?? 0) > 0);
    }

    if (filters.rating !== undefined) {
      products = products.filter((p) => (p.rating ?? 0) >= filters.rating!);
    }

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
      default:
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

  if (productData.categoryId) {
    try {
      await updateDoc(doc(db, "categories", productData.categoryId), {
        productCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch {
      /* non-critical */
    }
  }

  return ref.id;
};

export const updateProduct = async (
  id: string,
  data: Partial<Product>
): Promise<void> => {
  if (data.categoryId) {
    try {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        const oldCategoryId = (snap.data() as Product).categoryId;
        if (oldCategoryId && oldCategoryId !== data.categoryId) {
          await updateDoc(doc(db, "categories", oldCategoryId), {
            productCount: increment(-1),
            updatedAt: serverTimestamp(),
          }).catch(() => {});
          await updateDoc(doc(db, "categories", data.categoryId), {
            productCount: increment(1),
            updatedAt: serverTimestamp(),
          }).catch(() => {});
        }
      }
    } catch {
      /* non-critical */
    }
  }

  await updateDoc(doc(db, "products", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const snap = await getDoc(doc(db, "products", id));
    if (snap.exists()) {
      const categoryId = (snap.data() as Product).categoryId;
      if (categoryId) {
        await updateDoc(doc(db, "categories", categoryId), {
          productCount: increment(-1),
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }
    }
  } catch {
    /* non-critical */
  }

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
// CART & COUPONS
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

export interface CartRates {
  gstRate?: number;
  shippingCharge?: number;
  freeShippingAbove?: number;
}

const calcTotals = (
  items: CartItem[],
  couponDiscount = 0,
  rates: CartRates = {}
): Pick<Cart, "subtotal" | "discount" | "shippingCharge" | "gst" | "total"> => {
  const { gstRate = 5, shippingCharge: flatShipping = 80, freeShippingAbove = 999 } = rates;
  const subtotal = items.reduce((s, i) => s + i.mrp * i.quantity, 0);
  const itemDiscount = items.reduce((s, i) => s + (i.mrp - i.price) * i.quantity, 0);
  const discount = itemDiscount + couponDiscount;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shippingCharge = afterDiscount >= freeShippingAbove ? 0 : flatShipping;
  const gst = Math.round(afterDiscount * (gstRate / 100));
  const total = afterDiscount + shippingCharge + gst;
  return { subtotal, discount, shippingCharge, gst, total };
};

export const addToCart = async (
  userId: string,
  item: Omit<CartItem, "id">,
  rates?: CartRates
): Promise<void> => {
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
      ...calcTotals([newItem], 0, rates),
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
      ...calcTotals(updatedItems, cartData.couponDiscount || 0, rates),
      updatedAt: serverTimestamp(),
    });
  }
};

export const updateCartItem = async (
  userId: string,
  itemId: string,
  quantity: number,
  rates?: CartRates
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
    ...calcTotals(updatedItems, cartData.couponDiscount || 0, rates),
    updatedAt: serverTimestamp(),
  });
};

export const removeFromCart = async (userId: string, itemId: string, rates?: CartRates): Promise<void> => {
  await updateCartItem(userId, itemId, 0, rates);
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
  couponCode: string,
  rates?: CartRates
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

    const coupon = {
      id: snap.docs[0].id,
      ...convertTimestamp(snap.docs[0].data() as Record<string, unknown>),
    } as Coupon;
    const now = new Date();

    if (coupon.validFrom && new Date(coupon.validFrom) > now)
      return { success: false, discount: 0, message: "This coupon is not active yet" };
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
      ...calcTotals(cartData.items, discount, rates),
      updatedAt: serverTimestamp(),
    });
    return { success: true, discount, message: `Coupon applied! You saved ₹${discount}` };
  } catch {
    return { success: false, discount: 0, message: "Failed to apply coupon" };
  }
};

/**
 * Coupons currently valid for a customer to use — active, within date
 * range, and under their usage limit. Powers "Available Offers" on the
 * cart page and the homepage offer banner.
 */
export const getActiveCoupons = async (): Promise<Coupon[]> => {
  try {
    const snap = await getDocs(
      query(collection(db, "coupons"), where("isActive", "==", true))
    );
    const now = new Date();
    return snap.docs
      .map((d) => ({ id: d.id, ...convertTimestamp(d.data() as Record<string, unknown>) } as Coupon))
      .filter((c) => {
        const validFrom = c.validFrom ? new Date(c.validFrom) : null;
        const validUntil = c.validUntil ? new Date(c.validUntil) : null;
        if (validFrom && validFrom > now) return false;
        if (validUntil && validUntil < now) return false;
        if (c.usageLimit && c.usageCount >= c.usageLimit) return false;
        return true;
      })
      .sort((a, b) => {
        if (!a.validUntil) return 1;
        if (!b.validUntil) return -1;
        return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
      });
  } catch (err) {
    console.error("[getActiveCoupons] error:", err);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = async (
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const clean = sanitize(orderData) as typeof orderData;

  const orderRef = doc(collection(db, "orders"));
  await setDoc(orderRef, {
    ...clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await updateDoc(doc(db, "users", orderData.userId), {
      orderCount: increment(1),
      totalSpent: increment(orderData.total ?? 0),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-critical — user stats may lag slightly
  }

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
    throw err;
  }
};

/**
 * Customer self-service cancellation. Deliberately narrower than
 * updateOrderStatus: only works while the order is still "pending",
 * matching what firestore.rules allows a non-admin owner to do.
 */
export const cancelOrderByCustomer = async (
  orderId: string,
  reason?: string
): Promise<void> => {
  const snap = await getDoc(doc(db, "orders", orderId));
  if (!snap.exists()) throw new Error("Order not found");

  const existing = snap.data() as Order;
  if (existing.status !== "pending") {
    throw new Error("Only pending orders can be cancelled");
  }

  const finalReason = reason?.trim() || "Cancelled by customer";
  const timelineEntry: Record<string, unknown> = {
    status: "cancelled",
    timestamp: new Date().toISOString(),
    note: finalReason,
    updatedBy: "customer",
  };

  await updateDoc(doc(db, "orders", orderId), {
    status: "cancelled",
    cancelReason: finalReason,
    timeline: [...(existing.timeline || []), timelineEntry],
    updatedAt: serverTimestamp(),
  });
};

/**
 * Customer self-service refund/return request. Only allowed from
 * "delivered", and only within 7 days of the delivered timeline entry —
 * matching what firestore.rules allows and what the Return Policy page
 * promises. Admin then reviews it and sets status to "refunded" (approved)
 * or back to "delivered" (declined) from the Admin Orders panel.
 */
export const requestOrderReturn = async (
  orderId: string,
  reason: string
): Promise<void> => {
  const snap = await getDoc(doc(db, "orders", orderId));
  if (!snap.exists()) throw new Error("Order not found");

  const existing = snap.data() as Order;
  if (existing.status !== "delivered") {
    throw new Error("Only delivered orders can have a return/refund requested");
  }

  const deliveredEntry = existing.timeline?.find((t) => t.status === "delivered");
  let deliveredAt: Date;
  if (deliveredEntry?.timestamp) {
    deliveredAt = new Date(deliveredEntry.timestamp as unknown as string);
  } else if (existing.updatedAt instanceof Timestamp) {
    deliveredAt = existing.updatedAt.toDate();
  } else {
    deliveredAt = new Date();
  }

  const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDelivery > 7) {
    throw new Error("The 7-day return window for this order has passed");
  }

  const timelineEntry: Record<string, unknown> = {
    status: "return_requested",
    timestamp: new Date().toISOString(),
    note: reason,
    updatedBy: "customer",
  };

  await updateDoc(doc(db, "orders", orderId), {
    status: "return_requested",
    refundReason: reason,
    timeline: [...(existing.timeline || []), timelineEntry],
    updatedAt: serverTimestamp(),
  });
};

export const trackOrder = async (
  orderNumber: string,
  phone: string
): Promise<Order | null> => {
  try {
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

/**
 * Get ALL banners for the admin panel — no isActive filter, so newly
 * created or currently-inactive banners are still visible to manage.
 */
export const getAllBannersAdmin = async (): Promise<Banner[]> => {
  try {
    const snap = await getDocs(
      query(collection(db, "banners"), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamp(d.data() as Record<string, unknown>),
    })) as Banner[];
  } catch (err) {
    console.error("[getAllBannersAdmin] failed:", err);
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
  return ref.id;
};

export const recalculateProductRating = async (productId: string): Promise<void> => {
  try {
    const snap = await getDocs(
      query(collection(db, "reviews"), where("productId", "==", productId), where("isApproved", "==", true))
    );
    const approved = snap.docs.map((d) => d.data() as Review);
    const reviewCount = approved.length;
    const rating =
      reviewCount > 0 ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10 : 0;
    await updateDoc(doc(db, "products", productId), { rating, reviewCount, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[recalculateProductRating] error:", err);
  }
};

export const updateReviewApproval = async (
  reviewId: string,
  productId: string,
  isApproved: boolean
): Promise<void> => {
  await updateDoc(doc(db, "reviews", reviewId), { isApproved, updatedAt: serverTimestamp() });
  await recalculateProductRating(productId);
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
    const [ordersSnap, usersSnap, productsCountSnap] = await Promise.all([
      getDocs(collection(db, "orders")),
      getDocs(collection(db, "users")),
      getCountFromServer(collection(db, "products")),
    ]);

    const orders = ordersSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
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
      totalProducts: productsCountSnap.data().count,
      totalRevenue: orders
        .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
        .reduce((s, o) => s + (o.total || 0), 0),
      todaySales: orders
        .filter(
          (o) =>
            new Date(o.createdAt) >= today && o.status !== "cancelled" && o.status !== "refunded"
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
      totalUsers: 0, totalOrders: 0, totalProducts: 0, totalRevenue: 0, todaySales: 0,
      pendingOrders: 0, cancelledOrders: 0, deliveredOrders: 0,
      recentOrders: [],
    };
  }
};
