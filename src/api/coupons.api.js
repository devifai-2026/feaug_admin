import axiosInstance from './axiosConfig';

const couponApi = {
  // Get all coupons with pagination
  getAllCoupons: (params = {}) =>
    axiosInstance.get('/admin/coupons', { params })
      .then(response => response.data),

  // Get single coupon
  getCoupon: (couponId) =>
    axiosInstance.get(`/admin/coupons/${couponId}`)
      .then(response => response.data),

  // Create a new coupon
  createCoupon: (data) =>
    axiosInstance.post('/admin/coupons', data)
      .then(response => response.data),

  // Update a coupon
  updateCoupon: (couponId, data) =>
    axiosInstance.patch(`/admin/coupons/${couponId}`, data)
      .then(response => response.data),

  // Delete a coupon
  deleteCoupon: (couponId) =>
    axiosInstance.delete(`/admin/coupons/${couponId}`)
      .then(response => response.data),

  // Validate a coupon
  validateCoupon: (data) =>
    axiosInstance.post('/admin/coupons/validate', data)
      .then(response => response.data),

  // Get coupon usage statistics
  getCouponUsage: (couponId) =>
    axiosInstance.get(`/admin/coupons/${couponId}/usage`)
      .then(response => response.data),
};

export default couponApi;
