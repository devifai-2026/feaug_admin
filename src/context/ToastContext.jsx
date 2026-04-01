// context/ToastContext.jsx
import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const options = { duration };
    
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.error(message, { ...options, icon: '⚠️' });
        break;
      case 'info':
      default:
        toast(message, options);
        break;
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};