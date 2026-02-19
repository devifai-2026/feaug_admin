// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import authApi from '../api/auth.api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authApi.getStoredUser();
        const token = authApi.getToken();
        
        if (token && storedUser) {
          // Optionally validate token by fetching user data
          // Uncomment this if you want to validate token on app load
          // try {
          //   const response = await authApi.getCurrentUser();
          //   setUser(response.data);
          // } catch (err) {
          //   // Token invalid, clear storage
          //   authApi.clearAuthData();
          //   setUser(null);
          // }
          setUser(storedUser);
        } else {
          // Clear any invalid data
          authApi.clearAuthData();
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        authApi.clearAuthData();
        setUser(null);
        setError("Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const data = await authApi.login({ email, password });
      const userData = data.data || data.user;
      
      if (userData) {
        setUser(userData);
        return {
          success: true,
          data: userData,
          message: data.message || "Login successful"
        };
      } else {
        throw new Error("No user data received");
      }
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      authApi.clearAuthData();
      setUser(null);
      
      return {
        success: false,
        error: errorMessage,
        status: err.status
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setError(null);
      authApi.clearAuthData();
    }
  };

  const register = async (userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const data = await authApi.register(userData);
      
      // Auto-login after registration if token is provided
      // if (data.token || data.data) {
      //   const userData = data.data || data.user;
      //   if (userData) {
      //     setUser(userData);
      //   }
      // }
      
      return {
        success: true,
        data,
        message: data.message || "Registration successful"
      };
    } catch (err) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        status: err.status
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const data = await authApi.updateProfile(userData);
      const updatedUser = data.data || data.user;
      
      if (updatedUser) {
        setUser(updatedUser);
      }
      
      return {
        success: true,
        data: updatedUser,
        message: data.message || "Profile updated successfully"
      };
    } catch (err) {
      const errorMessage = err.message || "Update failed";
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    setError(null);
    setLoading(true);
    
    try {
      const data = await authApi.updatePassword({
        currentPassword,
        newPassword
      });
      
      return {
        success: true,
        data,
        message: data.message || "Password updated successfully"
      };
    } catch (err) {
      const errorMessage = err.message || "Password update failed";
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUserData = async () => {
    if (!user) return null;
    
    try {
      const data = await authApi.getCurrentUser();
      const userData = data.data || data.user;
      
      if (userData) {
        setUser(userData);
        return userData;
      }
      return null;
    } catch (err) {
      console.error("Failed to refresh user data:", err);
      return null;
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateProfile,
    updatePassword,
    refreshUserData,
    isAuthenticated: !!user,
    loading,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};