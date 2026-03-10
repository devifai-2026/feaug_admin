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

  // =====================================================
  // SHIPROCKET INTEGRATION
  // =====================================================

  // Create Shiprocket shipment
  createShipment: (orderId, data = {}) =>
    axiosInstance.post(`/admin/orders/${orderId}/create-shipment`, data)
      .then(response => response.data),

  // Get available couriers for order
  getAvailableCouriers: (orderId, weight) =>
    axiosInstance.get(`/admin/orders/${orderId}/available-couriers`, {
      params: { weight }
    })
      .then(response => response.data),

  // Generate AWB (Air Waybill)
  generateAWB: (orderId, courierId) =>
    axiosInstance.post(`/admin/orders/${orderId}/generate-awb`, { courierId })
      .then(response => response.data),

  // Schedule pickup
  schedulePickup: (orderId) =>
    axiosInstance.post(`/admin/orders/${orderId}/schedule-pickup`)
      .then(response => response.data),

  // Track shipment
  trackShipment: (orderId) =>
    axiosInstance.get(`/admin/orders/${orderId}/track-shipment`)
      .then(response => response.data),

  // Cancel shipment
  cancelShipment: (orderId, reason) =>
    axiosInstance.post(`/admin/orders/${orderId}/cancel-shipment`, { reason })
      .then(response => response.data),

  // Get shipping label
  getShippingLabel: (orderId) =>
    axiosInstance.get(`/admin/orders/${orderId}/shipping-label`)
      .then(response => response.data),

  // Get shipping charges estimate
  getShippingCharges: (orderId, dimensions) =>
    axiosInstance.post(`/admin/orders/${orderId}/shipping-charges`, dimensions)
      .then(response => response.data),

  // Generate manifest for multiple orders
  generateManifest: (orderIds) =>
    axiosInstance.post('/admin/orders/generate-manifest', { orderIds })
      .then(response => response.data),

  // Retry automated shipment process (for stuck/failed shipments with no AWB)
  retryShipment: (orderId) =>
    axiosInstance.post(`/admin/orders/${orderId}/retry-shipment`)
      .then(response => response.data),

  // Manually update AWB / tracking details
  updateAWB: (orderId, data) =>
    axiosInstance.patch(`/admin/orders/${orderId}/update-awb`, data)
      .then(response => response.data),
};

export default orderApi;