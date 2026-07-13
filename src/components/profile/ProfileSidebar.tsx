"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, Heart, MapPin, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const LINKS = [
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/profile/orders", label: "My Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile/addresses", label: "Saved Addresses", icon: MapPin },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] overflow-hidden">
      {/* User Info */}
      <div className="p-5 border-b border-[var(--border)] text-center">
        {userProfile?.photoURL ? (
          <img
            src={userProfile.photoURL}
            alt={userProfile.displayName}
            className="w-16 h-16 rounded-full object-cover border-2 border-gold-500/50 mx-auto mb-3"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gold-500/20 border-2 border-gold-500/50 flex items-center justify-center mx-auto mb-3">
            <User size={28} className="text-gold-500" />
          </div>
        )}
        <p className="font-body font-semibold text-[var(--foreground)] text-sm truncate">
          {userProfile?.displayName || "User"}
        </p>
        <p className="text-[var(--muted)] text-xs font-utility truncate mt-0.5">
          {userProfile?.email}
        </p>
      </div>

      {/* Nav Links */}
      <nav className="p-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gold-500 hover:bg-gold-500/10 transition-colors text-sm font-utility font-medium mb-1"
          >
            <LayoutDashboard size={16} />
            Admin Dashboard
          </Link>
        )}
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-utility font-medium transition-colors mb-1",
              pathname === href
                ? "bg-gold-500/10 text-gold-500"
                : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-crimson-400 hover:bg-crimson-900/10 transition-colors text-sm font-utility font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </nav>
    </div>
  );
}
