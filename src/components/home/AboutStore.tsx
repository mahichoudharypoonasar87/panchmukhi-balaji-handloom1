"use client";

import { motion } from "framer-motion";
import { Award, Users, Leaf, Heart, MessageCircle } from "lucide-react";

const VALUES = [
  {
    icon: Award,
    title: "Heritage Craftsmanship",
    desc: "Over 40 years of authentic Rajasthani handloom weaving tradition",
  },
  {
    icon: Leaf,
    title: "Natural & Sustainable",
    desc: "Eco-friendly dyes and sustainable farming practices for all our fabrics",
  },
  {
    icon: Users,
    title: "Weaver Partnership",
    desc: "Directly supporting local artisan families in Poonasar and nearby villages",
  },
  {
    icon: Heart,
    title: "Customer First",
    desc: "Every product is hand-checked for quality before reaching your door",
  },
];

export default function AboutStore() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";

  return (
    <section id="about" className="py-16 lg:py-24 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-subtitle">Our Story</p>
            <h2 className="section-title mb-4">
              Weaving{" "}
              <span className="text-gold-gradient">Tradition</span>
              <br />
              Into Every Thread
            </h2>
            <div className="divider-gold mb-6 mx-0" />

            <div className="space-y-4 text-[var(--muted)] font-body text-sm leading-relaxed">
              <p>
                Nestled in the heart of Poonasar, Rajasthan, Panchmukhi Balaji 
                Handloom has been a guardian of India&apos;s rich textile heritage for 
                over four decades. What began as a small family workshop has grown 
                into a trusted name in authentic handloom textiles.
              </p>
              <p>
                Every saree, every fabric, every dupatta in our collection is 
                hand-woven by master weavers using age-old techniques passed down 
                through generations. We use natural fibers — cotton, silk, linen — 
                and traditional dye methods that are both vibrant and sustainable.
              </p>
              <p>
                When you shop with us, you&apos;re not just buying fabric. You&apos;re 
                supporting the livelihoods of 200+ artisan families and helping 
                preserve a living art form that defines Rajasthan&apos;s identity.
              </p>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hello! I'd like to know more about your handloom products.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-sm"
              >
                <MessageCircle size={16} />
                Chat With Us
              </a>
            </div>
          </motion.div>

          {/* Right: Values Grid */}
          <div className="grid grid-cols-2 gap-4">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-gold-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-3 group-hover:bg-gold-500/20 transition-colors">
                  <Icon size={18} className="text-gold-500" />
                </div>
                <h3 className="font-body font-semibold text-[var(--foreground)] text-sm mb-1 leading-snug">
                  {title}
                </h3>
                <p className="text-[var(--muted)] text-xs font-body leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {[
            { value: "40+", label: "Years of Heritage" },
            { value: "200+", label: "Artisan Families" },
            { value: "500+", label: "Unique Designs" },
            { value: "10K+", label: "Happy Customers" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="text-center p-6 rounded-3xl bg-dark-luxury border border-gold-500/10"
            >
              <div className="font-display text-3xl font-bold text-gold-gradient mb-1">
                {value}
              </div>
              <div className="text-[#A08060] text-xs font-utility tracking-wide">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
