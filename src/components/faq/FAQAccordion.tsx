"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Package, Truck, CreditCard, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  icon: typeof Package;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    title: "Orders & Account",
    icon: Package,
    items: [
      {
        q: "Do I need an account to shop?",
        a: "You can browse the full collection without an account, but you'll need to sign in to add items to your cart and checkout. Creating an account also lets you save addresses, track orders and build a wishlist.",
      },
      {
        q: "How do I place an order?",
        a: "Browse the Shop, add products to your cart, and head to Checkout — pay via Cash on Delivery or finalise your order on WhatsApp. You can also message us directly on WhatsApp from any product page to order that way.",
      },
      {
        q: "Can I cancel an order after placing it?",
        a: 'Yes, as long as it\'s still marked "Pending". Go to My Orders, open the order and select Cancel. Once it\'s been confirmed and packed, it can no longer be cancelled but may be eligible for a return after delivery.',
      },
      {
        q: "How do I track my order?",
        a: "Use the Track Order page and enter your order number along with the phone number used at checkout to see live status.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    icon: Truck,
    items: [
      {
        q: "Do you ship across India?",
        a: "Yes, we deliver to addresses across all states and union territories in India.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery typically takes 5–7 business days from when your order is confirmed, depending on your location.",
      },
      {
        q: "Is shipping free?",
        a: "Free shipping applies automatically once your cart total crosses our free-shipping threshold — you'll see this reflected live in your cart summary. Below that, a flat shipping charge applies.",
      },
    ],
  },
  {
    title: "Payments",
    icon: CreditCard,
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We currently offer Cash on Delivery (pay when your order arrives) and orders placed via WhatsApp, where payment details are confirmed directly with our team.",
      },
      {
        q: "Do your prices include tax?",
        a: "Yes — GST is calculated automatically and shown as a separate line in your cart and order summary, so the total you see at checkout is what you pay.",
      },
    ],
  },
  {
    title: "Returns, Exchanges & Refunds",
    icon: RefreshCw,
    items: [
      {
        q: "What is your return window?",
        a: "You can request a return within 7 days of delivery, as long as the item is unused, unwashed and in its original condition with tags attached. Full details are on our Return Policy page.",
      },
      {
        q: "How do I request a return?",
        a: "Open the order from My Orders or message us on WhatsApp with your order number and a couple of photos of the product — we'll confirm eligibility and share pickup instructions.",
      },
      {
        q: "Do you offer direct exchanges?",
        a: "Not directly. Return the original item under our return policy and place a fresh order for the size or design you'd prefer.",
      },
      {
        q: "When will I receive my refund?",
        a: "Once we've received and inspected the returned item, approved refunds are processed within 5–7 business days via bank transfer or UPI.",
      },
    ],
  },
  {
    title: "Products & Care",
    icon: Sparkles,
    items: [
      {
        q: "Are your products genuinely handloom?",
        a: "Yes. Every piece is hand-woven by artisan families in Poonasar, Rajasthan, using traditional techniques passed down through generations.",
      },
      {
        q: "Will the colour match exactly what I see on screen?",
        a: "We photograph every product carefully, but slight colour variation is possible due to screen settings and the natural, handwoven nature of the fabric — this is a feature of handloom textiles, not a defect.",
      },
      {
        q: "How should I care for my handloom saree?",
        a: "In general: hand wash in cold water, avoid bleach, dry in shade, and iron on low heat. Silk pieces are best dry cleaned. Each product page also lists specific wash & care instructions under Product Details.",
      },
    ],
  },
];

export default function FAQAccordion() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {FAQ_CATEGORIES.map((category, ci) => (
        <div key={category.title}>
          <div className="flex items-center gap-2 mb-3">
            <category.icon size={16} className="text-gold-500" />
            <h2 className="font-display text-lg font-bold text-[var(--foreground)]">
              {category.title}
            </h2>
          </div>

          <div className="space-y-2">
            {category.items.map((item, ii) => {
              const key = `${ci}-${ii}`;
              const isOpen = openKey === key;
              return (
                <div
                  key={key}
                  className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card-bg)]"
                >
                  <button
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-[var(--foreground)] font-utility font-medium text-sm hover:bg-white/5 transition-colors"
                  >
                    {item.q}
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-[var(--muted)] flex-shrink-0 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-[var(--muted)] text-sm font-body leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
