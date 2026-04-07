import axiosInstance from './axiosConfig';

const supportApi = {
  getAllTickets: (params = {}) => axiosInstance.get('/contact/getAllContactSupport', { params }).then(res => res.data),
  getTicket: (id) => axiosInstance.get(`/contact/getContactSupport/${id}`).then(res => res.data),
  updateTicket: (id, data) => axiosInstance.patch(`/contact/updateContactSupport/${id}`, data).then(res => res.data),
  markAllTicketsAsRead: () => axiosInstance.patch('/contact/markAllAsRead').then(res => res.data),
};

export default supportApi;
