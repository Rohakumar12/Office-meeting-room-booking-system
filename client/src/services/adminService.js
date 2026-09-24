import api from './api';

export const adminService = {
  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  getAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  getAllBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  getAllRooms: async (params = {}) => {
    const response = await api.get('/admin/rooms', { params });
    return response.data;
  },
};
