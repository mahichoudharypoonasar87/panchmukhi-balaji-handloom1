import { Metadata } from "next";
import { RefreshCw } from "lucide-react";
import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Return Policy",
  description:
    "Learn about returns, cancellations, exchanges and refunds at Panchmukhi Balaji Handloom.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "1. Overview",
    paragraphs: [
      `If something isn't right, you can request a return within 7 days of delivery, subject to the conditions below.`,
    ],
  },
  {
    title: "2. Return Eligibility",
    intro: "To be eligible for a return, an item must be:",
    items: [
      "Requested within 7 days of the delivery date.",
      "Unused, unwashed, and in its original condition, with all original tags attached.",
      "Returned in its original packaging, along with the invoice/order confirmation.",
    ],
  },
  {
    title: "3. Items That Cannot Be Returned",
    items: [
      "Products that have been worn, washed, altered, or damaged after delivery.",
      "Items purchased on final sale or clearance, where marked non-returnable.",
      "Custom-made, personalised, or made-to-order pieces.",
    ],
  },
  {
    title: "4. How to Request a Return",
    items: [
      "Go to My Orders in your Profile and locate the order, or message us on WhatsApp with your order number.",
      "Share clear photos of the product and a brief reason for the return.",
      "We'll confirm eligibility and share pickup/drop-off instructions within 1–2 business days.",
    ],
  },
  {
    title: "5. Refund Process & Timeline",
    paragraphs: [
      `Once the returned item is received and inspected, we'll notify you of the approval status. Approved refunds are processed via bank transfer or UPI within 5–7 business days. Shipping charges are non-refundable unless the return is due to our error.`,
    ],
  },
  {
    title: "6. Order Cancellation",
    paragraphs: [
      `You can cancel an order free of charge while it's still "Pending" — open it from My Orders and select Cancel. Once confirmed and packed/shipped, it can no longer be cancelled, but may be returned after delivery under the policy above.`,
    ],
  },
  {
    title: "7. Damaged, Defective, or Incorrect Items",
    paragraphs: [
      `Received a damaged, defective, or wrong item? Contact us within 48 hours of delivery with photos of the product and packaging. We'll arrange a free replacement or full refund, including shipping — no questions asked.`,
    ],
  },
  {
    title: "8. Exchanges",
    paragraphs: [
      `We currently don't offer direct exchanges. Return the original item under this policy and place a new order for the item you'd prefer.`,
    ],
  },
  {
    title: "9. Contact Us",
    paragraphs: [`For any return, cancellation, or refund query, reach us on WhatsApp or email in the Site footer.`],
  },
];

export default function ReturnPolicyPage() {
  return (
    <LegalPageLayout
      icon={RefreshCw}
      title="Return Policy"
      subtitle="Simple, fair returns — here's everything you need to know."
      lastUpdated="17 July 2026"
      sections={SECTIONS}
    />
  );
}
