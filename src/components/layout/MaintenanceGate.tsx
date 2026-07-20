"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import MaintenancePage from "./MaintenancePage";

// Routes that stay reachable during maintenance so an admin can log in
// and switch maintenance mode back off.
const EXEMPT_PREFIXES = ["/admin", "/login", "/register", "/forgot-password", "/verify-email"];

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const { settings } = useSiteSettings();
  const { isAdmin, loading: authLoading } = useAuth();
  const pathname = usePathname() || "/";

  const isExemptPath = EXEMPT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const showMaintenance =
    settings?.maintenance === true && !authLoading && !isAdmin && !isExemptPath;

  if (showMaintenance) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}
