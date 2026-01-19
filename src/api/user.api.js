// src/api/userApi.js
import axiosInstance from './axiosConfig';

const userApi = {
  // Get all users with pagination, filtering and sorting
  getAllUsers: (params = {}) =>
    axiosInstance.get('/admin/users', { params })
      .then(response => response.data),

  // Get user by ID with details
  getUserById: (id) =>
    axiosInstance.get(`/admin/users/${id}`)
      .then(response => response.data),

  // Create new user
  createUser: (userData) =>
    axiosInstance.post('/admin/users', userData)
      .then(response => response.data),

  // Update user
  updateUser: (id, userData) =>
    axiosInstance.put(`/admin/users/${id}`, userData)
      .then(response => response.data),

  // Update user status (active/inactive)
  updateUserStatus: (id, isActive) =>
    axiosInstance.patch(`/admin/users/${id}/status`, { isActive })
      .then(response => response.data),

  // Delete user
  deleteUser: (id) =>
    axiosInstance.delete(`/admin/users/${id}`)
      .then(response => response.data),

  // Get user statistics
  getUserStats: (params = {}) =>
    axiosInstance.get('/admin/users/stats', { params })
      .then(response => response.data),

  // Search users - Note: You have both getAllUsers with params and searchUsers
  // They might be redundant. I'll keep both for compatibility
  searchUsers: (searchTerm, filters = {}) =>
    axiosInstance.get('/admin/users/search', {
      params: {
        search: searchTerm,
        ...filters
      }
    })
      .then(response => response.data),

  // Bulk update users
  bulkUpdateUsers: (userIds, updateData) =>
    axiosInstance.patch('/admin/users/bulk-update', {
      userIds,
      ...updateData
    })
      .then(response => response.data),

  // Export users
  exportUsers: (format = 'csv', params = {}) =>
    axiosInstance.get(`/admin/users/export`, {
      params: {
        format,
        ...params
      },
      responseType: 'blob'
    })
      .then(response => response.data),

  // Get user activity log
  getUserActivity: (userId, limit = 50) =>
    axiosInstance.get(`/admin/users/${userId}/activity`, {
      params: { limit }
    })
      .then(response => response.data),
};

export default userApi;