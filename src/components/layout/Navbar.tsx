"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  LogOut,
  Package,
  MapPin,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { logout } from "@/lib/firebase/auth";
import { getCategories } from "@/lib/firebase/firestore";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const STATIC_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
];

const TRAILING_NAV_LINKS = [{ href: "/track-order", label: "Track Order" }];

interface NavLink {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, userProfile, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  // FIX: "Collections" used to be five hardcoded category names shown
  // regardless of what real categories exist. Now built from real
  // Firestore data — the dropdown simply doesn't appear if no categories
  // have been created yet in Admin > Categories.
  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(cats.slice(0, 8)))
      .catch(() => setCategories([]));
  }, []);

  const navLinks: NavLink[] = useMemo(() => {
    const links: NavLink[] = [...STATIC_NAV_LINKS];
    if (categories.length > 0) {
      links.push({
        href: "/shop",
        label: "Collections",
        children: categories.map((cat) => ({
          href: `/shop?category=${cat.slug || cat.id}`,
          label: cat.name,
        })),
      });
    }
    links.push(...TRAILING_NAV_LINKS);
    return links;
  }, [categories]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navClass = cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
    scrolled
      ? "bg-[#0F0500]/95 backdrop-blur-xl border-b border-gold-500/20 shadow-luxury"
      : "bg-transparent"
  );

  return (
    <>
      <nav className={navClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link
              href="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <div className="relative w-10 h-10 rounded-full bg-gold-shimmer bg-gold-500 flex items-center justify-center shadow-gold-glow">
                <span className="font-display text-ebony font-bold text-lg">P</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-display text-ivory-100 font-bold text-base leading-tight">
                  Panchmukhi Balaji
                </div>
                <div className="font-utility text-gold-500 text-xs tracking-widest uppercase">
                  Handloom
                </div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 font-utility text-sm font-medium tracking-wide",
                      "transition-colors duration-200 hover:text-gold-500",
                      pathname === link.href
                        ? "text-gold-500"
                        : "text-ivory-200"
                    )}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          activeDropdown === link.label && "rotate-180"
                        )}
                      />
                    )}
                  </Link>

                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-48 glass-dark rounded-2xl shadow-luxury border border-gold-500/20 overflow-hidden"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-3 text-sm font-utility text-ivory-200 hover:text-gold-500 hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full text-ivory-200 hover:text-gold-500 hover:bg-white/10 transition-all"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden sm:flex p-2 rounded-full text-ivory-200 hover:text-gold-500 hover:bg-white/10 transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user && (
                <Link
                  href="/wishlist"
                  className="relative p-2 rounded-full text-ivory-200 hover:text-gold-500 hover:bg-white/10 transition-all"
                  aria-label="Wishlist"
                >
                  <Heart size={20} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-crimson-900 text-ivory-100 text-xs font-utility font-bold rounded-full flex items-center justify-center">
                      {wishlist.length > 9 ? "9+" : wishlist.length}
                    </span>
                  )}
                </Link>
              )}

              <Link
                href="/cart"
                className="relative p-2 rounded-full text-ivory-200 hover:text-gold-500 hover:bg-white/10 transition-all"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-ebony text-xs font-utility font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-all"
                    aria-label="User menu"
                  >
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt={userProfile.displayName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gold-500/50"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gold-500/20 border-2 border-gold-500/50 flex items-center justify-center">
                        <User size={16} className="text-gold-500" />
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-56 glass-dark rounded-2xl shadow-luxury border border-gold-500/20 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-ivory-100 font-semibold text-sm font-body truncate">
                            {userProfile?.displayName || "User"}
                          </p>
                          <p className="text-[var(--muted)] text-xs font-utility truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 text-gold-500 hover:bg-gold-500/10 transition-colors text-sm font-utility font-medium border-b border-white/10"
                          >
                            <LayoutDashboard size={16} />
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-ivory-200 hover:text-gold-500 hover:bg-white/5 transition-colors text-sm font-utility"
                        >
                          <User size={16} />
                          My Profile
                        </Link>
                        <Link
                          href="/profile/orders"
                          className="flex items-center gap-3 px-4 py-3 text-ivory-200 hover:text-gold-500 hover:bg-white/5 transition-colors text-sm font-utility"
                        >
                          <Package size={16} />
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-3 px-4 py-3 text-ivory-200 hover:text-gold-500 hover:bg-white/5 transition-colors text-sm font-utility"
                        >
                          <Heart size={16} />
                          Wishlist
                        </Link>
                        <Link
                          href="/profile/addresses"
                          className="flex items-center gap-3 px-4 py-3 text-ivory-200 hover:text-gold-500 hover:bg-white/5 transition-colors text-sm font-utility border-b border-white/10"
                        >
                          <MapPin size={16} />
                          Saved Addresses
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-crimson-400 hover:bg-crimson-900/20 transition-colors text-sm font-utility"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn-luxury text-xs px-4 py-2 hidden sm:flex"
                >
                  Login
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-full text-ivory-200 hover:text-gold-500 hover:bg-white/10 transition-all"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gold-500/20 bg-[#0F0500]/98 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block px-4 py-3 rounded-xl font-utility text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "bg-gold-500/20 text-gold-500"
                          : "text-ivory-200 hover:bg-white/5 hover:text-gold-500"
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="ml-4 mt-1 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm font-utility text-[var(--muted)] hover:text-gold-500 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {!user && (
                  <div className="pt-2 flex gap-3">
                    <Link href="/login" className="btn-luxury w-full text-center text-xs">
                      Login
                    </Link>
                    <Link href="/register" className="btn-outline w-full text-center text-xs">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ebony/90 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for sarees, fabrics, dupattas..."
                  className="w-full px-6 py-5 pr-16 rounded-2xl glass border border-gold-500/30 text-ivory-100 text-lg font-body placeholder-[var(--muted)] focus:outline-none focus:border-gold-500"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gold-500 hover:text-gold-400 transition-colors"
                >
                  <Search size={24} />
                </button>
              </form>
              <p className="text-center text-[var(--muted)] text-sm mt-4 font-utility">
                Press ESC to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  );
}
