"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MailCheck, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { resendVerification, logout } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setSending(true);
    try {
      await resendVerification();
      toast.success("Verification email sent!");
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch {
      toast.error("Failed to send email. Try again later.");
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerified = () => {
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <div className="glass-dark rounded-4xl border border-white/10 p-8 shadow-luxury">
          <div className="w-16 h-16 rounded-full bg-gold-500/20 border-2 border-gold-500 flex items-center justify-center mx-auto mb-5">
            <MailCheck size={32} className="text-gold-500" />
          </div>

          <h1 className="font-display text-2xl font-bold text-ivory-100 mb-2">
            Verify Your Email
          </h1>
          <p className="text-[#A08060] text-sm font-body mb-1">
            We've sent a verification link to
          </p>
          <p className="text-gold-500 text-sm font-utility font-semibold mb-6">
            {user?.email}
          </p>
          <p className="text-[#A08060] text-xs font-body mb-6">
            Please check your inbox and click the verification link to activate
            your account. Don't forget to check your spam folder.
          </p>

          <div className="flex flex-col gap-3">
            <button onClick={handleCheckVerified} className="btn-gold w-full">
              I've Verified My Email
            </button>
            <button
              onClick={handleResend}
              disabled={sending || cooldown > 0}
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="text-[#A08060] hover:text-crimson-400 text-xs font-utility mt-6 transition-colors"
          >
            Sign out and use a different account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
