import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ──────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

// ─── Lost Items ────────────────────────────────────────
export const reportLostItem = (formData) =>
  API.post('/items/lost', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getAllLostItems = () => API.get('/items/lost');
export const getLostItem = (id) => API.get(`/items/lost/${id}`);
export const getMyLostItems = () => API.get('/items/lost/my');
export const searchLostItems = (keyword) =>
  API.get(`/items/lost/search?keyword=${keyword}`);
export const updateLostItem = (id, data) => API.put(`/items/lost/${id}`, data);
export const deleteLostItem = (id) => API.delete(`/items/lost/${id}`);

// ─── Found Items ───────────────────────────────────────
export const reportFoundItem = (formData) =>
  API.post('/items/found', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getAllFoundItems = () => API.get('/items/found');
export const getFoundItem = (id) => API.get(`/items/found/${id}`);
export const getMyFoundItems = () => API.get('/items/found/my');
export const searchFoundItems = (keyword) =>
  API.get(`/items/found/search?keyword=${keyword}`);
export const updateFoundItem = (id, data) =>
  API.put(`/items/found/${id}`, data);
export const deleteFoundItem = (id) => API.delete(`/items/found/${id}`);

// ─── Matches ───────────────────────────────────────────
export const getMatchesForLost = (id) =>
  API.get(`/items/lost/${id}/matches`);
export const getMatchesForFound = (id) =>
  API.get(`/items/found/${id}/matches`);
export const confirmMatch = (matchId) =>
  API.post(`/items/matches/${matchId}/confirm`);
export const rejectMatch = (matchId) =>
  API.post(`/items/matches/${matchId}/reject`);

// ─── Claims ────────────────────────────────────────────
export const submitClaim = (formData) =>
  API.post('/claims', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getMyClaims = () => API.get('/claims/my');
export const getClaimsForItem = (foundItemId) =>
  API.get(`/claims/item/${foundItemId}`);

// ─── Admin Claims ──────────────────────────────────────
export const getAllClaims = () => API.get('/admin/claims');
export const getPendingClaims = () => API.get('/admin/claims/pending');
export const approveClaim = (id, notes = '') =>
  API.post(`/admin/claims/${id}/approve?notes=${encodeURIComponent(notes)}`);
export const rejectClaim = (id, notes = '') =>
  API.post(`/admin/claims/${id}/reject?notes=${encodeURIComponent(notes)}`);

// ─── Notifications ─────────────────────────────────────
export const getNotifications = () => API.get('/notifications');
export const getUnreadNotifications = () => API.get('/notifications/unread');
export const getUnreadCount = () => API.get('/notifications/unread/count');
export const markNotificationRead = (id) =>
  API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  API.patch('/notifications/read-all');

// ─── Dashboard ─────────────────────────────────────────
export const getDashboardStats = () => API.get('/dashboard');
export const getAdminDashboardStats = () => API.get('/dashboard/admin');

export default API;
