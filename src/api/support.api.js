import axiosInstance from './axiosConfig';

const supportApi = {
  getAllTickets: (params = {}) => axiosInstance.get('/admin/support-tickets', { params }).then(res => res.data),
  getTicket: (id) => axiosInstance.get(`/admin/support-tickets/${id}`).then(res => res.data),
  updateTicket: (id, data) => axiosInstance.patch(`/admin/support-tickets/${id}`, data).then(res => res.data),
};

export default supportApi;
