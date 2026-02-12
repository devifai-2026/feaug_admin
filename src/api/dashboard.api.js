// src/api/dashboard.api.js
import axiosInstance from './axiosConfig';

const dashboardApi = {
  // Get dashboard statistics
  getDashboardStats: (period = 'monthly') =>
    axiosInstance.get(`/admin/dashboard/stats?targetPeriod=${period}`)
      .then(response => response.data),

  // Get monthly target details
  getMonthlyTarget: (period = 'monthly') =>
    axiosInstance.get(`/admin/dashboard/monthly-target?period=${period}`)
      .then(response => response.data),

  // Get revenue overview
  getRevenueOverview: (period = 'yearly') =>
    axiosInstance.get(`/admin/dashboard/revenue-overview?period=${period}`)
      .then(response => response.data),

  // Get recent orders
  getRecentOrders: (limit = 10) =>
    axiosInstance.get(`/admin/dashboard/recent-orders?limit=${limit}`)
      .then(response => response.data),

  // Get recent users
  getRecentUsers: (limit = 10) =>
    axiosInstance.get(`/admin/dashboard/recent-users?limit=${limit}`)
      .then(response => response.data),

  // Get performance metrics
  getPerformanceMetrics: () =>
    axiosInstance.get('/admin/dashboard/performance-metrics')
      .then(response => response.data),

  // Set monthly target
  setMonthlyTarget: (targetData) =>
    axiosInstance.post('/admin/dashboard/set-target', targetData)
      .then(response => response.data),

  // Get user growth data
  getUserGrowth: (period = 'weekly') =>
    axiosInstance.get(`/admin/dashboard/user-growth-progress?period=${period}`)
      .then(response => response.data),
};

export default dashboardApi;