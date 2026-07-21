import { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FAQAccordion from "@/components/faq/FAQAccordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about orders, shipping, returns, payments and our handloom products at Panchmukhi Balaji Handloom.",
};

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        <div className="bg-dark-luxury border-b border-gold-500/10 py-10">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <HelpCircle size={36} className="text-gold-500 mx-auto mb-3" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100 mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-[#A08060] text-sm font-utility">
              Everything you need to know about shopping with us
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <FAQAccordion />

          <div className="mt-10 p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
            <p className="text-[var(--foreground)] font-body font-semibold mb-1">
              Still have questions?
            </p>
            <p className="text-[var(--muted)] text-sm font-utility mb-4">
              Our team is happy to help — reach out anytime
            </p>
            <Link href="/contact" className="btn-gold text-sm inline-flex items-center gap-2">
              <MessageCircle size={16} />
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
