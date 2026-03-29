import axiosInstance from './axiosConfig';

const updatesApi = {
  getAllUpdates: (params = {}) => axiosInstance.get('/admin/updates', { params }).then(res => res.data),
  getUpdate: (id) => axiosInstance.get(`/admin/updates/${id}`).then(res => res.data),
  createUpdate: (data) => axiosInstance.post('/admin/updates', data).then(res => res.data),
  updateUpdate: (id, data) => axiosInstance.patch(`/admin/updates/${id}`, data).then(res => res.data),
  deleteUpdate: (id) => axiosInstance.delete(`/admin/updates/${id}`).then(res => res.data),
};

export default updatesApi;
