import Link from "next/link";
import { Home, Search, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-crimson-900/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        {/* 404 Display */}
        <div className="relative mb-6">
          <p className="font-display font-bold text-[120px] sm:text-[160px] leading-none text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.1) 100%)" }}>
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gold-500/20 border-2 border-gold-500/50 flex items-center justify-center">
              <span className="font-display text-gold-500 font-bold text-2xl">P</span>
            </div>
          </div>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100 mb-3">
          Page Not Found
        </h1>
        <p className="text-[#A08060] font-body text-sm mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to exploring our beautiful handloom collection.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-gold text-sm flex items-center gap-2 justify-center">
            <Home size={16} />
            Go Home
          </Link>
          <Link href="/shop" className="btn-luxury text-sm flex items-center gap-2 justify-center">
            <ShoppingBag size={16} />
            Browse Products
          </Link>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 mt-6 text-[#A08060] hover:text-gold-500 text-xs font-utility transition-colors"
        >
          <Search size={13} />
          Search our collection instead
        </Link>
      </div>
    </div>
  );
}
