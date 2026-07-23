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
        if (result?.user) {
          toast.success(`Welcome, ${result.user.displayName || "back"}!`);
          router.push("/");
        }
      })
      .catch((err: unknown) => {
        const code = (err as { code?: string })?.code;
        const message = (err as { message?: string })?.message;

        if (code === "auth/popup-closed-by-user") return;

        console.error("Google redirect sign-in failed:", err);

        if (code === "auth/account-exists-with-different-credential") {
          toast.error("An account already exists with this email using a different sign-in method.");
        } else if (code === "auth/unauthorized-domain") {
          toast.error("This domain isn't authorized for Google sign-in yet.");
        } else {
          // Surface the real code/message instead of a generic string.
          toast.error(code ? `Google sign-in failed (${code})` : message || "Google sign-in failed. Please try again.");
        }
      });
  }, [router]);

  return null;
}
