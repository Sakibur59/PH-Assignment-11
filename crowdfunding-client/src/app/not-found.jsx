// client/src/app/not-found.jsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, ArrowLeft, Search, FileQuestion } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-[#14171F] border border-white/5 rounded-full flex items-center justify-center">
            <FileQuestion size={64} className="text-[#D8A13B]" />
          </div>
          <div className="absolute -top-2 -right-2 bg-[#E88A7E] text-white text-xs font-bold px-3 py-1 rounded-full">
            404
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-4xl font-bold text-[#F3EFE4] mb-3"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}
        >
          Page Not Found
        </h1>

        {/* Description */}
        <p 
          className="text-[#9AA1AE] mb-8 leading-relaxed"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 bg-[#1B1F2A] border border-white/5 text-[#F3EFE4] py-3 rounded-lg hover:bg-white/5 transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-[#D8A13B] text-[#14171F] py-3 rounded-lg hover:bg-[#c99530] transition-colors font-medium"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Home size={18} />
            Back to Home
          </Link>

          <Link
            href="/campaigns"
            className="w-full flex items-center justify-center gap-2 bg-[#14171F] border border-white/5 text-[#9AA1AE] py-3 rounded-lg hover:text-[#F3EFE4] hover:border-[#D8A13B]/30 transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Search size={18} />
            Browse Campaigns
          </Link>
        </div>

        {/* Footer Text */}
        <p 
          className="text-[#9AA1AE]/50 text-xs mt-8"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}