import { Metadata } from "next";
import { FileText } from "lucide-react";
import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the terms and conditions that apply when you shop with Panchmukhi Balaji Handloom.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "1. Acceptance of Terms",
    paragraphs: [
      `These Terms & Conditions ("Terms") govern your use of the Panchmukhi Balaji Handloom website and your purchase of products from us. By browsing the Site or placing an order, you agree to be bound by these Terms.`,
    ],
  },
  {
    title: "2. Account Registration",
    items: [
      "You must provide accurate and complete information when creating an account.",
      "You are responsible for maintaining the confidentiality of your login credentials and all activity under your account.",
      "You must be at least 18 years old, or have the involvement of a parent/guardian, to place an order.",
    ],
  },
  {
    title: "3. Products, Pricing & Availability",
    items: [
      "All prices are listed in Indian Rupees (₹) and are inclusive of applicable GST, unless stated otherwise.",
      "Product colours may vary slightly from the screen due to handloom weaving and photography differences — a natural feature of handmade textiles, not a defect.",
      "We reserve the right to modify prices, descriptions and availability at any time without prior notice.",
      "If a product is unavailable after you order it, we will offer a replacement, store credit, or full refund.",
    ],
  },
  {
    title: "4. Orders & Payment",
    items: [
      "Orders can be placed directly on the Site (Cash on Delivery) or via WhatsApp order.",
      "An order is confirmed only once you receive an order confirmation with an order number.",
      "For Cash on Delivery orders, payment is collected at the time of delivery.",
      "We reserve the right to cancel any order suspected to be fraudulent.",
    ],
  },
  {
    title: "5. Shipping & Delivery",
    items: [
      "Shipping is free on orders above ₹999; a standard shipping charge applies below this.",
      "Standard delivery typically takes 5–7 business days, depending on location.",
      "Delivery timelines are estimates and may be affected by courier delays or circumstances beyond our control.",
    ],
  },
  {
    title: "6. Cancellations, Returns & Refunds",
    paragraphs: [
      `Orders can be cancelled free of charge while still in "Pending" status, from your Order History page. Once packed or shipped, an order cannot be cancelled but may be eligible for a return — see our Return Policy for full details.`,
    ],
  },
  {
    title: "7. Intellectual Property",
    paragraphs: [
      `All content on the Site — including our name, logo, product photography and descriptions — is our property or that of our licensors. You may not reproduce or use this content commercially without our written consent.`,
    ],
  },
  {
    title: "8. User Conduct",
    items: [
      "Do not use the Site for any unlawful purpose or in a way that could damage or impair it.",
      "Do not post fraudulent, misleading, or abusive reviews.",
      "Do not attempt unauthorised access to any account or our systems.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    paragraphs: [
      `To the maximum extent permitted by law, we are not liable for indirect or consequential damages arising from use of the Site. Our total liability for any order shall not exceed the amount you paid for it.`,
    ],
  },
  {
    title: "10. Governing Law & Jurisdiction",
    paragraphs: [
      `These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of the courts of Rajasthan, India.`,
    ],
  },
  {
    title: "11. Changes to These Terms",
    paragraphs: [
      `We may revise these Terms from time to time; updates apply to orders placed after the revised date shown on this page.`,
    ],
  },
  {
    title: "12. Contact Us",
    paragraphs: [`Questions? Reach us via email or WhatsApp in the Site footer.`],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      icon={FileText}
      title="Terms & Conditions"
      subtitle="The terms that apply when you browse, shop and order with us."
      lastUpdated="17 July 2026"
      sections={SECTIONS}
    />
  );
}
