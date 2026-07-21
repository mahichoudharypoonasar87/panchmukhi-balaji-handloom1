"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Mail, MapPin, MessageCircle, Send, Loader2, Clock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { contactSchema, ContactFormData } from "@/lib/validations";

export default function ContactContent() {
  const { settings } = useSiteSettings();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const whatsappNumber =
    settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";
  const email = settings?.email || "panchmukhibalajihandloom@gmail.com";
  const phone = settings?.phone || whatsappNumber;
  const addressParts = [settings?.address, settings?.city, settings?.state].filter(Boolean);
  const address =
    addressParts.length > 0
      ? addressParts.join(", ") + (settings?.pincode ? ` - ${settings.pincode}` : "")
      : "Panchori Road, Poonasar, Rajasthan, India";

  const onSubmit = (data: ContactFormData) => {
    const message = `Hello! I'm reaching out from the website contact form.

*Name:* ${data.name}
*Email:* ${data.email}${data.phone ? `\n*Phone:* ${data.phone}` : ""}
*Subject:* ${data.subject}

${data.message}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
    setSent(true);
    reset();
  };

  const CONTACT_CARDS = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: `+${whatsappNumber}`,
      href: `https://wa.me/${whatsappNumber}`,
      color: "text-green-500",
      bg: "bg-green-500/10 border-green-500/30",
    },
    {
      icon: Phone,
      label: "Call Us",
      value: `+${phone}`,
      href: `tel:+${phone.replace(/\D/g, "")}`,
      color: "text-gold-500",
      bg: "bg-gold-500/10 border-gold-500/30",
    },
    {
      icon: Mail,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[var(--background)]">
        <div className="bg-dark-luxury border-b border-gold-500/10 py-10">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <MessageCircle size={36} className="text-gold-500 mx-auto mb-3" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100 mb-2">
              Get In Touch
            </h1>
            <p className="text-[#A08060] text-sm font-utility">
              We&apos;d love to hear from you — questions, orders, or just to say hello
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {CONTACT_CARDS.map(({ icon: Icon, label, value, href, color, bg }) => (
              
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-gold-500/30 transition-all text-center"
              >
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mx-auto mb-3 ${bg}`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-[var(--foreground)] font-body font-semibold text-sm mb-0.5">{label}</p>
                <p className="text-[var(--muted)] text-xs font-utility break-words">{value}</p>
              </a>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
              <h2 className="font-display text-lg font-bold text-[var(--foreground)] mb-1">
                Send Us a Message
              </h2>
              <p className="text-[var(--muted)] text-sm font-utility mb-6">
                Fill this in and we&apos;ll open WhatsApp with your message ready to send
              </p>

              {sent && (
                <div className="mb-5 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-utility">
                  Your message is ready in WhatsApp — just hit send there to reach us!
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                      Full Name *
                    </label>
                    <input {...register("name")} className="input-luxury" placeholder="Your name" />
                    {errors.name && <p className="text-crimson-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                      Phone (optional)
                    </label>
                    <input {...register("phone")} className="input-luxury" placeholder="10-digit mobile number" maxLength={10} />
                    {errors.phone && <p className="text-crimson-400 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Email Address *
                  </label>
                  <input {...register("email")} type="email" className="input-luxury" placeholder="your@email.com" />
                  {errors.email && <p className="text-crimson-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Subject *
                  </label>
                  <input {...register("subject")} className="input-luxury" placeholder="e.g. Question about an order" />
                  {errors.subject && <p className="text-crimson-400 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Message *
                  </label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    className="input-luxury resize-none"
                    placeholder="How can we help?"
                  />
                  {errors.message && <p className="text-crimson-400 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-gold w-full flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      Continue on WhatsApp
                    </>
                  )}
                </button>
                <p className="text-center text-[var(--muted)] text-[10px] font-utility">
                  Prefer email? Write to us directly at{" "}
                  <a href={`mailto:${email}`} className="text-gold-500 hover:text-gold-400">
                    {email}
                  </a>
                </p>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                <h3 className="font-display text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-gold-500" />
                  Visit Us
                </h3>
                <p className="text-[var(--muted)] text-sm font-body leading-relaxed">{address}</p>
              </div>

              <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
                <h3 className="font-display text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-gold-500" />
                  Response Time
                </h3>
                <p className="text-[var(--muted)] text-sm font-body leading-relaxed">
                  We typically reply on WhatsApp within a few hours during business days.
                  For order-specific queries, keep your order number handy for a faster response.
                </p>
              </div>

              
                href={`https://wa.me/${whatsappNumber}?text=Hello! I have a query about your handloom products.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-5 rounded-3xl bg-green-600/10 border border-green-600/30 hover:bg-green-600/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-600/20 border border-green-600/30 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="text-green-400 text-sm font-utility font-semibold">Chat right now</p>
                  <p className="text-[var(--muted)] text-xs font-utility">Skip the form — message us directly</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
