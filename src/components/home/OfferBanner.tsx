"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Clock } from "lucide-react";
import { getActiveCoupons } from "@/lib/firebase/firestore";
import { Coupon } from "@/types";

function useCountdown(target: Date | null) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!target) {
      setTimeLeft(null);
      return;
    }
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      const totalSeconds = Math.floor(diff / 1000);
      setTimeLeft({
        h: Math.floor(totalSeconds / 3600),
        m: Math.floor((totalSeconds % 3600) / 60),
        s: totalSeconds % 60,
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target]);

  return timeLeft;
}

export default function OfferBanner() {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveCoupons()
      .then((coupons) => setCoupon(coupons[0] || null))
      .finally(() => setLoading(false));
  }, []);

  const validUntil = coupon?.validUntil ? new Date(coupon.validUntil) : null;
  const timeLeft = useCountdown(validUntil);

  // No real active coupon → show nothing, never fake data.
  if (loading || !coupon) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  const discountLabel =
    coupon.discountType === "percentage"
      ? `Flat ${coupon.discountValue}% OFF`
      : `Flat ₹${coupon.discountValue} OFF`;

  const minOrderLabel =
    coupon.minOrderValue > 0
      ? `On orders above ₹${coupon.minOrderValue.toLocaleString("en-IN")}`
      : "On your order";

  return (
    <section className="py-10 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-4xl bg-silk-gradient p-8 sm:p-12"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,0.1) 20px,
                rgba(255,255,255,0.1) 40px
              )`,
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Zap size={18} className="text-ivory-100" />
                <span className="text-ivory-200 text-xs font-utility tracking-widest uppercase">
                  Limited Time Offer
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory-100 mb-2">
                {discountLabel}
              </h2>
              <p className="text-ivory-200/80 font-body text-sm">
                {minOrderLabel} · Use code{" "}
                <span className="font-utility font-bold text-ivory-100 bg-white/20 px-2 py-0.5 rounded">
                  {coupon.code}
                </span>
              </p>
            </div>

            {timeLeft && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-ivory-200/70 text-xs font-utility">
                  <Clock size={13} />
                  Ends in:
                </div>
                {[
                  { val: timeLeft.h, label: "Hrs" },
                  { val: timeLeft.m, label: "Min" },
                  { val: timeLeft.s, label: "Sec" },
                ].map(({ val, label }, i) => (
                  <div key={label}>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-ivory-100/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <span className="font-utility font-bold text-ivory-100 text-xl">
                          {pad(val)}
                        </span>
                      </div>
                      <span className="text-ivory-200/60 text-[10px] font-utility mt-1">
                        {label}
                      </span>
                    </div>
                    {i < 2 && (
                      <span className="text-ivory-100 font-bold text-xl mb-4 mx-0.5">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/shop"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-ivory-100 text-crimson-900 font-utility font-bold text-sm hover:bg-ivory-200 transition-colors group flex-shrink-0"
            >
              Shop Now
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
