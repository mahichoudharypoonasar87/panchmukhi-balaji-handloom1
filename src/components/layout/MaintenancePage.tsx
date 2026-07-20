"use client";

import { MessageCircle, Sparkles } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function MaintenancePage() {
  const { settings } = useSiteSettings();
  const whatsappNumber =
    settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";
  const storeName = settings?.storeName || "Panchmukhi Balaji Handloom";

  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-crimson-900/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-500/50 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={32} className="text-gold-500" />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100 mb-3">
          We&apos;ll Be Right Back
        </h1>
        <p className="text-[#A08060] font-body text-sm mb-8 leading-relaxed">
          {storeName} is currently undergoing scheduled maintenance while we
          weave in a few improvements. We&apos;ll be back online shortly —
          thank you for your patience.
        </p>

        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold text-sm inline-flex items-center gap-2"
        >
          <MessageCircle size={16} />
          Message Us on WhatsApp
        </a>
      </div>
    </div>
  );
}
