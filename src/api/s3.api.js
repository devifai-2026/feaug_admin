// api/s3.api.js
import axiosInstance from './axiosConfig';

const s3Api = {
  // Upload single image via backend (multipart form data)
  uploadImage: async (file, folder = 'general', onProgress) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosInstance.post(`/admin/upload?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress(percent);
        }
      },
    });

    return response.data.data; // { url, key, size, contentType }
  },

  // Upload multiple images via backend
  uploadImages: async (files, folder = 'general', onProgress) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    const response = await axiosInstance.post(`/admin/upload-multiple?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress(percent);
        }
      },
    });

    return response.data.data; // { files: [{ url, key, size, contentType }] }
  },
};

export default s3Api;
