// src/api/axiosConfig.js
import axios from 'axios';

// Base configuration.
// Set VITE_API_URL to the backend origin (no trailing slash, no /api/v1) —
// e.g. https://feauage-backend.onrender.com. Falls back to local dev.
const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_BASE_URL = `${API_ORIGIN.replace(/\/+$/, '')}/api/v1`;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network Error. Please check your connection.',
        status: 0,
      });
    }

    const { status, data } = error.response;
    
    // Handle specific status codes
    switch (status) {
      case 401:
        // Token expired or invalid
        if (data.message === 'jwt expired' || data.message === 'Invalid token') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        break;
      case 403:
        console.error('Forbidden:', data.message);
        break;
      case 404:
        console.error('Not Found:', data.message);
        break;
      case 500:
        console.error('Server Error:', data.message);
        break;
      default:
        console.error('Error:', data.message);
    }
    
    return Promise.reject({
      message: data.message || 'Something went wrong',
      status,
      data: data.data || null,
    });
  }
);

export default axiosInstance;