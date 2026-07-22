"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!isPending) {
        // Force refetch to get latest user data
        await refetch();
        
        if (session) {
          const role = session.user?.role || "supporter";
          router.push(`/dashboard/${role}`);
        }
      }
    };

    handleRedirect();
  }, [session, isPending, router, refetch]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return null;
}