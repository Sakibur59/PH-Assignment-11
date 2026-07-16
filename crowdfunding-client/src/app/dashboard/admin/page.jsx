"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { 
  Users, 
  UserPlus, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function AdminHome() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalSupporters: 0,
    totalCreators: 0,
    totalCredits: 0,
    totalPayments: 0,
    pendingCampaigns: 0,
    pendingWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${SERVER_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: "Total Supporters", 
      value: stats.totalSupporters, 
      icon: Users, 
      color: "text-[#4A90D9]",
      bg: "bg-[#4A90D9]/10"
    },
    { 
      label: "Total Creators", 
      value: stats.totalCreators, 
      icon: UserPlus, 
      color: "text-[#4FAE7C]",
      bg: "bg-[#4FAE7C]/10"
    },
    { 
      label: "Total Credits Available", 
      value: stats.totalCredits, 
      icon: CreditCard, 
      color: "text-[#D8A13B]",
      bg: "bg-[#D8A13B]/10"
    },
    { 
      label: "Total Payments Processed", 
      value: `$${stats.totalPayments}`, 
      icon: DollarSign, 
      color: "text-[#E88A7E]",
      bg: "bg-[#E88A7E]/10"
    },
  ];

  const pendingCards = [
    {
      label: "Pending Campaigns",
      value: stats.pendingCampaigns,
      icon: Clock,
      color: "text-[#D8A13B]",
      bg: "bg-[#D8A13B]/10",
      route: "/dashboard/admin/campaigns"
    },
    {
      label: "Pending Withdrawals",
      value: stats.pendingWithdrawals,
      icon: Clock,
      color: "text-[#E88A7E]",
      bg: "bg-[#E88A7E]/10",
      route: "/dashboard/admin/withdrawal-requests"
    }
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'contribution': return <TrendingUp size={16} className="text-[#4A90D9]" />;
      case 'withdrawal': return <DollarSign size={16} className="text-[#E88A7E]" />;
      case 'campaign': return <Activity size={16} className="text-[#4FAE7C]" />;
      default: return <Activity size={16} className="text-[#9AA1AE]" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
          Welcome back, {session?.user?.name?.split(" ")[0] || "Admin"}! 👋
        </h2>
        <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Manage users, campaigns, and monitor platform activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#14171F] border border-white/5 rounded-lg p-6 hover:border-[#D8A13B]/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
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

      {/* Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {pendingCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[#14171F] border border-white/5 rounded-lg p-6 hover:border-[#D8A13B]/30 transition-all cursor-pointer"
              onClick={() => window.location.href = card.route}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <Icon size={20} className={card.color} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
                      {card.value}
                    </div>
                    <div className="text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {card.label}
                    </div>
                  </div>
                </div>
                <div className="text-[#9AA1AE]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-[#14171F] border border-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#F3EFE4] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Recent Activity
        </h3>

        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Activity size={48} className="text-[#9AA1AE] mx-auto mb-3 opacity-30" />
            <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No recent activity
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[#1B1F2A] rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-[#1B1F2A]">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-[#F3EFE4] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {activity.message}
                    </p>
                    <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.status === 'approved' || activity.status === 'completed'
                    ? 'bg-[#4FAE7C]/20 text-[#4FAE7C]'
                    : activity.status === 'pending'
                    ? 'bg-[#D8A13B]/20 text-[#D8A13B]'
                    : 'bg-[#E88A7E]/20 text-[#E88A7E]'
                }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {activity.status || 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}