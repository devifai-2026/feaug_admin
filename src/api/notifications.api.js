import axiosInstance from './axiosConfig';

const notificationsApi = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get('/admin/notifications', { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/admin/notifications/unread-count');
    return response.data;
  },

  // Get recent notifications
  getRecentNotifications: async (limit = 10) => {
    const response = await axiosInstance.get('/admin/notifications/recent', {
      params: { limit }
    });
    return response.data;
  },

  // Get single notification
  getNotification: async (id) => {
    const response = await axiosInstance.get(`/admin/notifications/${id}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await axiosInstance.patch(`/admin/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axiosInstance.patch('/admin/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await axiosInstance.delete(`/admin/notifications/${id}`);
    return response.data;
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    const response = await axiosInstance.delete('/admin/notifications/clear-all');
    return response.data;
  },
};

export default notificationsApi;
