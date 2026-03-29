import axiosInstance from './axiosConfig';

const featuredApi = {
  getConfig: () => axiosInstance.get('/admin/featured-config').then(res => res.data),
  updateConfig: (data) => axiosInstance.patch('/admin/featured-config', data).then(res => res.data),
};

export default featuredApi;
