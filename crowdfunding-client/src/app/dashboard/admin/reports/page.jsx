// client/src/app/dashboard/admin/reports/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flag, AlertTriangle, CheckCircle, XCircle, Trash2, Pause, Eye, X } from "lucide-react";
import Toast from "@/components/Toast";

export default function AdminReports() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, reportId: null, action: null, campaignTitle: "" });
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }

      const response = await fetch(`${SERVER_URL}/api/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      if (data.success) setReports(data.reports || []);
      else showToast(data.message || 'Failed to load reports', 'error');
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => setToast({ message, type, visible: true });
  const hideToast = () => setToast({ ...toast, visible: false });

  const handleResolveReport = async () => {
    const { reportId, action, campaignTitle } = confirmModal;
    setActionLoading(true);
    closeConfirmModal();

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/admin/reports/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reportId, action })
      });

      const data = await response.json();
      if (data.success) {
        showToast(`✅ ${campaignTitle} ${action === 'delete' ? 'deleted' : 'suspended'}!`, 'success');
        fetchReports();
        setModalOpen(false);
      } else {
        showToast(data.message || 'Failed to resolve report', 'error');
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      showToast('Failed to resolve report', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'pending': { color: 'bg-[#D8A13B]/20 text-[#D8A13B]', icon: AlertTriangle },
      'resolved': { color: 'bg-[#4FAE7C]/20 text-[#4FAE7C]', icon: CheckCircle }
    };
    const config = configs[status] || configs['pending'];
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${config.color}`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getReasonColor = (reason) => {
    const colors = {
      'fraudulent': 'bg-[#E88A7E]/20 text-[#E88A7E]',
      'suspicious': 'bg-[#D8A13B]/20 text-[#D8A13B]',
      'misleading': 'bg-[#E88A7E]/20 text-[#E88A7E]',
      'scam': 'bg-[#E88A7E]/20 text-[#E88A7E]',
      'other': 'bg-[#9AA1AE]/20 text-[#9AA1AE]'
    };
    return colors[reason] || colors['other'];
  };

  const filteredReports = reports.filter(report =>
    report.campaignTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openConfirmModal = (reportId, action, campaignTitle) => {
    setConfirmModal({ open: true, reportId, action, campaignTitle });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, reportId: null, action: null, campaignTitle: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9AA1AE]">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#F3EFE4]">Reported Campaigns</h2>
        <span className="text-[#9AA1AE] text-sm">Total: {reports.length} reports</span>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by campaign title, reporter name, or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1B1F2A] border border-white/10 rounded-lg px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none"
        />
      </div>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-lg">
          <Flag size={48} className="text-[#9AA1AE] mx-auto mb-3 opacity-30" />
          <p className="text-[#9AA1AE]">{searchTerm ? 'No reports found.' : 'No pending reports.'}</p>
        </div>
      ) : (
        <div className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B1F2A] border-b border-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase">Campaign</th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase">Reporter</th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase">Reason</th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-[#F3EFE4] text-sm font-medium">{report.campaignTitle}</p>
                      <p className="text-[#9AA1AE] text-xs">by {report.campaignCreatorName || 'Unknown'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#F3EFE4] text-sm">{report.reporterName}</p>
                      <p className="text-[#9AA1AE] text-xs">{report.reporterEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getReasonColor(report.reason)}`}>
                        {report.reason.charAt(0).toUpperCase() + report.reason.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedReport(report); setModalOpen(true); }} className="p-1.5 bg-[#1B1F2A] text-[#9AA1AE] rounded hover:text-[#F3EFE4]">
                          <Eye size={16} />
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button onClick={() => openConfirmModal(report._id, 'suspend', report.campaignTitle)} className="p-1.5 bg-[#D8A13B]/20 text-[#D8A13B] rounded hover:bg-[#D8A13B]/30">
                              <Pause size={16} />
                            </button>
                            <button onClick={() => openConfirmModal(report._id, 'delete', report.campaignTitle)} className="p-1.5 bg-[#E88A7E]/20 text-[#E88A7E] rounded hover:bg-[#E88A7E]/30">
                              <Trash2 size={16} />
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

      {/* Report Details Modal */}
      {modalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14171F] border border-white/10 rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#F3EFE4]">Report Details</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#9AA1AE] hover:text-[#F3EFE4]">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div><p className="text-[#9AA1AE] text-sm">Campaign</p><p className="text-[#F3EFE4]">{selectedReport.campaignTitle}</p></div>
              <div><p className="text-[#9AA1AE] text-sm">Reported By</p><p className="text-[#F3EFE4]">{selectedReport.reporterName} ({selectedReport.reporterEmail})</p></div>
              <div><p className="text-[#9AA1AE] text-sm">Reason</p><p className="text-[#F3EFE4]">{selectedReport.reason}</p></div>
              {selectedReport.description && <div><p className="text-[#9AA1AE] text-sm">Description</p><p className="text-[#F3EFE4] text-sm">{selectedReport.description}</p></div>}
              <div><p className="text-[#9AA1AE] text-sm">Reported On</p><p className="text-[#F3EFE4]">{new Date(selectedReport.createdAt).toLocaleString()}</p></div>
              <div><p className="text-[#9AA1AE] text-sm">Status</p>{getStatusBadge(selectedReport.status)}</div>
            </div>
            <div className="flex gap-3 mt-6">
              {selectedReport.status === 'pending' && (
                <>
                  <button onClick={() => { setModalOpen(false); openConfirmModal(selectedReport._id, 'suspend', selectedReport.campaignTitle); }} className="flex-1 bg-[#D8A13B] text-white py-2 rounded-lg hover:bg-[#c99530]">
                    <Pause size={16} className="inline mr-2" /> Suspend
                  </button>
                  <button onClick={() => { setModalOpen(false); openConfirmModal(selectedReport._id, 'delete', selectedReport.campaignTitle); }} className="flex-1 bg-[#E88A7E] text-white py-2 rounded-lg hover:bg-[#d47a6e]">
                    <Trash2 size={16} className="inline mr-2" /> Delete
                  </button>
                </>
              )}
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#1B1F2A] text-[#9AA1AE] rounded-lg hover:text-[#F3EFE4]">
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
              <div className={`p-3 rounded-full ${confirmModal.action === 'delete' ? 'bg-[#E88A7E]/10' : 'bg-[#D8A13B]/10'}`}>
                {confirmModal.action === 'delete' ? <Trash2 size={32} className="text-[#E88A7E]" /> : <Pause size={32} className="text-[#D8A13B]" />}
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#F3EFE4] text-center mb-2">
              {confirmModal.action === 'delete' ? 'Delete Campaign' : 'Suspend Campaign'}
            </h3>
            <p className="text-[#9AA1AE] text-center mb-4">
              {confirmModal.action === 'delete' 
                ? `Are you sure you want to permanently delete "${confirmModal.campaignTitle}"? This will refund all supporters.`
                : `Are you sure you want to suspend "${confirmModal.campaignTitle}"?`}
            </p>
            <div className="bg-[#E88A7E]/10 border border-[#E88A7E]/20 rounded-lg p-3 mb-4">
              <p className="text-[#E88A7E] text-sm">⚠️ This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleResolveReport} className={`flex-1 ${confirmModal.action === 'delete' ? 'bg-[#E88A7E] hover:bg-[#d47a6e]' : 'bg-[#D8A13B] hover:bg-[#c99530]'} text-white py-2.5 rounded-lg font-medium`}>
                {actionLoading ? 'Processing...' : confirmModal.action === 'delete' ? 'Yes, Delete' : 'Yes, Suspend'}
              </button>
              <button onClick={closeConfirmModal} className="flex-1 bg-[#1B1F2A] text-[#9AA1AE] py-2.5 rounded-lg hover:text-[#F3EFE4]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}