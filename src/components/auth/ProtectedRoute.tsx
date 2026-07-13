"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireVerified?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireVerified = false,
}: ProtectedRouteProps) {
  const { user, userProfile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (requireVerified && !user.emailVerified) {
      router.push("/verify-email");
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.push("/");
      return;
    }
  }, [user, userProfile, loading, isAdmin, requireAdmin, requireVerified, router]);

  if (loading || !user || (requireAdmin && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 size={32} className="text-gold-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
