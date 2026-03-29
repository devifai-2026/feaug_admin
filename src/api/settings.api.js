import axiosInstance from './axiosConfig';

const settingsApi = {
  getSettings: () => axiosInstance.get('/admin/settings').then(res => res.data),
  updateSettings: (data) => axiosInstance.patch('/admin/settings', data).then(res => res.data),
};

export default settingsApi;
