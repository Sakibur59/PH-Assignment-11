// client/src/app/dashboard/supporter/page.jsx
"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { 
  Heart, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar
} from "lucide-react";

export default function SupporterHome() {
  const { data: session } = useSession();
  const user = session?.user;
  const [stats, setStats] = useState({
    totalContributions: 0,
    pendingContributions: 0,
    totalAmount: 0
  });
  const [approvedContributions, setApprovedContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupporterData();
  }, []);

  const fetchSupporterData = async () => {
    try {
      const response = await fetch('/api/supporter/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setApprovedContributions(data.approvedContributions || []);
      }
    } catch (error) {
      console.error('Error fetching supporter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: "Total Contributions", 
      value: stats.totalContributions, 
      icon: Heart, 
      color: "text-[#E88A7E]"
    },
    { 
      label: "Pending Contributions", 
      value: stats.pendingContributions, 
      icon: Clock, 
      color: "text-[#D8A13B]"
    },
    { 
      label: "Total Amount Contributed", 
      value: `$${stats.totalAmount.toFixed(2)}`, 
      icon: DollarSign, 
      color: "text-[#4FAE7C]"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#F3EFE4]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
          Welcome back, {user?.name?.split(" ")[0] || "Supporter"}! 👋
        </h2>
        <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Track your contributions and support amazing campaigns.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#14171F] border border-white/5 rounded-lg p-6 hover:border-[#D8A13B]/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon size={24} className={stat.color} />
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

      {/* Approved Contributions Table */}
      <div className="bg-[#14171F] border border-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#F3EFE4] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Approved Contributions
        </h3>

        {approvedContributions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-[#9AA1AE] mx-auto mb-3" />
            <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              You don't have any approved contributions yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B1F2A] border-b border-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Campaign Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Creator
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {approvedContributions.map((contribution) => (
                  <tr key={contribution._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {contribution.campaignTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#4FAE7C]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      ${contribution.amount}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {contribution.creatorName || 'Unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm px-3 py-1 rounded-full bg-[#4FAE7C]/20 text-[#4FAE7C]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Approved
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {new Date(contribution.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}