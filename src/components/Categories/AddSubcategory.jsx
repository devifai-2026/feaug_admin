import { useState, useEffect } from 'react'
import {
  ArrowLeftIcon,
  CheckIcon,
  PhotoIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { useNavigate, Link } from 'react-router-dom'

import categoryApi from '../../api/categories.api'
import { useToast } from '../../context/ToastContext'

const AddSubcategory = () => {

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  const navigate = useNavigate()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: '',
    icon: '',
    displayOrder: 0,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: []
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setFetching(true)
      const response = await categoryApi.getAllCategories()
      setCategories(response.data.categories || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      showToast('Failed to load categories', 'error')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else if (name === 'metaKeywords') {
      const keywords = value.split(',').map(k => k.trim()).filter(k => k)
      setFormData(prev => ({
        ...prev,
        metaKeywords: keywords
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      setError('Subcategory name is required')
      showToast('Subcategory name is required', 'error')
      return
    }

    if (!formData.category) {
      setError('Please select a parent category')
      showToast('Please select a parent category', 'error')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await categoryApi.createSubCategory(formData)

      showToast('Subcategory created successfully', 'success')
      navigate('/subcategories')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create subcategory'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to="/subcategories"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" />
                  Back to Subcategories
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Subcategory</h1>
              <p className="text-gray-600">Create a new subcategory for your products</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Add Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter subcategory name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={fetching}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {fetching && (
                      <p className="mt-1 text-sm text-gray-500">Loading categories...</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe this subcategory..."
                    />
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">Lower numbers appear first</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {formData.icon ? (
                          <span className="text-gray-600">{formData.icon}</span>
                        ) : (
                          <FolderIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="text"
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Icon name or emoji"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="h-full w-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentElement.innerHTML = '<PhotoIcon className="h-5 w-5 text-gray-400" />'
                            }}
                          />
                        ) : (
                          <PhotoIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active (Visible to customers)
                  </label>
                </div>
              </div>

              {/* SEO Settings (Optional) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Meta title for SEO"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Meta description for SEO"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords.join(', ')}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="mt-1 text-sm text-gray-500">Separate keywords with commas</p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/subcategories')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Create Subcategory
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddSubcategory