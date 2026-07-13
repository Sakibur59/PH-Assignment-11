// client/src/app/dashboard/unauthorized/page.jsx
"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-[#E88A7E]/10 p-4 rounded-full">
            <Shield size={48} className="text-[#E88A7E]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#F3EFE4] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
          Unauthorized Access
        </h2>
        <p className="text-[#9AA1AE] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          You don't have permission to access this page. Please contact support if you believe this is an error.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#D8A13B] text-[#14171F] px-6 py-3 rounded-sm transition-colors hover:bg-[#c99530] font-medium"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}