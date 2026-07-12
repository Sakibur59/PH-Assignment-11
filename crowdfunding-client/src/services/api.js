import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ==================== AUTH API ====================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google-login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// ==================== CAMPAIGN API ====================

export const campaignAPI = {
  getAll: (params) => api.get('/campaigns', { params }),
  getTopFunded: () => api.get('/campaigns/top-funded'),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  getMyCampaigns: () => api.get('/campaigns/creator/my-campaigns'),
};

// ==================== CONTRIBUTION API ====================

export const contributionAPI = {
  create: (data) => api.post('/contributions', data),
  getCreatorPending: () => api.get('/contributions/creator/pending'),
  approve: (id) => api.patch(`/contributions/${id}/approve`),
  reject: (id) => api.patch(`/contributions/${id}/reject`),
  getSupporter: (params) => api.get('/contributions/supporter', { params }),
  getSupporterApproved: () => api.get('/contributions/supporter/approved'),
};

// ==================== WITHDRAWAL API ====================

export const withdrawalAPI = {
  create: (data) => api.post('/withdrawals', data),
  getCreator: () => api.get('/withdrawals/creator'),
};

// ==================== PAYMENT API ====================

export const paymentAPI = {
  create: (data) => api.post('/payments', data),
  getMyPayments: () => api.get('/payments'),
};

// ==================== NOTIFICATION API ====================

export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

// ==================== ADMIN API ====================

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPendingCampaigns: () => api.get('/admin/campaigns/pending'),
  approveCampaign: (id) => api.patch(`/admin/campaigns/${id}/approve`),
  rejectCampaign: (id) => api.patch(`/admin/campaigns/${id}/reject`),
  getPendingWithdrawals: () => api.get('/admin/withdrawals/pending'),
  processWithdrawal: (id) => api.patch(`/admin/withdrawals/${id}/process`),
  getStats: () => api.get('/admin/stats'),
  getReports: () => api.get('/admin/reports'),
};

// ==================== STATS API ====================

export const statsAPI = {
  creator: () => api.get('/creator/stats'),
  supporter: () => api.get('/supporter/stats'),
};

export default api;