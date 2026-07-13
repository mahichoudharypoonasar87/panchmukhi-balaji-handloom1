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
  writeBatch,
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

// =============================================
// GENERIC HELPERS
// =============================================
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

// =============================================
// PRODUCTS
// =============================================
export const getProducts = async (
  filters: ProductFilters = {},
  pageSize = 12,
  lastDoc?: DocumentSnapshot
): Promise<PaginatedResponse<Product>> => {
  const constraints: QueryConstraint[] = [where("isActive", "==", true)];

  if (filters.category) {
    constraints.push(where("categoryId", "==", filters.category));
  }
  if (filters.minPrice !== undefined) {
    constraints.push(where("basePrice", ">=", filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    constraints.push(where("basePrice", "<=", filters.maxPrice));
  }
  if (filters.inStock) {
    constraints.push(where("stock", ">", 0));
  }

  // Sorting
  switch (filters.sortBy) {
    case "price_asc":
      constraints.push(orderBy("basePrice", "asc"));
      break;
    case "price_desc":
      constraints.push(orderBy("basePrice", "desc"));
      break;
    case "popular":
      constraints.push(orderBy("reviewCount", "desc"));
      break;
    case "rating":
      constraints.push(orderBy("rating", "desc"));
      break;
    default:
      constraints.push(orderBy("createdAt", "desc"));
  }

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(pageSize + 1));

  const q = query(collection(db, "products"), ...constraints);
  const snapshot = await getDocs(q);

  const hasMore = snapshot.docs.length > pageSize;
  const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

  const products = docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Product[];

  return {
    data: products,
    total: products.length,
    page: 1,
    pageSize,
    hasMore,
    lastDoc: docs[docs.length - 1],
  };
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamp(docSnap.data() as Record<string, unknown>),
  } as Product;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  } as Product;
};

