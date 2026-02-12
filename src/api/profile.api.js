import axiosInstance from './axiosConfig';

const profileApi = {
  // Get current admin profile
  getProfile: async () => {
    const response = await axiosInstance.get('/admin/profile');
    return response.data;
  },

  // Update admin profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.patch('/admin/profile', profileData);
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await axiosInstance.patch('/admin/profile/password', passwordData);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (imageUrl) => {
    const response = await axiosInstance.post('/admin/profile/image', { imageUrl });
    return response.data;
  },

  // Delete profile image
  deleteProfileImage: async () => {
    const response = await axiosInstance.delete('/admin/profile/image');
    return response.data;
  },

  // Get activity log
  getActivityLog: async (params = {}) => {
    const response = await axiosInstance.get('/admin/profile/activity', { params });
    return response.data;
  },
};

export default profileApi;
