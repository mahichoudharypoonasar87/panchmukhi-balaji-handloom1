"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Jaipur, Rajasthan",
    rating: 5,
    text: "Absolutely beautiful sarees! The quality is exceptional and exactly as described. The handloom texture is so authentic — you can feel the craftsmanship in every thread. I ordered three sarees and all of them arrived perfectly. Will definitely order again!",
    product: "Rajasthani Cotton Handloom Saree",
    avatar: "PS",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Meena Devi",
    location: "Delhi",
    rating: 5,
    text: "I was looking for authentic handloom sarees for my daughter's wedding and stumbled upon this store. The silk sarees are beyond stunning. Every guest at the wedding complimented me. The WhatsApp ordering process was so easy and the delivery was quick!",
    product: "Silk Handloom Bridal Saree",
    avatar: "MD",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Sunita Agarwal",
    location: "Mumbai, Maharashtra",
    rating: 5,
    text: "The cotton dupattas I purchased are absolutely gorgeous. The block print pattern is so unique and the fabric quality is top-notch. This store truly represents the rich textile heritage of Rajasthan. Packaging was beautiful too — felt like a premium gift!",
    product: "Block Print Cotton Dupatta",
    avatar: "SA",
    date: "3 weeks ago",
  },
  {
    id: 4,
    name: "Kavitha Reddy",
    location: "Hyderabad, Telangana",
    rating: 4,
    text: "Really impressed with the variety of handloom fabrics available. The dress material I bought has lovely colors that haven't faded even after multiple washes. Customer service was very helpful in guiding me with size and pattern selection.",
    product: "Handloom Dress Material Set",
    avatar: "KR",
    date: "5 days ago",
  },
  {
    id: 5,
    name: "Ritu Joshi",
    location: "Pune, Maharashtra",
    rating: 5,
    text: "I have been shopping here for over a year now and the quality has been consistently excellent. The stoles are my favorite — so versatile and beautifully made. I love that these are directly from Rajasthani weavers. Keep up the amazing work!",
    product: "Handwoven Stole Collection",
    avatar: "RJ",
    date: "1 week ago",
  },
];

export default function CustomerReviews() {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((c) => (c - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setCurrent((c) => (c + 1) % REVIEWS.length);

  const visible = [
    REVIEWS[current % REVIEWS.length],
    REVIEWS[(current + 1) % REVIEWS.length],
    REVIEWS[(current + 2) % REVIEWS.length],
  ];

  return (
    <section className="py-16 lg:py-24 bg-dark-luxury relative overflow-hidden">
      {/* Background ornament */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, #D4AF37 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="section-subtitle">Customer Love</p>
          <h2 className="section-title text-ivory-100">
            What Our <span className="text-gold-gradient">Customers Say</span>
          </h2>
          <div className="divider-gold" />

          {/* Overall Rating */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={20} className="text-gold-500 fill-current" />
              ))}
            </div>
            <span className="font-utility font-bold text-ivory-100 text-2xl">4.9</span>
            <span className="text-[#A08060] font-utility text-sm">
              from 1,200+ reviews
            </span>
          </div>
        </motion.div>

        {/* Reviews Carousel */}
        <div className="relative">
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {visible.map((review, i) => (
              <motion.div
                key={`${review.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-dark rounded-3xl p-6 border border-white/10 relative ${
                  i === 1 ? "ring-1 ring-gold-500/30" : ""
                }`}
              >
                {/* Quote Icon */}
                <Quote
                  size={28}
                  className="text-gold-500/30 mb-3 fill-current"
                />

                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      className={`${
                        s <= review.rating
                          ? "text-gold-500 fill-current"
                          : "text-[#3D2000]"
                      }`}
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-[#C0A080] text-sm font-body leading-relaxed mb-4 line-clamp-4">
                  {review.text}
                </p>

                {/* Product */}
                <p className="text-gold-500/70 text-[10px] font-utility tracking-wide uppercase mb-4">
                  {review.product}
                </p>

                {/* Reviewer */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                    <span className="text-gold-500 text-xs font-utility font-bold">
                      {review.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-ivory-100 text-sm font-semibold font-body">
                      {review.name}
                    </p>
                    <p className="text-[#A08060] text-[10px] font-utility">
                      {review.location} · {review.date}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Single Card */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="glass-dark rounded-3xl p-6 border border-white/10"
              >
                <Quote size={28} className="text-gold-500/30 mb-3 fill-current" />
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      className={`${
                        s <= REVIEWS[current].rating
                          ? "text-gold-500 fill-current"
                          : "text-[#3D2000]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[#C0A080] text-sm font-body leading-relaxed mb-4">
                  {REVIEWS[current].text}
                </p>
                <p className="text-gold-500/70 text-[10px] font-utility uppercase mb-4">
                  {REVIEWS[current].product}
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                    <span className="text-gold-500 text-xs font-utility font-bold">
                      {REVIEWS[current].avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-ivory-100 text-sm font-semibold font-body">
                      {REVIEWS[current].name}
                    </p>
                    <p className="text-[#A08060] text-[10px] font-utility">
                      {REVIEWS[current].location} · {REVIEWS[current].date}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full glass-dark border border-white/20 flex items-center justify-center text-ivory-200 hover:text-gold-500 hover:border-gold-500/50 transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all rounded-full ${
                    i === current
                      ? "w-6 h-2 bg-gold-500"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full glass-dark border border-white/20 flex items-center justify-center text-ivory-200 hover:text-gold-500 hover:border-gold-500/50 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
