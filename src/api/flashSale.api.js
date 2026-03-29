import axiosInstance from './axiosConfig';

const flashSaleApi = {
  getAllFlashSales: (params = {}) => axiosInstance.get('/admin/flash-sales', { params }).then(res => res.data),
  getFlashSale: (id) => axiosInstance.get(`/admin/flash-sales/${id}`).then(res => res.data),
  createFlashSale: (data) => axiosInstance.post('/admin/flash-sales', data).then(res => res.data),
  updateFlashSale: (id, data) => axiosInstance.patch(`/admin/flash-sales/${id}`, data).then(res => res.data),
  deleteFlashSale: (id) => axiosInstance.delete(`/admin/flash-sales/${id}`).then(res => res.data),
};

export default flashSaleApi;
