"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      const role = session.user?.role;
      if (role !== "admin") {
        window.location.href = "/dashboard/unauthorized";
      }
    }
  }, [session, isPending]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#F3EFE4]">Loading...</div>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}