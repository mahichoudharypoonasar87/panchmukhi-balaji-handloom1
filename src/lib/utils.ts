import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// =============================================
// TAILWIND CLASS MERGE
// =============================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================
// CURRENCY FORMAT
// =============================================
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// =============================================
// DISCOUNT CALCULATION
// =============================================
export const calculateDiscount = (mrp: number, price: number): number => {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

// =============================================
// SLUG GENERATOR
// =============================================
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// =============================================
// ORDER NUMBER GENERATOR
// =============================================
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `PBH${timestamp}${random}`;
};

// =============================================
// FORMAT DATE
// =============================================
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
};

export const timeAgo = (date: Date | string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

// =============================================
// WHATSAPP ORDER
// =============================================
export const generateWhatsAppMessage = (order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{
    productName: string;
    size?: string;
    color?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  gst: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}): string => {
  const itemsList = order.items
    .map(
      (item, i) =>
        `${i + 1}. ${item.productName}${item.size ? ` (Size: ${item.size})` : ""}${
          item.color ? ` (Color: ${item.color})` : ""
        }\n   Qty: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}`
    )
    .join("\n");

  const message = `🛍️ *NEW ORDER - Panchmukhi Balaji Handloom*
━━━━━━━━━━━━━━━━━━━
📋 *Order #:* ${order.orderNumber}
━━━━━━━━━━━━━━━━━━━

👤 *Customer Details*
Name: ${order.customerName}
Phone: ${order.customerPhone}

📍 *Delivery Address*
${order.address}
${order.city}, ${order.state} - ${order.pincode}

━━━━━━━━━━━━━━━━━━━
🛒 *Ordered Items*
${itemsList}
━━━━━━━━━━━━━━━━━━━

💰 *Price Summary*
Subtotal: ₹${order.subtotal}
${order.discount > 0 ? `Discount: -₹${order.discount}\n` : ""}GST (5%): ₹${order.gst}
Shipping: ${order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`}
*TOTAL: ₹${order.total}*

💳 *Payment:* ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
${order.notes ? `\n📝 *Notes:* ${order.notes}` : ""}

━━━━━━━━━━━━━━━━━━━
_Panchmukhi Balaji Handloom_
_Panchori Road, Poonasar, Rajasthan_`;

  return encodeURIComponent(message);
};

export const openWhatsApp = (
  phoneNumber: string,
  message: string
): void => {
  const url = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(url, "_blank");
};

// =============================================
// TRUNCATE TEXT
// =============================================
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
};

// =============================================
// DEBOUNCE
// =============================================
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// =============================================
// IMAGE COMPRESSION CHECK
// =============================================
export const getImagePlaceholder = (
  width: number,
  height: number
): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#2D1B00"/><text x="50%" y="50%" text-anchor="middle" fill="#D4AF37" font-size="14" font-family="sans-serif" dy=".3em">Loading...</text></svg>`
  ).toString("base64")}`;
};

// =============================================
// ORDER STATUS HELPERS
// =============================================
export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500" },
  { value: "packed", label: "Packed", color: "bg-indigo-500" },
  { value: "shipped", label: "Shipped", color: "bg-purple-500" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "bg-orange-500" },
  { value: "delivered", label: "Delivered", color: "bg-green-500" },
  { value: "return_requested", label: "Return Requested", color: "bg-pink-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  { value: "refunded", label: "Refunded", color: "bg-gray-500" },
];

export const getOrderStatusColor = (status: string): string => {
  return ORDER_STATUSES.find((s) => s.value === status)?.color || "bg-gray-500";
};

export const getOrderStatusLabel = (status: string): string => {
  return ORDER_STATUSES.find((s) => s.value === status)?.label || status;
};

// =============================================
// VALIDATION HELPERS
// =============================================
export const isValidPhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));
};

export const isValidPincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
