import axiosInstance from './axiosConfig';

const orderApi = {
  // Get all orders with pagination, filtering and sorting
  getAllOrders: (params = {}) =>
    axiosInstance.get('/admin/orders', { params })
      .then(response => response.data),

  // Get single order details
  getOrder: (orderId) =>
    axiosInstance.get(`/admin/orders/${orderId}`)
      .then(response => response.data),

  // Update order status
  updateOrderStatus: (orderId, data) =>
    axiosInstance.patch(`/admin/orders/${orderId}/status`, data)
      .then(response => response.data),

  // Update shipping status
  updateShippingStatus: (orderId, data) =>
    axiosInstance.patch(`/admin/orders/${orderId}/shipping-status`, data)
      .then(response => response.data),

  // Update payment status
  updatePaymentStatus: (orderId, data) =>
    axiosInstance.patch(`/admin/orders/${orderId}/payment-status`, data)
      .then(response => response.data),

  // Get order statistics
  getOrderStatistics: (params = {}) =>
    axiosInstance.get('/admin/orders/statistics', { params })
      .then(response => response.data),

  // Create manual order
  createManualOrder: (data) =>
    axiosInstance.post('/admin/orders/manual', data)
      .then(response => response.data),

  // Export orders
  exportOrders: (params = {}) =>
    axiosInstance.get('/admin/orders/export', { params })
      .then(response => response.data),

  // Bulk update orders status
  bulkUpdateOrders: (data) =>
    axiosInstance.post('/admin/orders/bulk-update', data)
      .then(response => response.data),

  // Get order timeline/history
  getOrderTimeline: (orderId) =>
    axiosInstance.get(`/admin/orders/${orderId}/timeline`)
      .then(response => response.data),

  // Search orders
  searchOrders: (query) =>
    axiosInstance.get(`/admin/orders/search?q=${query}`)
      .then(response => response.data),

  // Get recent activities
  getRecentActivities: () =>
    axiosInstance.get('/admin/orders/recent-activities')
      .then(response => response.data),

  // Generate invoice PDF
  generateInvoice: (orderId) =>
    axiosInstance.get(`/admin/orders/${orderId}/invoice`, {
      responseType: 'blob'
    }),

  // Send invoice via email
  sendInvoiceEmail: (orderId, emailData) =>
    axiosInstance.post(`/admin/orders/${orderId}/send-invoice`, emailData)
      .then(response => response.data),

  // Get orders by status count
  getOrdersByStatusCount: () =>
    axiosInstance.get('/admin/orders/status-count')
      .then(response => response.data),
};

export default orderApi;