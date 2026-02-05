import axiosInstance from './axiosConfig';

export const getAllPromoCodes = async () => {
  const response = await axiosInstance.get('/admin/promo-codes');
  return response.data;
};

export const createPromoCode = async (data) => {
  const response = await axiosInstance.post('/admin/promo-codes', data);
  return response.data;
};

export const updatePromoCode = async (id, data) => {
  const response = await axiosInstance.patch(`/admin/promo-codes/${id}`, data);
  return response.data;
};

export const deletePromoCode = async (id) => {
  const response = await axiosInstance.delete(`/admin/promo-codes/${id}`);
  return response.data;
};
