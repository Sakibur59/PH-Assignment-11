// client/src/app/dashboard/page.jsx
"use client";

import { useSession } from "@/lib/auth-client";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Heart,
  ArrowUpRight
} from "lucide-react";

export default function DashboardHome() {
  const { data: session } = useSession();
  const user = session?.user;

  const stats = [
    { label: "Total Campaigns", value: "124", icon: TrendingUp, change: "+12%" },
    { label: "Active Supporters", value: "1,284", icon: Users, change: "+8%" },
    { label: "Total Raised", value: "$45.2K", icon: DollarSign, change: "+23%" },
    { label: "Your Contributions", value: "8", icon: Heart, change: "+2" },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
          Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
        </h2>
        <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Here's what's happening with your campaigns and contributions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#14171F] border border-white/5 rounded-lg p-4 hover:border-[#D8A13B]/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} className="text-[#D8A13B]" />
                <span className="text-xs text-[#4FAE7C] font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#F3EFE4] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                {stat.value}
              </div>
              <div className="text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#14171F] border border-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#F3EFE4] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-white/5 hover:bg-[#D8A13B]/20 text-[#F3EFE4] px-4 py-3 rounded-sm transition-colors text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Explore Campaigns
          </button>
          <button className="bg-white/5 hover:bg-[#D8A13B]/20 text-[#F3EFE4] px-4 py-3 rounded-sm transition-colors text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Purchase Credits
          </button>
          <button className="bg-white/5 hover:bg-[#D8A13B]/20 text-[#F3EFE4] px-4 py-3 rounded-sm transition-colors text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            View History
          </button>
          <button className="bg-[#D8A13B] text-[#14171F] px-4 py-3 rounded-sm transition-colors text-sm font-medium hover:bg-[#c99530]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}