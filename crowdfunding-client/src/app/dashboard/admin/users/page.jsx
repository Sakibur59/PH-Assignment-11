// client/src/app/dashboard/admin/users/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Search, 
  Trash2, 
  Shield, 
  User, 
  UserPlus,
  Mail,
  CreditCard,
  X,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import Toast from "@/components/Toast";

export default function ManageUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    userId: null,
    userName: "",
    action: "", // 'delete' or 'update-role'
    newRole: ""
  });
  
  // Toast state
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    visible: false
  });

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      } else {
        showToast(data.message || 'Failed to load users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
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

  const openConfirmModal = (userId, userName, action, newRole = "") => {
    setConfirmModal({
      open: true,
      userId,
      userName,
      action,
      newRole
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      userId: null,
      userName: "",
      action: "",
      newRole: ""
    });
  };

  const handleDeleteUser = async () => {
    const { userId, userName } = confirmModal;
    setActionLoading(true);
    closeConfirmModal();

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showToast(`✅ User "${userName}" removed successfully!`, 'success');
        fetchUsers();
      } else {
        showToast(data.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    const { userId, userName, newRole } = confirmModal;
    setActionLoading(true);
    closeConfirmModal();

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast(`✅ User "${userName}" role updated to "${newRole}"!`, 'success');
        fetchUsers();
      } else {
        showToast(data.message || 'Failed to update role', 'error');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('Failed to update role', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const configs = {
      'admin': { color: 'bg-[#E88A7E]/20 text-[#E88A7E]', icon: Shield },
      'creator': { color: 'bg-[#D8A13B]/20 text-[#D8A13B]', icon: UserPlus },
      'supporter': { color: 'bg-[#4A90D9]/20 text-[#4A90D9]', icon: User }
    };
    const config = configs[role] || configs['supporter'];
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${config.color}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <Icon size={14} />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Statistics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const creatorCount = users.filter(u => u.role === 'creator').length;
  const supporterCount = users.filter(u => u.role === 'supporter').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Loading users...
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
          Manage Users
        </h2>
        <span className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Total: {totalUsers} users
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#14171F] border border-white/5 rounded-lg p-4">
          <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Total Users
          </p>
          <p className="text-2xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
            {totalUsers}
          </p>
        </div>
        <div className="bg-[#14171F] border border-white/5 rounded-lg p-4">
          <p className="text-[#E88A7E] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Admins
          </p>
          <p className="text-2xl font-bold text-[#E88A7E]" style={{ fontFamily: "'Fraunces', serif" }}>
            {adminCount}
          </p>
        </div>
        <div className="bg-[#14171F] border border-white/5 rounded-lg p-4">
          <p className="text-[#D8A13B] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Creators
          </p>
          <p className="text-2xl font-bold text-[#D8A13B]" style={{ fontFamily: "'Fraunces', serif" }}>
            {creatorCount}
          </p>
        </div>
        <div className="bg-[#14171F] border border-white/5 rounded-lg p-4">
          <p className="text-[#4A90D9] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Supporters
          </p>
          <p className="text-2xl font-bold text-[#4A90D9]" style={{ fontFamily: "'Fraunces', serif" }}>
            {supporterCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA1AE]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1B1F2A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>
        <div className="sm:w-48">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-[#1B1F2A] border border-white/10 rounded-lg px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="creator">Creator</option>
            <option value="supporter">Supporter</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-lg">
          <Users size={48} className="text-[#9AA1AE] mx-auto mb-3 opacity-30" />
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {searchTerm || filterRole !== 'all' 
              ? 'No users found matching your criteria.' 
              : 'No users available.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B1F2A] border-b border-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Credits
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D8A13B]/20 flex items-center justify-center overflow-hidden">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[#D8A13B] font-semibold text-sm">
                              {user.name?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <span className="text-[#F3EFE4] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#D8A13B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {user.credits || 0}
                    </td>
                    <td className="px-4 py-3">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Update Role Dropdown */}
                        <select
                          value={user.role}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            if (newRole !== user.role) {
                              openConfirmModal(user._id, user.name, 'update-role', newRole);
                            }
                          }}
                          className="bg-[#1B1F2A] border border-white/10 rounded px-2 py-1 text-xs text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          <option value="admin">Admin</option>
                          <option value="creator">Creator</option>
                          <option value="supporter">Supporter</option>
                        </select>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => openConfirmModal(user._id, user.name, 'delete')}
                          className="p-1.5 bg-[#E88A7E]/10 text-[#E88A7E] rounded hover:bg-[#E88A7E]/30 transition-colors"
                          title="Remove User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#14171F] border border-white/10 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${
                confirmModal.action === 'delete' 
                  ? 'bg-[#E88A7E]/10' 
                  : 'bg-[#D8A13B]/10'
              }`}>
                {confirmModal.action === 'delete' ? (
                  <Trash2 size={32} className="text-[#E88A7E]" />
                ) : (
                  <Shield size={32} className="text-[#D8A13B]" />
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#F3EFE4] text-center mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
              {confirmModal.action === 'delete' ? 'Remove User' : 'Update Role'}
            </h3>
            
            <p className="text-[#9AA1AE] text-center mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {confirmModal.action === 'delete' 
                ? `Are you sure you want to permanently remove "${confirmModal.userName}"? This action cannot be undone. All their data will be deleted.`
                : `Are you sure you want to change "${confirmModal.userName}"'s role to "${confirmModal.newRole}"?`
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmModal.action === 'delete' ? handleDeleteUser : handleUpdateRole}
                disabled={actionLoading}
                className={`flex-1 ${
                  confirmModal.action === 'delete' 
                    ? 'bg-[#E88A7E] hover:bg-[#d47a6e]' 
                    : 'bg-[#D8A13B] hover:bg-[#c99530]'
                } text-white py-2.5 rounded-lg transition-colors disabled:opacity-50 font-medium`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {actionLoading ? 'Processing...' : confirmModal.action === 'delete' ? 'Yes, Remove' : 'Yes, Update Role'}
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