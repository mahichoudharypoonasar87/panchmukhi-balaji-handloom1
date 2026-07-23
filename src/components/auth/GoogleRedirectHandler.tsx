"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getGoogleRedirectResult } from "@/lib/firebase/auth";
import toast from "react-hot-toast";

export default function GoogleRedirectHandler() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    getGoogleRedirectResult()
      .then((result) => {
        // null on a normal page load — only non-null right after a
        // completed Google redirect sign-in.
        if (result?.user) {
          toast.success(`Welcome, ${result.user.displayName || "back"}!`);
          router.push("/");
        }
      })
      .catch((err: unknown) => {
        const code = (err as { code?: string })?.code;
        if (code === "auth/account-exists-with-different-credential") {
          toast.error("An account already exists with this email using a different sign-in method.");
        } else if (code && code !== "auth/popup-closed-by-user") {
          toast.error("Google sign-in failed. Please try again.");
        }
      });
  }, [router]);

  return null;
}
