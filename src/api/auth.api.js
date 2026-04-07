// src/api/auth.api.js
import axiosInstance from './axiosConfig';

// Note: Adjust the endpoints based on your actual backend routes
// If your backend doesn't have /api/v1 prefix, update axiosConfig.js

const authApi = {
  // Register a new user
  register: (userData) => 
    axiosInstance.post('/auth/register', userData)
      .then(response => response.data),

  // Login user
  login: (credentials) => 
    axiosInstance.post('/auth/login', credentials)
      .then(response => {
        // Store token if provided in response
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Store user data if provided
        if (response.data.data) {
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        
        return response.data;
      }),

  // Forgot password - sends 6-digit OTP to email
  forgotPassword: (email) =>
    axiosInstance.post('/auth/forgot-password', { email })
      .then(response => response.data),

  // Verify reset OTP
  verifyResetOtp: (email, otp) =>
    axiosInstance.post('/auth/verify-reset-otp', { email, otp })
      .then(response => response.data),

  // Reset password - re-verifies OTP, sets new password, returns JWT
  resetPassword: (email, otp, password) =>
    axiosInstance.post('/auth/reset-password', { email, otp, password })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        if (response.data.data) {
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        return response.data;
      }),

  // Verify email
  verifyEmail: (token) => 
    axiosInstance.get(`/auth/verify-email/${token}`)
      .then(response => response.data),

  // Resend verification email
  resendVerification: (email) => 
    axiosInstance.post('/auth/resend-verification', { email })
      .then(response => response.data),

  // Verify OTP
  verifyOTP: (data) => 
    axiosInstance.post('/auth/verify-otp', data)
      .then(response => response.data),

  // Logout
  logout: () => 
    axiosInstance.post('/auth/logout')
      .then(response => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return response.data;
      })
      .catch(error => {
        // Still clear local storage even if API call fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw error;
      }),

  // Get current user
  getCurrentUser: () => 
    axiosInstance.get('/auth/me')
      .then(response => {
        // Update stored user data
        if (response.data.data) {
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        return response.data;
      }),

  // Update user profile
  updateProfile: (userData) => 
    axiosInstance.patch('/auth/update-me', userData)
      .then(response => {
        // Update stored user data
        if (response.data.data) {
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        return response.data;
      }),

  // Update password
  updatePassword: (passwords) => 
    axiosInstance.patch('/auth/update-password', passwords)
      .then(response => response.data),

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken: () => localStorage.getItem('token'),

  // Clear all auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authApi;