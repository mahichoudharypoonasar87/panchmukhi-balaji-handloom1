import { Metadata } from "next";
import ContactContent from "@/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Panchmukhi Balaji Handloom — reach us on WhatsApp, phone, or email for orders, queries, and support.",
};

export default function ContactPage() {
  return <ContactContent />;
}
