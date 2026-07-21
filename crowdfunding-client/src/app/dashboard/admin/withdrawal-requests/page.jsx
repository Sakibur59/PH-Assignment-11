"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  DollarSign,
  Search,
  User,
  Calendar,
  X,
  AlertTriangle
} from "lucide-react";
import Toast from "@/components/Toast";

export default function AdminWithdrawals() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    withdrawalId: null,
    amount: 0,
    creatorName: ""
  });
  
  // Toast state
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    visible: false
  });

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/admin/withdrawals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }

      const data = await response.json();
      
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
      } else {
        showToast(data.message || 'Failed to load withdrawals', 'error');
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      showToast('Failed to load withdrawals', 'error');
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

  const openConfirmModal = (withdrawalId, creatorName, amount) => {
    setConfirmModal({
      open: true,
      withdrawalId,
      creatorName,
      amount
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      withdrawalId: null,
      amount: 0,
      creatorName: ""
    });
  };

  const handlePaymentSuccess = async () => {
    const { withdrawalId, amount, creatorName } = confirmModal;
    setActionLoading(true);
    closeConfirmModal();

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/admin/withdrawal/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ withdrawalId })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast(`✅ $${amount} withdrawal approved for ${creatorName}!`, 'success');
        fetchWithdrawals();
        setModalOpen(false);
      } else {
        showToast(data.message || 'Failed to process withdrawal', 'error');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      showToast('Failed to process withdrawal', 'error');
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

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          withdrawal.paymentSystem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          withdrawal.accountNumber?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || withdrawal.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate total pending amount
  const totalPending = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + (w.withdrawalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Loading withdrawal requests...
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
          Withdrawal Requests
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Total: {withdrawals.length} requests
          </span>
          {totalPending > 0 && (
            <span className="bg-[#D8A13B]/20 text-[#D8A13B] px-3 py-1 rounded-full text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Pending: ${totalPending.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA1AE]" />
          <input
            type="text"
            placeholder="Search by creator name, payment system or account..."
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

      {/* Withdrawals Table */}
      {filteredWithdrawals.length === 0 ? (
        <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-lg">
          <Wallet size={48} className="text-[#9AA1AE] mx-auto mb-3 opacity-30" />
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {searchTerm || filterStatus !== 'all' 
              ? 'No withdrawal requests found matching your criteria.' 
              : 'No withdrawal requests available.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B1F2A] border-b border-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Creator
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Credits
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Payment System
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Account
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Date
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
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {withdrawal.creatorName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#D8A13B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {withdrawal.withdrawalCredits}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#4FAE7C]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      ${withdrawal.withdrawalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {withdrawal.paymentSystem}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {withdrawal.accountNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {new Date(withdrawal.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setModalOpen(true);
                          }}
                          className="p-1.5 bg-[#1B1F2A] text-[#9AA1AE] rounded hover:text-[#F3EFE4] transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {withdrawal.status === 'pending' && (
                          <button
                            onClick={() => openConfirmModal(
                              withdrawal._id, 
                              withdrawal.creatorName, 
                              withdrawal.withdrawalAmount
                            )}
                            disabled={actionLoading}
                            className="p-1.5 bg-[#4FAE7C]/20 text-[#4FAE7C] rounded hover:bg-[#4FAE7C]/30 transition-colors disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            <CheckCircle size={16} />
                          </button>
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

      {/* Withdrawal Details Modal */}
      {modalOpen && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14171F] border border-white/10 rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
                Withdrawal Details
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
                  Creator
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedWithdrawal.creatorName}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Email
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedWithdrawal.creatorEmail}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Credits Withdrawn
                </p>
                <p className="text-[#D8A13B] font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                  {selectedWithdrawal.withdrawalCredits} credits
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Amount
                </p>
                <p className="text-[#4FAE7C] font-bold text-lg" style={{ fontFamily: "'Fraunces', serif" }}>
                  ${selectedWithdrawal.withdrawalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Payment System
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedWithdrawal.paymentSystem}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Account Number
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedWithdrawal.accountNumber}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Date Requested
                </p>
                <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {new Date(selectedWithdrawal.date).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Status
                </p>
                {getStatusBadge(selectedWithdrawal.status)}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedWithdrawal.status === 'pending' && (
                <button
                  onClick={() => {
                    setModalOpen(false);
                    openConfirmModal(
                      selectedWithdrawal._id,
                      selectedWithdrawal.creatorName,
                      selectedWithdrawal.withdrawalAmount
                    );
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-[#4FAE7C] text-white py-2 rounded-lg hover:bg-[#3d8d64] transition-colors disabled:opacity-50"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {actionLoading ? 'Processing...' : '✅ Payment Success'}
                </button>
              )}
              <button
                onClick={() => setModalOpen(false)}
                className={`px-4 py-2 bg-[#1B1F2A] text-[#9AA1AE] rounded-lg hover:text-[#F3EFE4] transition-colors ${selectedWithdrawal.status === 'pending' ? 'flex-1' : 'w-full'}`}
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
              <div className="p-3 rounded-full bg-[#4FAE7C]/10">
                <DollarSign size={32} className="text-[#4FAE7C]" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#F3EFE4] text-center mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
              Confirm Payment
            </h3>
            
            <p className="text-[#9AA1AE] text-center mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Are you sure you want to mark this withdrawal as paid?
            </p>
            
            <div className="bg-[#1B1F2A] rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Creator
                </span>
                <span className="text-[#F3EFE4] text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {confirmModal.creatorName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Amount
                </span>
                <span className="text-[#4FAE7C] text-sm font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                  ${confirmModal.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-[#E88A7E] text-xs text-center mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ⚠️ This will deduct credits from the creator's campaigns.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handlePaymentSuccess}
                disabled={actionLoading}
                className="flex-1 bg-[#4FAE7C] text-white py-2.5 rounded-lg transition-colors disabled:opacity-50 font-medium hover:bg-[#3d8d64]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {actionLoading ? 'Processing...' : 'Yes, Confirm Payment'}
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