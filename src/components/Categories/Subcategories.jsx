import { useState, useEffect } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import subCategoryApi from '../../api/categories.api'
import { useToast } from '../../context/ToastContext'

const Subcategories = () => {

  const [subcategories, setSubcategories] = useState([])
  const [filteredSubcategories, setFilteredSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Get category ID from URL query params
  const queryParams = new URLSearchParams(location.search)
  const categoryId = queryParams.get('category')

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId)
    } else {
      fetchAllSubcategories()
    }
  }, [categoryId])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSubcategories(subcategories)
    } else {
      const filtered = subcategories.filter(subcat =>
        subcat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subcat.description && subcat.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredSubcategories(filtered)
    }
  }, [searchTerm, subcategories])

  const fetchSubcategories = async (catId) => {
    try {
      setLoading(true)
      setError(null)

      // First get the category details
      // const category = await categoryApi.getCategory(catId)
      // setSelectedCategory(category.data.category)

      // Then get subcategories for this category
      const response = await subCategoryApi.getAllSubCategories({ category: catId })
      setSubcategories(response.data.subCategories || [])
      setFilteredSubcategories(response.data.subCategories || [])
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch subcategories'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSubcategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await subCategoryApi.getAllSubCategories()
      setSubcategories(response.data.subCategories || [])
      setFilteredSubcategories(response.data.subCategories || [])
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch subcategories'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return
    }

    try {
      await subCategoryApi.deleteSubCategory(id)

      const updatedSubcategories = subcategories.filter(subcat => subcat._id !== id)
      setSubcategories(updatedSubcategories)

      showToast('Subcategory deleted successfully', 'success')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete subcategory'

      if (errorMessage.includes('products')) {
        showToast('Cannot delete subcategory with associated products', 'error')
      } else {
        showToast(errorMessage, 'error')
      }
    }
  }

  const handleAddProduct = (subcategoryId) => {
    navigate(`/products/add?subcategory=${subcategoryId}`)
  }



  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {categoryId && (
                  <button
                    onClick={() => navigate('/categories')}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Back to Categories
                  </button>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCategory ? `${selectedCategory.name} - Subcategories` : 'All Subcategories'}
              </h1>
              <p className="text-gray-600">Manage subcategories and their products</p>
              <div className="mt-2 text-sm text-gray-500">
                Total: {subcategories.length} subcategories
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={categoryId ? () => fetchSubcategories(categoryId) : fetchAllSubcategories}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Refresh
              </button>
              <Link
                to="/subcategories/add"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Subcategory
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subcategories..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-600">×</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subcategories...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={categoryId ? () => fetchSubcategories(categoryId) : fetchAllSubcategories}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Subcategories List */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subcategory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubcategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No subcategories found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? `No results for "${searchTerm}"` : 'Add your first subcategory'}
                      </p>
                      <Link
                        to="/subcategories/add"
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Subcategory
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredSubcategories.map((subcategory) => (
                    <tr key={subcategory._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                            <FolderIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{subcategory.name}</div>
                            <div className="text-sm text-gray-500">
                              {subcategory.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {subcategory.category && (
                          <div className="text-sm text-gray-900">
                            {typeof subcategory.category === 'object'
                              ? subcategory.category.name
                              : '—'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{subcategory.productCount || 0}</span>
                          {subcategory.productCount > 0 && (
                            <button
                              onClick={() => handleAddProduct(subcategory._id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Add More
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${subcategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {subcategory.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/subcategories/edit/${subcategory._id}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            className={`${subcategory.productCount > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                            title={subcategory.productCount > 0 ? 'Cannot delete subcategory with products' : 'Delete'}
                            onClick={() => handleDeleteSubcategory(subcategory._id)}
                            disabled={subcategory.productCount > 0}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Subcategories