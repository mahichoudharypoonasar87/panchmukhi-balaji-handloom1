import { z } from "zod";

// =============================================
// AUTH SCHEMAS
// =============================================
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name too long"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

// =============================================
// PRODUCT SCHEMAS
// =============================================
export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  mrp: z.number().min(0, "MRP must be positive"),
  stock: z.number().min(0, "Stock must be positive"),
  sku: z.string().min(1, "SKU is required"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200, "Name too long"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().min(10, "Short description required").max(300),
  categoryId: z.string().min(1, "Category is required"),
  categoryName: z.string().min(1, "Category name is required"),
  basePrice: z.number().min(1, "Price is required"),
  baseMrp: z.number().min(1, "MRP is required"),
  stock: z.number().min(0, "Stock must be positive"),
  sku: z.string().min(1, "SKU is required"),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  isActive: z.boolean().default(true),
  fabricType: z.string().optional(),
  occasion: z.string().optional(),
  washCare: z.string().optional(),
  material: z.string().optional(),
  origin: z.string().default("Poonasar, Rajasthan, India"),
  weight: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// =============================================
// CHECKOUT SCHEMAS
// =============================================
export const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.string().min(5, "Please enter your full address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().default("India"),
  paymentMethod: z.enum(["cod", "whatsapp"]),
  orderNotes: z.string().optional(),
});

// =============================================
// ADDRESS SCHEMA
// =============================================
export const addressSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid pincode"),
  country: z.string().default("India"),
  type: z.enum(["home", "office", "other"]).default("home"),
  isDefault: z.boolean().default(false),
});

// =============================================
// REVIEW SCHEMA
// =============================================
export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().min(3, "Title is required").max(100),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000),
});

// =============================================
// COUPON SCHEMA
// =============================================
export const couponSchema = z.object({
  code: z.string().min(3, "Coupon code required").max(20),
  description: z.string().min(1, "Description required"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(1, "Discount value required"),
  minOrderValue: z.number().min(0),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().optional(),
  userLimit: z.number().default(1),
  isActive: z.boolean().default(true),
  validFrom: z.string(),
  validUntil: z.string(),
});

// =============================================
// CATEGORY SCHEMA
// =============================================
export const categorySchema = z.object({
  name: z.string().min(2, "Category name required").max(100),
  slug: z.string().min(2, "Slug required"),
  description: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// =============================================
// BANNER SCHEMA
// =============================================
export const bannerSchema = z.object({
  title: z.string().min(2, "Title required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  link: z.string().optional(),
  buttonText: z.string().optional(),
  type: z.enum(["hero", "offer", "category", "popup"]),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

// =============================================
// TRACK ORDER SCHEMA
// =============================================
export const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid mobile number"),
});

// =============================================
// CONTACT SCHEMA
// =============================================
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
      message: "Enter a valid 10-digit mobile number",
    }),
  subject: z.string().min(3, "Please add a short subject"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message is too long"),
});

// =============================================
// TYPES FROM SCHEMAS
// =============================================
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type BannerFormData = z.infer<typeof bannerSchema>;
export type TrackOrderFormData = z.infer<typeof trackOrderSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
