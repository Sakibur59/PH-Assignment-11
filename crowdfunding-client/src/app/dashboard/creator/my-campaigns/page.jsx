"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FolderOpen, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  AlertTriangle,
  X
} from "lucide-react";

export default function MyCampaigns() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", story: "", rewardInfo: "" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const response = await fetch(`${SERVER_URL}/api/creator/campaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setEditForm({
      title: campaign.title || "",
      story: campaign.story || "",
      rewardInfo: campaign.rewardInfo || ""
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editForm.title.trim() || !editForm.story.trim()) {
      setMessage("Title and Story are required");
      setMessageType("error");
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/creator/campaign/${editingCampaign._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("Campaign updated successfully!");
        setMessageType("success");
        setEditModalOpen(false);
        fetchCampaigns();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Failed to update");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      setMessage("Failed to update campaign");
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/creator/campaign/${campaignToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("Campaign deleted and all supporters refunded!");
        setMessageType("success");
        setDeleteModalOpen(false);
        setCampaignToDelete(null);
        fetchCampaigns();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Failed to delete");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setMessage("Failed to delete campaign");
      setMessageType("error");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#F3EFE4]">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#F3EFE4] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        My Campaigns
      </h2>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          messageType === "success" 
            ? "bg-[#4FAE7C]/20 border border-[#4FAE7C] text-[#4FAE7C]" 
            : "bg-[#E88A7E]/20 border border-[#E88A7E] text-[#E88A7E]"
        }`}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{message}</span>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-lg">
          <FolderOpen size={48} className="text-[#9AA1AE] mx-auto mb-3" />
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            You haven't created any campaigns yet.
          </p>
          <button
            onClick={() => router.push("/dashboard/creator/add-campaign")}
            className="mt-3 bg-[#D8A13B] text-[#14171F] px-4 py-2 rounded-sm hover:bg-[#c99530] transition-colors text-sm font-medium"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Create Your First Campaign
          </button>
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
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Raised / Goal
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Supporters
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Deadline
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
                {campaigns.map((campaign) => {
                  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
                  const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={campaign._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-[#F3EFE4] text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {campaign.title}
                          </p>
                          <p className="text-[#9AA1AE] text-xs truncate max-w-[200px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {campaign.story?.substring(0, 50)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {campaign.category}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-[#F3EFE4] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            ${campaign.raised} / ${campaign.goal}
                          </p>
                          <div className="w-20 h-1 bg-[#1B1F2A] rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-[#D8A13B] rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          <Users size={14} />
                          {campaign.supporters || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar size={14} className="text-[#9AA1AE]" />
                          <span className={`${daysLeft > 0 ? 'text-[#4FAE7C]' : 'text-[#E88A7E]'}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {daysLeft > 0 ? `${daysLeft} days` : 'Ended'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(campaign)}
                            className="p-1.5 bg-[#1B1F2A] text-[#9AA1AE] rounded hover:text-[#D8A13B] transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(campaign)}
                            className="p-1.5 bg-[#1B1F2A] text-[#9AA1AE] rounded hover:text-[#E88A7E] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingCampaign && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14171F] border border-white/10 rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
                Edit Campaign
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  placeholder="Campaign title"
                />
              </div>
              <div>
                <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Story *
                </label>
                <textarea
                  rows="3"
                  value={editForm.story}
                  onChange={(e) => setEditForm({ ...editForm, story: e.target.value })}
                  className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  placeholder="Campaign story"
                />
              </div>
              <div>
                <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Reward Info
                </label>
                <input
                  type="text"
                  value={editForm.rewardInfo}
                  onChange={(e) => setEditForm({ ...editForm, rewardInfo: e.target.value })}
                  className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  placeholder="What supporters will receive"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdate}
                disabled={actionLoading}
                className="flex-1 bg-[#D8A13B] text-[#14171F] py-2 rounded-sm hover:bg-[#c99530] transition-colors disabled:opacity-50"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {actionLoading ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-[#1B1F2A] text-[#9AA1AE] rounded-sm hover:text-[#F3EFE4] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && campaignToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14171F] border border-white/10 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-[#E88A7E]/10 p-3 rounded-full">
                <AlertTriangle size={32} className="text-[#E88A7E]" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#F3EFE4] text-center mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
              Delete Campaign?
            </h3>
            
            <p className="text-[#9AA1AE] text-center mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Are you sure you want to delete "<span className="text-[#F3EFE4]">{campaignToDelete.title}</span>"?
            </p>
            
            <div className="bg-[#E88A7E]/10 border border-[#E88A7E]/20 rounded-lg p-3 mb-4">
              <p className="text-[#E88A7E] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ⚠️ This will:
              </p>
              <ul className="text-[#E88A7E] text-sm ml-4 mt-1 space-y-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <li>• Permanently delete this campaign</li>
                <li>• Refund all supporters ({campaignToDelete.supporters || 0} supporters)</li>
                <li>• Remove all contributions</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="flex-1 bg-[#E88A7E] text-white py-2 rounded-sm hover:bg-[#d47a6e] transition-colors disabled:opacity-50"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCampaignToDelete(null);
                }}
                className="flex-1 bg-[#1B1F2A] text-[#9AA1AE] py-2 rounded-sm hover:text-[#F3EFE4] transition-colors"
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