export const getFeaturedProducts = async (count = 8): Promise<Product[]> => {
  const q = query(
    collection(db, "products"),
    where("isActive", "==", true),
    where("isFeatured", "==", true),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Product[];
};

export const getTrendingProducts = async (count = 8): Promise<Product[]> => {
  const q = query(
    collection(db, "products"),
    where("isActive", "==", true),
    where("isTrending", "==", true),
    orderBy("reviewCount", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Product[];
};

export const getBestSellers = async (count = 8): Promise<Product[]> => {
  const q = query(
    collection(db, "products"),
    where("isActive", "==", true),
    where("isBestSeller", "==", true),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Product[];
};

export const getRelatedProducts = async (
  categoryId: string,
  excludeId: string,
  count = 4
): Promise<Product[]> => {
  const q = query(
    collection(db, "products"),
    where("isActive", "==", true),
    where("categoryId", "==", categoryId),
    limit(count + 1)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data() as Record<string, unknown>),
    }))
    .filter((p) => p.id !== excludeId)
    .slice(0, count) as Product[];
};

export const createProduct = async (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const docRef = await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProduct = async (
  id: string,
  data: Partial<Product>
): Promise<void> => {
  await updateDoc(doc(db, "products", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "products", id));
};

// =============================================
// CATEGORIES
// =============================================
export const getCategories = async (): Promise<Category[]> => {
  const q = query(
    collection(db, "categories"),
    where("isActive", "==", true),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Category[];
};

export const createCategory = async (
  data: Omit<Category, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const docRef = await addDoc(collection(db, "categories"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateCategory = async (
  id: string,
  data: Partial<Category>
): Promise<void> => {
  await updateDoc(doc(db, "categories", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "categories", id));
};

// =============================================
// CART (REALTIME)
// =============================================
export const getCart = async (userId: string): Promise<Cart | null> => {
  const docRef = doc(db, "carts", userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamp(docSnap.data() as Record<string, unknown>),
  } as Cart;
};

export const subscribeToCart = (
  userId: string,
  callback: (cart: Cart | null) => void
) => {
  const docRef = doc(db, "carts", userId);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback({
        id: snap.id,
        ...convertTimestamp(snap.data() as Record<string, unknown>),
      } as Cart);
    } else {
      callback(null);
    }
  });
};

const calculateCartTotals = (
  items: CartItem[],
  couponDiscount = 0
): Pick<Cart, "subtotal" | "discount" | "shippingCharge" | "gst" | "total"> => {
  const subtotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const discount =
    items.reduce((sum, item) => sum + (item.mrp - item.price) * item.quantity, 0) +
    couponDiscount;
  const shippingCharge =
    subtotal - discount >= 999 ? 0 : 80;
  const afterDiscount = subtotal - discount;
  const gst = Math.round(afterDiscount * 0.05); // 5% GST on textiles
  const total = afterDiscount + shippingCharge + gst;

  return {
    subtotal,
    discount,
    shippingCharge,
    gst,
    total: Math.max(0, total),
  };
};

export const addToCart = async (
  userId: string,
  item: Omit<CartItem, "id">
): Promise<void> => {
  const cartRef = doc(db, "carts", userId);
  const cartSnap = await getDoc(cartRef);

  const newItem: CartItem = {
    ...item,
    id: `${item.productId}_${item.variantId || "default"}_${Date.now()}`,
  };

  if (!cartSnap.exists()) {
    const totals = calculateCartTotals([newItem]);
    await setDoc(cartRef, {
      userId,
      items: [newItem],
      couponDiscount: 0,
      ...totals,
      updatedAt: serverTimestamp(),
    });
  } else {
    const cartData = cartSnap.data() as Cart;
    const existingIndex = cartData.items.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId
    );

    let updatedItems: CartItem[];
    if (existingIndex > -1) {
      updatedItems = cartData.items.map((i, idx) =>
        idx === existingIndex
          ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
          : i
      );
    } else {
      updatedItems = [...cartData.items, newItem];
    }

    const totals = calculateCartTotals(updatedItems, cartData.couponDiscount || 0);
    await updateDoc(cartRef, {
      items: updatedItems,
      ...totals,
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
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists()) return;

  const cartData = cartSnap.data() as Cart;
  let updatedItems: CartItem[];

  if (quantity <= 0) {
    updatedItems = cartData.items.filter((i) => i.id !== itemId);
  } else {
    updatedItems = cartData.items.map((i) =>
      i.id === itemId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
    );
  }

  const totals = calculateCartTotals(updatedItems, cartData.couponDiscount || 0);
  await updateDoc(cartRef, {
    items: updatedItems,
    ...totals,
    updatedAt: serverTimestamp(),
  });
};

export const removeFromCart = async (
  userId: string,
  itemId: string
): Promise<void> => {
  await updateCartItem(userId, itemId, 0);
};

export const clearCart = async (userId: string): Promise<void> => {
  const cartRef = doc(db, "carts", userId);
  await setDoc(cartRef, {
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
  const couponQuery = query(
    collection(db, "coupons"),
    where("code", "==", couponCode.toUpperCase()),
    where("isActive", "==", true),
    limit(1)
  );
  const couponSnap = await getDocs(couponQuery);

  if (couponSnap.empty) {
    return { success: false, discount: 0, message: "Invalid coupon code" };
  }

  const coupon = { id: couponSnap.docs[0].id, ...couponSnap.docs[0].data() } as Coupon;
  const now = new Date();

  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { success: false, discount: 0, message: "Coupon has expired" };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { success: false, discount: 0, message: "Coupon usage limit reached" };
  }

  const cartRef = doc(db, "carts", userId);
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists()) {
    return { success: false, discount: 0, message: "Cart is empty" };
  }

  const cartData = cartSnap.data() as Cart;
  if (cartData.subtotal < coupon.minOrderValue) {
    return {
      success: false,
      discount: 0,
      message: `Minimum order value ₹${coupon.minOrderValue} required`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round((cartData.subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  const totals = calculateCartTotals(cartData.items, discount);
  await updateDoc(cartRef, {
    couponCode: coupon.code,
    couponDiscount: discount,
    ...totals,
    updatedAt: serverTimestamp(),
  });

  return { success: true, discount, message: `Coupon applied! You saved ₹${discount}` };
};

// =============================================
// ORDERS
// =============================================
export const createOrder = async (
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const batch = writeBatch(db);

  const orderRef = doc(collection(db, "orders"));
  batch.set(orderRef, {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update product stock
  for (const item of orderData.items) {
    const productRef = doc(db, "products", item.productId);
    batch.update(productRef, {
      stock: increment(-item.quantity),
    });
  }

  // Update user stats
  const userRef = doc(db, "users", orderData.userId);
  batch.update(userRef, {
    orderCount: increment(1),
    totalSpent: increment(orderData.total),
    updatedAt: serverTimestamp(),
  });

  // Update coupon usage
  if (orderData.couponCode) {
    const couponQuery = query(
      collection(db, "coupons"),
      where("code", "==", orderData.couponCode),
      limit(1)
    );
    const couponSnap = await getDocs(couponQuery);
    if (!couponSnap.empty) {
      batch.update(couponSnap.docs[0].ref, {
        usageCount: increment(1),
      });
    }
  }

  await batch.commit();
  return orderRef.id;
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const docRef = doc(db, "orders", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamp(docSnap.data() as Record<string, unknown>),
  } as Order;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Order[];
};

export const getAllOrders = async (pageSize = 20): Promise<Order[]> => {
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Order[];
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  note?: string,
  updatedBy?: string
): Promise<void> => {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) return;

  const orderData = orderSnap.data() as Order;
  const timeline = orderData.timeline || [];
  timeline.push({
    status: status as Order["status"],
    timestamp: new Date(),
    note,
    updatedBy,
  });

  await updateDoc(orderRef, {
    status,
    timeline,
    updatedAt: serverTimestamp(),
  });
};

export const trackOrder = async (
  orderNumber: string,
  phone: string
): Promise<Order | null> => {
  const q = query(
    collection(db, "orders"),
    where("orderNumber", "==", orderNumber),
    where("customerPhone", "==", phone),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return {
    id: snapshot.docs[0].id,
    ...convertTimestamp(snapshot.docs[0].data() as Record<string, unknown>),
  } as Order;
};

// =============================================
// WISHLIST
// =============================================
export const addToWishlist = async (
  userId: string,
  productId: string
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    wishlist: arrayUnion(productId),
    updatedAt: serverTimestamp(),
  });
};

export const removeFromWishlist = async (
  userId: string,
  productId: string
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    wishlist: arrayRemove(productId),
    updatedAt: serverTimestamp(),
  });
};

// =============================================
// BANNERS
// =============================================
export const getBanners = async (type?: string): Promise<Banner[]> => {
  let q;
  if (type) {
    q = query(
      collection(db, "banners"),
      where("isActive", "==", true),
      where("type", "==", type),
      orderBy("order", "asc")
    );
  } else {
    q = query(
      collection(db, "banners"),
      where("isActive", "==", true),
      orderBy("order", "asc")
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Banner[];
};

export const createBanner = async (
  data: Omit<Banner, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const docRef = await addDoc(collection(db, "banners"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateBanner = async (
  id: string,
  data: Partial<Banner>
): Promise<void> => {
  await updateDoc(doc(db, "banners", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteBanner = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "banners", id));
};

// =============================================
// REVIEWS
// =============================================
export const getProductReviews = async (
  productId: string
): Promise<Review[]> => {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    where("isApproved", "==", true),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Review[];
};

export const createReview = async (
  data: Omit<Review, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const batch = writeBatch(db);

  const reviewRef = doc(collection(db, "reviews"));
  batch.set(reviewRef, {
    ...data,
    likes: 0,
    isApproved: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update product rating
  const productRef = doc(db, "products", data.productId);
  const productSnap = await getDoc(productRef);
  if (productSnap.exists()) {
    const productData = productSnap.data() as Product;
    const newCount = productData.reviewCount + 1;
    const newRating =
      (productData.rating * productData.reviewCount + data.rating) / newCount;
    batch.update(productRef, {
      rating: Math.round(newRating * 10) / 10,
      reviewCount: newCount,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return reviewRef.id;
};

// =============================================
// SETTINGS
// =============================================
export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  const docRef = doc(db, "settings", "site");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamp(docSnap.data() as Record<string, unknown>),
  } as SiteSettings;
};

export const updateSiteSettings = async (
  data: Partial<SiteSettings>
): Promise<void> => {
  const docRef = doc(db, "settings", "site");
  await setDoc(
    docRef,
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

// =============================================
// NOTIFICATIONS
// =============================================
export const getUserNotifications = async (
  userId: string
): Promise<Notification[]> => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Notification[];
};

export const markNotificationRead = async (
  notificationId: string
): Promise<void> => {
  await updateDoc(doc(db, "notifications", notificationId), {
    isRead: true,
  });
};

// =============================================
// DASHBOARD ANALYTICS
// =============================================
export const getDashboardStats = async () => {
  const ordersSnap = await getDocs(collection(db, "orders"));
  const usersSnap = await getDocs(collection(db, "users"));

  const orders = ordersSnap.docs.map((d) => d.data() as Order);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    totalUsers: usersSnap.size,
    totalOrders: orders.length,
    totalRevenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0),
    todaySales: orders
      .filter(
        (o) =>
          o.createdAt &&
          new Date(o.createdAt) >= today &&
          o.status !== "cancelled"
      )
      .reduce((sum, o) => sum + (o.total || 0), 0),
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
    recentOrders: orders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5),
  };

  return stats;
};
