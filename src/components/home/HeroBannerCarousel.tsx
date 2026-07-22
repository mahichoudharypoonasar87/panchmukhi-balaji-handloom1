"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { ArrowRight } from "lucide-react";
import { Banner } from "@/types";

interface HeroBannerCarouselProps {
  banners: Banner[];
}

export default function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  return (
    <section className="relative w-full bg-ebony">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={banners.length > 1}
        className="w-full h-[60vh] min-h-[420px] max-h-[640px]"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-full">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ebony via-ebony/50 to-ebony/10" />

              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                  <div className="max-w-xl">
                    {banner.subtitle && (
                      <p className="text-gold-400 text-xs sm:text-sm font-utility tracking-widest uppercase mb-3">
                        {banner.subtitle}
                      </p>
                    )}
                    <h1 className="font-display text-3xl sm:text-5xl font-bold text-ivory-100 leading-tight mb-4">
                      {banner.title}
                    </h1>
                    {banner.description && (
                      <p className="text-[#C0A080] text-sm sm:text-base font-body leading-relaxed mb-6 line-clamp-3">
                        {banner.description}
                      </p>
                    )}
                    {banner.link && (
                      <Link
                        href={banner.link}
                        className="btn-gold text-sm inline-flex items-center gap-2"
                      >
                        {banner.buttonText || "Shop Now"}
                        <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
