// client/src/app/dashboard/creator/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react";

export default function CreatorHome() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0
  });
  const [pendingContributions, setPendingContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const fetchCreatorData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${SERVER_URL}/api/creator/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setPendingContributions(data.pendingContributions || []);
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contributionId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/creator/contribution/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contributionId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Contribution approved successfully!');
        fetchCreatorData();
        setModalOpen(false);
      } else {
        alert(data.message || 'Failed to approve');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Failed to approve contribution');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (contributionId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/creator/contribution/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contributionId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Contribution rejected and credits refunded!');
        fetchCreatorData();
        setModalOpen(false);
      } else {
        alert(data.message || 'Failed to reject');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Failed to reject contribution');
    } finally {
      setActionLoading(false);
    }
  };

  const statCards = [
    { 
      label: "Total Campaigns", 
      value: stats.totalCampaigns, 
      icon: TrendingUp, 
      color: "text-[#D8A13B]"
    },
    { 
      label: "Active Campaigns", 
      value: stats.activeCampaigns, 
      icon: Calendar, 
      color: "text-[#4FAE7C]"
    },
    { 
      label: "Total Raised", 
      value: `$${stats.totalRaised}`, 
      icon: DollarSign, 
      color: "text-[#E88A7E]"
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
          Welcome back, {session?.user?.name?.split(" ")[0] || "Creator"}! 🚀
        </h2>
        <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Manage your campaigns and review contributions.
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

      {/* Contributions To Review */}
      <div className="bg-[#14171F] border border-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#F3EFE4] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Contributions To Review
        </h3>

        {pendingContributions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-[#4FAE7C] mx-auto mb-3" />
            <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No pending contributions to review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B1F2A] border-b border-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Supporter
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Campaign
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingContributions.map((contribution) => (
                  <tr key={contribution._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {contribution.supporterName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {contribution.campaignTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#D8A13B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      ${contribution.amount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedContribution(contribution);
                            setModalOpen(true);
                          }}
                          className="flex items-center gap-1 bg-[#1B1F2A] text-[#9AA1AE] px-3 py-1.5 rounded-sm hover:text-[#F3EFE4] transition-colors text-sm"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedContribution && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14171F] border border-white/10 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#F3EFE4] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Contribution Details
            </h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Supporter
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedContribution.supporterName}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Campaign
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedContribution.campaignTitle}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Amount
                </p>
                <p className="text-[#D8A13B] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                  ${selectedContribution.amount}
                </p>
              </div>
              {selectedContribution.message && (
                <div>
                  <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Message
                  </p>
                  <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {selectedContribution.message}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Date
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {new Date(selectedContribution.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(selectedContribution._id)}
                disabled={actionLoading}
                className="flex-1 bg-[#4FAE7C] text-white py-2 rounded-sm hover:bg-[#3d8d64] transition-colors disabled:opacity-50"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(selectedContribution._id)}
                disabled={actionLoading}
                className="flex-1 bg-[#E88A7E] text-white py-2 rounded-sm hover:bg-[#d47a6e] transition-colors disabled:opacity-50"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-[#1B1F2A] text-[#9AA1AE] rounded-sm hover:text-[#F3EFE4] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}