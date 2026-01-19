import axiosInstance from './axiosConfig';

const categoryApi = {
  // Get all categories with pagination, filtering and sorting
  getAllCategories: (params = {}) =>
    axiosInstance.get('/admin/categories', { params })
      .then(response => response.data),

  // Get category tree structure
  getCategoryTree: () =>
    axiosInstance.get('/admin/categories/tree')
      .then(response => response.data),

  // Create new category
  createCategory: (categoryData) =>
    axiosInstance.post('/admin/categories', categoryData)
      .then(response => response.data),

  // Update category
  updateCategory: (categoryId, updateData) =>
    axiosInstance.patch(`/admin/categories/${categoryId}`, updateData)
      .then(response => response.data),

  // Delete category
  deleteCategory: (categoryId) =>
    axiosInstance.delete(`/admin/categories/${categoryId}`)
      .then(response => response.data),

  // Get all subcategories
  getAllSubCategories: (params = {}) =>
    axiosInstance.get('/admin/subcategories', { params })
      .then(response => response.data),

  // Create new subcategory
  createSubCategory: (subCategoryData) =>
    axiosInstance.post('/admin/subcategories', subCategoryData)
      .then(response => response.data),

  // Update subcategory
  updateSubCategory: (subCategoryId, updateData) =>
    axiosInstance.patch(`/admin/subcategories/${subCategoryId}`, updateData)
      .then(response => response.data),

  // Delete subcategory
  deleteSubCategory: (subCategoryId) =>
    axiosInstance.delete(`/admin/subcategories/${subCategoryId}`)
      .then(response => response.data)
};

export default categoryApi;