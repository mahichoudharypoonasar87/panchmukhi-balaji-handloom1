"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-crimson-900/20 border-2 border-crimson-900/50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={36} className="text-crimson-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ivory-100 mb-2">
          Something Went Wrong
        </h1>
        <p className="text-[#A08060] font-body text-sm mb-2 leading-relaxed">
          We encountered an unexpected error. Please try again or return to the home page.
        </p>
        {error.digest && (
          <p className="text-[#6B5744] text-xs font-utility mb-6">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-luxury text-sm flex items-center gap-2 justify-center"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
          <Link href="/" className="btn-outline text-sm flex items-center gap-2 justify-center">
            <Home size={15} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
