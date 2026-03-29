import axiosInstance from './axiosConfig';

const bestSellerApi = {
  getConfig: () => axiosInstance.get('/admin/best-sellers-config').then(res => res.data),
  updateConfig: (data) => axiosInstance.patch('/admin/best-sellers-config', data).then(res => res.data),
};

export default bestSellerApi;
