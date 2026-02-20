import axiosInstance from './axiosConfig';

const productApi = {
  // Get all products with pagination, filtering and sorting
  getAllProducts: (params = {}) =>
    axiosInstance.get('/admin/products', { params })
      .then(response => response.data),

  createProduct: (data) =>
    axiosInstance.post('/admin/products', data)
      .then(response => response.data),

  // Get single product
  getProduct: (productId) =>
    axiosInstance.get(`/admin/products/${productId}`)
      .then(response => response.data),

  // Update a product
  updateProduct: (productId, data) =>
    axiosInstance.patch(`/admin/products/${productId}`, data)
      .then(response => response.data),

  // Delete a product
  deleteProduct: (productId) =>
    axiosInstance.delete(`/admin/products/${productId}`)
      .then(response => response.data),

  // Get low stock products
  getLowStockProducts: (params = {}) =>
    axiosInstance.get('/admin/products/low-stock', { params })
      .then(response => response.data),

  // Get out of stock products
  getOutOfStockProducts: (params = {}) =>
    axiosInstance.get('/admin/products/out-of-stock', { params })
      .then(response => response.data),

  // Bulk update products
  bulkUpdateProducts: (data) =>
    axiosInstance.post('/admin/products/bulk-update', data)
      .then(response => response.data),

  // Upload product images
  uploadProductImages: (productId, formData) =>
    axiosInstance.post(`/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(response => response.data),

  // Set primary image
  setPrimaryImage: (imageId) =>
    axiosInstance.patch(`/admin/products/images/${imageId}/set-primary`)
      .then(response => response.data),

  // Delete product image
  deleteProductImage: (imageId) =>
    axiosInstance.delete(`/admin/products/images/${imageId}`)
      .then(response => response.data),

  // Get stock history for a product
  getStockHistory: (productId, params = {}) =>
    axiosInstance.get(`/admin/products/${productId}/stock-history`, { params })
      .then(response => response.data),

  // Update product stock
  updateStock: (productId, data) =>
    axiosInstance.patch(`/admin/products/${productId}/stock`, data)
      .then(response => response.data),

  // Restock a product (add quantity)
  restockProduct: (productId, quantity, note = '') =>
    axiosInstance.patch(`/admin/products/${productId}/stock`, {
      type: 'stock_in',
      quantity,
      reason: 'Manual restock',
      notes: note,
    }).then(response => response.data),
};

export default productApi;
