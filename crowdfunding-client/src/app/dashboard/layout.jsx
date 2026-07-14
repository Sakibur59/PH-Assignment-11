"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Home, 
  Compass, 
  Heart, 
  CreditCard, 
  History, 
  PlusCircle, 
  FolderOpen, 
  Wallet, 
  Users, 
  Megaphone, 
  FileText,
  LogOut,
  Bell,
  Shield,
  Menu,
  X,
  ArrowLeft
} from "lucide-react";

function Avatar({ user, size = 40 }) {
  if (user?.image) {
    return (
      <img
        src={user.image}
        alt={user.name || "Profile"}
        className="rounded-full object-cover border border-white/10"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  return (
    <div
      className="rounded-full bg-[#D8A13B] text-[#14171F] flex items-center justify-center font-semibold"
      style={{ width: size, height: size, fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {initial}
    </div>
  );
}

function CreditPill({ credits }) {
  return (
    <div
      className="flex items-center gap-1.5 bg-white/5 border border-[#D8A13B]/30 px-3 py-1.5 rounded-full"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#4FAE7C]" />
      <span className="text-[#F3EFE4] text-sm">{credits ?? 0}</span>
      <span className="text-[#9AA1AE] text-xs">credits</span>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isPending && session) {
      const role = session.user?.role || "supporter";
      const path = pathname || "";
      
      if (path === "/dashboard" || path === "/dashboard/") {
        router.push(`/dashboard/${role}`);
        return;
      }

      if (path.startsWith("/dashboard/") && path !== "/dashboard/unauthorized") {
        const pathSegments = path.split("/");
        const roleFromPath = pathSegments[2];
        
        if (roleFromPath && roleFromPath !== role && roleFromPath !== "unauthorized") {
          router.push("/dashboard/unauthorized");
        }
      }
    }
  }, [session, isPending, pathname, router]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center">
        <div className="text-[#F3EFE4]">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;
  const role = user.role || "supporter";

  const getNavigation = () => {
    const baseNav = [
      { 
        name: "Dashboard Home", 
        href: `/dashboard/${role}`, 
        icon: Home,
        exact: true
      },
    ];

    if (role === "supporter") {
      return [
        ...baseNav,
        { name: "Explore Campaigns", href: "/dashboard/supporter/campaigns", icon: Compass },
        { name: "My Contributions", href: "/dashboard/supporter/contributions", icon: Heart },
        { name: "Purchase Credit", href: "/dashboard/supporter/purchase-credit", icon: CreditCard },
        { name: "Payment History", href: "/dashboard/supporter/payment-history", icon: History },
      ];
    }

    if (role === "creator") {
      return [
        ...baseNav,
        { name: "Add New Campaign", href: "/dashboard/creator/add-campaign", icon: PlusCircle },
        { name: "My Campaigns", href: "/dashboard/creator/my-campaigns", icon: FolderOpen },
        { name: "Withdrawals", href: "/dashboard/creator/withdrawals", icon: Wallet },
        { name: "Payment History", href: "/dashboard/creator/payment-history", icon: History },
      ];
    }

    if (role === "admin") {
      return [
        ...baseNav,
        { name: "Manage Users", href: "/dashboard/admin/users", icon: Users },
        { name: "Manage Campaigns", href: "/dashboard/admin/campaigns", icon: Megaphone },
        { name: "Withdrawal Requests", href: "/dashboard/admin/withdrawal-requests", icon: Wallet },
        { name: "Reports", href: "/dashboard/admin/reports", icon: FileText },
      ];
    }

    return baseNav;
  };

  const navigation = getNavigation();

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname?.startsWith(item.href);
  };

  const handleLogout = async () => {
    const { signOut } = await import("@/lib/auth-client");
    await signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    router.push("/");
  };

  const getPageTitle = () => {
    const currentPath = pathname || "";
    const navItem = navigation.find(item => {
      if (item.exact) {
        return currentPath === item.href;
      }
      return currentPath.startsWith(item.href);
    });
    return navItem ? navItem.name : "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] flex">
      {/* Sidebar */}
      <aside
        className={`bg-[#14171F] border-r border-white/5 fixed md:relative z-40 h-full transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 md:w-20"
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-white/5">
            <Link
              href="/"
              className="text-xl text-[#F3EFE4]"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              {sidebarOpen ? (
                <>
                  Crowd<span className="text-[#D8A13B]">Fund</span>
                </>
              ) : (
                <span className="text-[#D8A13B]">C</span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const active = isActive(item);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all group ${
                        active 
                          ? "bg-[#D8A13B]/10 text-[#D8A13B]" 
                          : "text-[#9AA1AE] hover:text-[#F3EFE4] hover:bg-white/5"
                      }`}
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      {sidebarOpen && (
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-sm">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <Avatar user={user} size={sidebarOpen ? 40 : 32} />
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-[#F3EFE4] text-sm truncate" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
                    {user.name}
                  </p>
                  <p className="text-[#9AA1AE] text-xs truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield size={12} className="text-[#D8A13B]" />
                    <span className="text-[#D8A13B] text-xs capitalize" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {role}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 mt-3 px-3 py-2 text-sm text-[#E88A7E] hover:bg-white/5 rounded-sm transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-[#14171F]/95 backdrop-blur border-b border-white/5 sticky top-0 z-30 px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <Link
                href="/"
                className="flex items-center gap-2 text-[#9AA1AE] hover:text-[#D8A13B] transition-colors text-sm group"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </Link>

              <div className="hidden md:block h-6 w-px bg-white/10" />
              
              <h1 className="text-[#F3EFE4] text-lg font-semibold hidden md:block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <CreditPill credits={user.credits} />
              
              <button className="relative text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D8A13B] rounded-full"></span>
              </button>

              <div className="md:hidden">
                <Avatar user={user} size={32} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#14171F] border-t border-white/5 px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-[#9AA1AE]/50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              © {new Date().getFullYear()} CrowdFund. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[10px] text-[#9AA1AE]/40 uppercase tracking-wider">
              <Link href="/privacy" className="hover:text-[#D8A13B] transition-colors">
                Privacy
              </Link>
              <span className="w-px h-3 bg-white/10"></span>
              <Link href="/terms" className="hover:text-[#D8A13B] transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}