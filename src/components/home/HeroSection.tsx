"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Star, Users, Package } from "lucide-react";

const STATS = [
  { icon: Star, value: "4.9★", label: "Customer Rating" },
  { icon: Package, value: "500+", label: "Products" },
  { icon: Users, value: "10K+", label: "Happy Customers" },
];

const HERO_WORDS = ["Sarees", "Fabrics", "Dupattas", "Textiles"];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentWord, setCurrentWord] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % HERO_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-pattern"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Silk texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #D4AF37 0px,
              #D4AF37 1px,
              transparent 1px,
              transparent 8px
            )`,
          }}
        />

        {/* Radial glow spots */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-crimson-900/30 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold-500/20 blur-3xl"
        />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold-500"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
              opacity: 0,
            }}
            animate={{
              y: [`${Math.random() * 100}vh`, `${Math.random() * 100}vh`],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
          />
        ))}

        {/* Corner ornaments */}
        <div className="absolute top-4 left-4 w-24 h-24 opacity-20">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L50 0 L0 50 Z" fill="#D4AF37" opacity="0.5" />
            <path d="M10 0 L60 0 L0 60 Z" fill="none" stroke="#D4AF37" strokeWidth="1" />
          </svg>
        </div>
        <div className="absolute top-4 right-4 w-24 h-24 opacity-20 rotate-90">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L50 0 L0 50 Z" fill="#D4AF37" opacity="0.5" />
            <path d="M10 0 L60 0 L0 60 Z" fill="none" stroke="#D4AF37" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Parallax wrapper */}
      <motion.div style={{ y, opacity }} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32">
          <div className="flex flex-col items-center text-center">
            {/* Pre-title badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold-500/30 mb-6"
            >
              <Sparkles size={14} className="text-gold-500" />
              <span className="text-gold-400 text-xs font-utility tracking-widest uppercase">
                Authentic Rajasthani Handloom Since 2010
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-ivory-100 leading-tight mb-4"
            >
              Premium Handloom
              <br />
              <span className="relative inline-block">
                <span className="text-gold-gradient">
                  <AnimatedWord words={HERO_WORDS} currentIndex={currentWord} />
                </span>
                {/* Underline */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[#C0A080] text-base sm:text-lg font-body max-w-2xl leading-relaxed mb-8"
            >
              Discover the art of Rajasthani weaving — timeless patterns, 
              natural dyes, and master craftsmanship from the looms of Poonasar
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                href="/shop"
                className="btn-gold text-sm px-8 py-3.5 group"
              >
                Explore Collection
                <ArrowRight
                  size={16}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/shop?featured=true"
                className="btn-outline text-sm px-8 py-3.5"
              >
                New Arrivals
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-6 sm:gap-10"
            >
              {STATS.map(({ icon: Icon, value, label }, i) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} className="text-gold-500" />
                    <span className="font-utility font-bold text-ivory-100 text-lg sm:text-xl">
                      {value}
                    </span>
                  </div>
                  <span className="text-[#A08060] text-xs font-utility">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[#A08060] text-[10px] font-utility tracking-widest uppercase">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-gold-500/40 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-gold-500 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />
    </section>
  );
}

function AnimatedWord({
  words,
  currentIndex,
}: {
  words: string[];
  currentIndex: number;
}) {
  return (
    <span className="relative inline-flex overflow-hidden">
      {words.map((word, i) => (
        <motion.span
          key={word}
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: i === currentIndex ? "0%" : i < currentIndex ? "-100%" : "100%",
            opacity: i === currentIndex ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ position: i === currentIndex ? "relative" : "absolute" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
