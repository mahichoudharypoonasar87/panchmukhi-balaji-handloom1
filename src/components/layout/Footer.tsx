"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
  Heart,
  Truck,
  Shield,
  RefreshCw,
  Award,
} from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?featured=true", label: "New Arrivals" },
  { href: "/shop?bestseller=true", label: "Best Sellers" },
  { href: "/track-order", label: "Track Order" },
];

const CATEGORIES = [
  { href: "/shop?category=sarees", label: "Handloom Sarees" },
  { href: "/shop?category=cotton", label: "Cotton Fabrics" },
  { href: "/shop?category=silk", label: "Silk Collection" },
  { href: "/shop?category=dupattas", label: "Dupattas" },
  { href: "/shop?category=dress-materials", label: "Dress Materials" },
  { href: "/shop?category=stoles", label: "Stoles & Scarves" },
];

const HELP_LINKS = [
  { href: "/profile/orders", label: "My Orders" },
  { href: "/track-order", label: "Track Order" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/return-policy", label: "Return Policy" },
];

const FEATURES = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
  { icon: Shield, title: "Secure Payment", desc: "100% safe & secure" },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
  { icon: Award, title: "Authentic Handloom", desc: "Directly from weavers" },
];

export default function Footer() {
  const { settings } = useSiteSettings();

  const whatsappNumber =
    settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";
  const email = settings?.email || "panchmukhibalajihandloom@gmail.com";
  const displayPhone = settings?.phone || whatsappNumber;

  const addressParts = [settings?.address, settings?.city, settings?.state].filter(Boolean);
  const address =
    addressParts.length > 0
      ? addressParts.join(", ") + (settings?.pincode ? ` - ${settings.pincode}` : "")
      : "Panchori Road, Poonasar, Rajasthan, India";

  // Social links now come from the settings you save in /admin/settings.
  const social = settings?.socialLinks;

  return (
    <footer className="bg-footer-gradient border-t border-gold-500/20">
      <div className="border-b border-gold-500/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/20 transition-colors">
                  <Icon size={18} className="text-gold-500" />
                </div>
                <div>
                  <p className="text-ivory-100 font-semibold text-sm font-body">{title}</p>
                  <p className="text-[#A08060] text-xs font-utility">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center shadow-gold-glow">
                <span className="font-display text-ebony font-bold text-lg">P</span>
              </div>
              <div>
                <div className="font-display text-ivory-100 font-bold text-base leading-tight">
                  Panchmukhi Balaji
                </div>
                <div className="font-utility text-gold-500 text-xs tracking-widest uppercase">
                  Handloom
                </div>
              </div>
            </Link>
            <p className="text-[#A08060] text-sm font-body leading-relaxed mb-4">
              Authentic Rajasthani handloom textiles crafted with generations of
              artisan expertise. Bringing tradition to your doorstep.
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gold-500 flex-shrink-0 mt-1" />
                <span className="text-[#A08060] text-xs font-body">{address}</span>
              </div>
              {displayPhone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gold-500 flex-shrink-0" />
                  <a
                    href={`tel:+${displayPhone.replace(/\D/g, "")}`}
                    className="text-[#A08060] text-xs font-utility hover:text-gold-500 transition-colors"
                  >
                    +{displayPhone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gold-500 flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-[#A08060] text-xs font-utility hover:text-gold-500 transition-colors"
                >
                  {email}
                </a>
              </div>
            </div>

            {/* Social Links — now pulled from siteSettings.socialLinks instead of "#" */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-green-600/20 border border-green-600/30 flex items-center justify-center hover:bg-green-600/30 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={14} className="text-green-400" />
              </a>
              {social?.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center hover:bg-blue-600/30 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={14} className="text-blue-400" />
                </a>
              )}
              {social?.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-pink-600/20 border border-pink-600/30 flex items-center justify-center hover:bg-pink-600/30 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={14} className="text-pink-400" />
                </a>
              )}
              {social?.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-sky-600/20 border border-sky-600/30 flex items-center justify-center hover:bg-sky-600/30 transition-colors"
                  aria-label="Twitter / X"
                >
                  <Twitter size={14} className="text-sky-400" />
                </a>
              )}
              {social?.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center hover:bg-red-600/30 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube size={14} className="text-red-400" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-utility text-xs tracking-widest uppercase text-gold-500 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#A08060] hover:text-gold-500 text-sm font-utility transition-colors flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500/50 group-hover:bg-gold-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-utility text-xs tracking-widest uppercase text-gold-500 mb-4">
              Collections
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-[#A08060] hover:text-gold-500 text-sm font-utility transition-colors flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500/50 group-hover:bg-gold-500 transition-colors" />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-utility text-xs tracking-widest uppercase text-gold-500 mb-4">
              Help & Support
            </h3>
            <ul className="space-y-2">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#A08060] hover:text-gold-500 text-sm font-utility transition-colors flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500/50 group-hover:bg-gold-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <a
              href={`https://wa.me/${whatsappNumber}?text=Hello! I have a query about your handloom products.`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600/20 border border-green-600/30 hover:bg-green-600/30 transition-colors group"
            >
              <MessageCircle size={16} className="text-green-400" />
              <div>
                <p className="text-green-400 text-xs font-utility font-semibold">Chat on WhatsApp</p>
                <p className="text-[#A08060] text-xs font-utility">Quick response guaranteed</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gold-500/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[#A08060] text-xs font-utility text-center sm:text-left">
              © {new Date().getFullYear()} Panchmukhi Balaji Handloom, Poonasar, Rajasthan. All rights reserved.
            </p>
            <p className="text-[#A08060] text-xs font-utility flex items-center gap-1">
              Made with <Heart size={10} className="text-crimson-600 fill-current" /> in Rajasthan, India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
                          }
