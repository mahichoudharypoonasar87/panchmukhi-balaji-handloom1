// ============================================
// PRODUCT TYPES
// ============================================

export interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  colorHex?: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  images: ProductImage[];
  variants: ProductVariant[];
  basePrice: number;
  baseMrp: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  fabricType: string;
  occasion: string;
  washCare: string;
  material: string;
  origin: string;
  weight: string;
  dimensions?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  rating?: number;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular" | "rating";
  inStock?: boolean;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  productCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// USER TYPES
// ============================================

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type: "home" | "office" | "other";
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  addresses: UserAddress[];
  wishlist: string[];
  orderCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId?: string;
  size?: string;
  color?: string;
  colorHex?: string;
  price: number;
  mrp: number;
  quantity: number;
  stock: number;
  sku: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  couponCode?: string;
  couponDiscount?: number;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  gst: number;
  total: number;
  updatedAt: Date;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "return_requested"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "cod" | "whatsapp" | "online";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  size?: string;
  color?: string;
  price: number;
  mrp: number;
  quantity: number;
  total: number;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount?: number;
  shippingCharge: number;
  gst: number;
  total: number;
  orderNotes?: string;
  trackingNumber?: string;
  timeline: OrderTimeline[];
  cancelReason?: string;
  refundReason?: string;
  isReviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  likes: number;
  isVerified: boolean;
  isApproved: boolean;
  reply?: {
    text: string;
    respondedAt: Date;
    respondedBy: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COUPON TYPES
// ============================================

export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userLimit: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  applicableCategories?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// BANNER TYPES
// ============================================

export type BannerType = "hero" | "offer" | "category" | "popup";

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  type: BannerType;
  order: number;
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface SiteSettings {
  id: string;
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
  logo?: string;
  favicon?: string;
  currency: string;
  currencySymbol: string;
  gstRate: number;
  shippingCharge: number;
  freeShippingAbove: number;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage?: string;
  };
  maintenance: boolean;
  updatedAt: Date;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | "order"
  | "payment"
  | "delivery"
  | "offer"
  | "review"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  image?: string;
  isRead: boolean;
  createdAt: Date;
}

// ============================================
// WISHLIST TYPES
// ============================================

export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  todaySales: number;
  pendingOrders: number;
  cancelledOrders: number;
  deliveredOrders: number;
  lowStockProducts: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  recentOrders: Order[];
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  lastDoc?: unknown;
}
