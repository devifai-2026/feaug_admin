import axiosInstance from './axiosConfig';

const stockApi = {
  // Get stock history
  getStockHistory: (params = {}) =>
    axiosInstance.get('/admin/stock/history', { params })
      .then(response => response.data),

  // Get stock statistics
  getStockStatistics: () =>
    axiosInstance.get('/admin/stock/statistics')
      .then(response => response.data),

  // Bulk update stock
  bulkUpdateStock: (data) =>
    axiosInstance.post('/admin/stock/bulk-update', data)
      .then(response => response.data),

  // Get stock alerts
  getStockAlerts: (params = {}) =>
    axiosInstance.get('/admin/stock/alerts', { params })
      .then(response => response.data),

  // Export stock report
  exportStockReport: (params = {}) =>
    axiosInstance.get('/admin/stock/export', {
      params,
      responseType: 'blob'
    }),

  // Download stock report
  downloadStockReport: async (params = {}) => {
    const response = await axiosInstance.get('/admin/stock/export', {
      params,
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stock-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  },
};

export default stockApi;
