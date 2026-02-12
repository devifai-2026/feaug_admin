import axiosInstance from './axiosConfig';

const bannerApi = {
  // Get all banners
  getAllBanners: (params = {}) =>
    axiosInstance.get('/admin/banners', { params })
      .then(response => response.data),

  // Get single banner
  getBanner: (bannerId) =>
    axiosInstance.get(`/admin/banners/${bannerId}`)
      .then(response => response.data),

  // Get banners by page
  getBannersByPage: (page) =>
    axiosInstance.get(`/admin/banners/page/${page}`)
      .then(response => response.data),

  // Create a new banner
  createBanner: (data) =>
    axiosInstance.post('/admin/banners', data)
      .then(response => response.data),

  // Update a banner
  updateBanner: (bannerId, data) =>
    axiosInstance.patch(`/admin/banners/${bannerId}`, data)
      .then(response => response.data),

  // Delete a banner
  deleteBanner: (bannerId) =>
    axiosInstance.delete(`/admin/banners/${bannerId}`)
      .then(response => response.data),

  // Upload banner image
  uploadBannerImage: (bannerId, formData) =>
    axiosInstance.post(`/admin/banners/${bannerId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(response => response.data),
};

export default bannerApi;
