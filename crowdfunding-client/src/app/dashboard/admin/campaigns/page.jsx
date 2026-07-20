// client/src/app/dashboard/admin/campaigns/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Megaphone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  AlertTriangle,
  X
} from "lucide-react";
import Toast from "@/components/Toast";

export default function AdminCampaigns() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    campaignId: null,
    action: null, // 'approve' or 'reject'
    title: "",
    message: "",
    buttonText: "",
    buttonColor: ""
  });
  
  // Toast state
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    visible: false
  });

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/admin/campaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        showToast(data.message || 'Failed to load campaigns', 'error');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      showToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const openConfirmModal = (campaignId, action, campaignTitle) => {
    const configs = {
      approve: {
        title: "Approve Campaign",
        message: `Are you sure you want to approve "${campaignTitle}"? This campaign will become visible to all supporters.`,
        buttonText: "Yes, Approve",
        buttonColor: "bg-[#4FAE7C] hover:bg-[#3d8d64]"
      },
      reject: {
        title: "Reject Campaign",
        message: `Are you sure you want to reject "${campaignTitle}"? The creator will be notified and the campaign will not be visible to supporters.`,
        buttonText: "Yes, Reject",
        buttonColor: "bg-[#E88A7E] hover:bg-[#d47a6e]"
      }
    };

    const config = configs[action];
    setConfirmModal({
      open: true,
      campaignId,
      action,
      title: config.title,
      message: config.message,
      buttonText: config.buttonText,
      buttonColor: config.buttonColor
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      campaignId: null,
      action: null,
      title: "",
      message: "",
      buttonText: "",
      buttonColor: ""
    });
  };

  const handleConfirmAction = async () => {
    const { campaignId, action } = confirmModal;
    setActionLoading(true);
    closeConfirmModal();

    try {
      const token = localStorage.getItem('access_token');
      const endpoint = action === 'approve' 
        ? `${SERVER_URL}/api/admin/campaign/approve`
        : `${SERVER_URL}/api/admin/campaign/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ campaignId })
      });

      const data = await response.json();
      
      if (data.success) {
        const message = action === 'approve' 
          ? '✅ Campaign approved successfully!' 
          : '❌ Campaign rejected. Creator notified.';
        showToast(message, 'success');
        fetchCampaigns();
        setModalOpen(false);
      } else {
        showToast(data.message || `Failed to ${action} campaign`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
      showToast(`Failed to ${action} campaign`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'approved': { color: 'bg-[#4FAE7C]/20 text-[#4FAE7C]', icon: CheckCircle },
      'pending': { color: 'bg-[#D8A13B]/20 text-[#D8A13B]', icon: Clock },
      'rejected': { color: 'bg-[#E88A7E]/20 text-[#E88A7E]', icon: XCircle }
    };
    const config = configs[status] || configs['pending'];
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${config.color}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.creatorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Loading campaigns...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast.visible && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
          Manage Campaigns
        </h2>
        <span className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Total: {campaigns.length} campaigns
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA1AE]" />
          <input
            type="text"
            placeholder="Search campaigns by title or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1B1F2A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>
        <div className="sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-[#1B1F2A] border border-white/10 rounded-lg px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-lg">
          <Megaphone size={48} className="text-[#9AA1AE] mx-auto mb-3 opacity-30" />
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {searchTerm || filterStatus !== 'all' 
              ? 'No campaigns found matching your criteria.' 
              : 'No campaigns available.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B1F2A] border-b border-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Campaign
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Creator
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Goal
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[#F3EFE4] text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {campaign.title}
                        </p>
                        <p className="text-[#9AA1AE] text-xs truncate max-w-[200px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {campaign.story?.substring(0, 60)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {campaign.creatorName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#D8A13B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      ${campaign.goal}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {campaign.category}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setModalOpen(true);
                          }}
                          className="p-1.5 bg-[#1B1F2A] text-[#9AA1AE] rounded hover:text-[#F3EFE4] transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {campaign.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openConfirmModal(campaign._id, 'approve', campaign.title)}
                              disabled={actionLoading}
                              className="p-1.5 bg-[#4FAE7C]/20 text-[#4FAE7C] rounded hover:bg-[#4FAE7C]/30 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => openConfirmModal(campaign._id, 'reject', campaign.title)}
                              disabled={actionLoading}
                              className="p-1.5 bg-[#E88A7E]/20 text-[#E88A7E] rounded hover:bg-[#E88A7E]/30 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {modalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14171F] border border-white/10 rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
                Campaign Details
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Title
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedCampaign.title}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Creator
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedCampaign.creatorName}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Category
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedCampaign.category}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Goal
                </p>
                <p className="text-[#D8A13B] font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                  ${selectedCampaign.goal}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Story
                </p>
                <p className="text-[#F3EFE4] text-sm leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedCampaign.story}
                </p>
              </div>
              {selectedCampaign.rewardInfo && (
                <div>
                  <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Reward Info
                  </p>
                  <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {selectedCampaign.rewardInfo}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Deadline
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {new Date(selectedCampaign.deadline).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Status
                </p>
                {getStatusBadge(selectedCampaign.status)}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedCampaign.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      openConfirmModal(selectedCampaign._id, 'approve', selectedCampaign.title);
                    }}
                    disabled={actionLoading}
                    className="flex-1 bg-[#4FAE7C] text-white py-2 rounded-lg hover:bg-[#3d8d64] transition-colors disabled:opacity-50"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      openConfirmModal(selectedCampaign._id, 'reject', selectedCampaign.title);
                    }}
                    disabled={actionLoading}
                    className="flex-1 bg-[#E88A7E] text-white py-2 rounded-lg hover:bg-[#d47a6e] transition-colors disabled:opacity-50"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-[#1B1F2A] text-[#9AA1AE] rounded-lg hover:text-[#F3EFE4] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#14171F] border border-white/10 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${
                confirmModal.action === 'approve' 
                  ? 'bg-[#4FAE7C]/10' 
                  : 'bg-[#E88A7E]/10'
              }`}>
                {confirmModal.action === 'approve' ? (
                  <CheckCircle size={32} className="text-[#4FAE7C]" />
                ) : (
                  <XCircle size={32} className="text-[#E88A7E]" />
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#F3EFE4] text-center mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
              {confirmModal.title}
            </h3>
            
            <p className="text-[#9AA1AE] text-center mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {confirmModal.message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`flex-1 ${confirmModal.buttonColor} text-white py-2.5 rounded-lg transition-colors disabled:opacity-50 font-medium`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {actionLoading ? 'Processing...' : confirmModal.buttonText}
              </button>
              <button
                onClick={closeConfirmModal}
                className="flex-1 bg-[#1B1F2A] text-[#9AA1AE] py-2.5 rounded-lg hover:text-[#F3EFE4] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}