import { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Panchmukhi Balaji Handloom collects, uses and protects your personal information.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "1. Introduction",
    paragraphs: [
      `Panchmukhi Balaji Handloom ("we", "us", "our") operates this website (the "Site"). This Privacy Policy explains what personal information we collect, how we use it, and the choices you have. By using the Site, placing an order, or creating an account, you agree to the practices described here.`,
    ],
  },
  {
    title: "2. Information We Collect",
    intro: "We collect the following categories of information:",
    items: [
      "Account details — name, email address, phone number and profile photo when you register, sign in, or sign in with Google.",
      "Order details — shipping address, items purchased, order value, payment method (Cash on Delivery or WhatsApp order) and order history.",
      "Communication details — messages you send us on WhatsApp, email, or through the Site's contact options, and product reviews you post.",
      "Usage details — pages viewed, products wishlisted, and general device or browser information collected automatically to keep the Site working smoothly.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    items: [
      "To process, pack, ship and deliver your orders, including Cash on Delivery and WhatsApp orders.",
      "To manage your account, wishlist, saved addresses and order history.",
      "To send order confirmations, delivery updates and respond to your queries.",
      "To personalise the products and offers we show you.",
      "To detect and prevent fraud, abuse and technical issues.",
    ],
  },
  {
    title: "4. Cookies & Similar Technologies",
    paragraphs: [
      `We use essential cookies and browser storage to keep you signed in and to remember your cart, wishlist and theme preference. You can control or disable cookies from your browser settings, though some parts of the Site may not work correctly without them.`,
    ],
  },
  {
    title: "5. Sharing Your Information",
    intro: "We do not sell your personal information. We only share it with:",
    items: [
      "Firebase (Google Cloud) — for authentication, our database and image storage, strictly to run the Site.",
      "Delivery and logistics partners — only the details needed to ship your order to you.",
      "Government or regulatory authorities, where we are legally required to disclose information.",
    ],
  },
  {
    title: "6. Data Security",
    paragraphs: [
      `We rely on Firebase Authentication and Firestore security rules to restrict access to your data to you and authorised store administrators only. While we take reasonable steps to protect your information, no method of transmission or storage over the internet is completely secure.`,
    ],
  },
  {
    title: "7. Your Rights & Choices",
    paragraphs: [
      `You can view and update your account details, addresses and wishlist any time from your Profile page. To request a copy of your data, or to have your account deleted, please contact us — we will action this subject to any records we are legally required to keep, such as invoices for tax purposes.`,
    ],
  },
  {
    title: "8. Children's Privacy",
    paragraphs: [
      `The Site is intended for users aged 18 and above. We do not knowingly collect personal information from children. If you believe a child has shared personal information with us, please contact us and we will remove it.`,
    ],
  },
  {
    title: "9. Changes to This Policy",
    paragraphs: [
      `We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "last updated" date.`,
    ],
  },
  {
    title: "10. Contact Us",
    paragraphs: [
      `Questions about this policy? Reach out via email or WhatsApp using the contact details in the Site footer.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      icon={ShieldCheck}
      title="Privacy Policy"
      subtitle="Your trust matters to us — here's how we collect, use and protect your information."
      lastUpdated="17 July 2026"
      sections={SECTIONS}
    />
  );
    }
