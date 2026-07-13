"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/lib/firebase/auth";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success("Reset link sent!");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else {
        toast.error("Failed to send reset email");
      }
    }
  };

  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-crimson-900/20 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-gold-500 flex items-center justify-center shadow-gold-glow">
              <span className="font-display text-ebony font-bold text-2xl">P</span>
            </div>
            <div>
              <p className="font-display text-ivory-100 font-bold text-lg">Panchmukhi Balaji</p>
              <p className="font-utility text-gold-500 text-xs tracking-widest uppercase">Handloom</p>
            </div>
          </Link>
        </div>

        <div className="glass-dark rounded-4xl border border-white/10 p-8 shadow-luxury">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h1 className="font-display text-xl font-bold text-ivory-100 mb-2">
                Check Your Email
              </h1>
              <p className="text-[#A08060] text-sm font-body mb-6">
                We've sent a password reset link to your email address.
                Click the link to reset your password.
              </p>
              <Link href="/login" className="btn-gold w-full">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-ivory-100 text-center mb-1">
                Forgot Password?
              </h1>
              <p className="text-[#A08060] text-sm font-body text-center mb-6">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-ivory-200 text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A08060]" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-ivory-100 placeholder-[#A08060] text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-crimson-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-luxury w-full py-3.5">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Send Reset Link"}
                </button>
              </form>

              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-[#A08060] hover:text-gold-500 text-sm font-utility mt-5 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
