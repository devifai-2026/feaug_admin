import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeftIcon,
  CheckIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useNavigate, Link } from 'react-router-dom'

import categoryApi from '../../api/categories.api'
import s3Api from '../../api/s3.api'
import { useToast } from '../../context/ToastContext'

const AddSubcategory = () => {

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [newImageUrl, setNewImageUrl] = useState('')
  const fileInputRef = useRef(null)

  const navigate = useNavigate()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    images: [],          // array of URLs
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
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'metaKeywords') {
      const keywords = value.split(',').map(k => k.trim()).filter(k => k)
      setFormData(prev => ({ ...prev, metaKeywords: keywords }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Add a URL manually
  const handleAddImageUrl = () => {
    const url = newImageUrl.trim()
    if (!url) return
    if (formData.images.includes(url)) {
      showToast('This image URL is already added', 'error')
      return
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, url] }))
    setNewImageUrl('')
  }

  // Remove an image by index
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // File upload — single or multiple files
  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validate
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith('image/')) {
        showToast(`"${files[i].name}" is not an image file`, 'error')
        return
      }
      if (files[i].size > 10 * 1024 * 1024) {
        showToast(`"${files[i].name}" exceeds 10MB limit`, 'error')
        return
      }
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      if (files.length === 1) {
        const result = await s3Api.uploadImage(files[0], 'banners', (percent) => {
          setUploadProgress(percent)
        })
        setFormData(prev => ({ ...prev, images: [...prev.images, result.url] }))
      } else {
        const result = await s3Api.uploadImages(files, 'banners', (percent) => {
          setUploadProgress(percent)
        })
        const urls = result.files.map(f => f.url)
        setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }))
      }
      showToast('Image(s) uploaded successfully', 'success')
    } catch (err) {
      console.error('Error uploading images:', err)
      showToast(err.response?.data?.message || 'Failed to upload image(s)', 'error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

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
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    min="0"
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Lower numbers appear first</p>
                </div>

                {/* Images Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <PhotoIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Images
                      {formData.images.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {formData.images.length}
                        </span>
                      )}
                    </h4>
                  </div>

                  {/* Paste URL */}
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <PhotoIcon className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                        placeholder="Paste image URL and click Add"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Upload area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white flex flex-col items-center justify-center py-6 px-4 hover:border-blue-400 transition-colors mb-4">
                    <ArrowUpTrayIcon className="h-6 w-6 text-blue-500 mb-2" />
                    <label className="cursor-pointer text-sm text-blue-600 font-semibold hover:text-blue-700 underline">
                      Click to upload one or more images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB each</p>

                    {uploading && (
                      <div className="mt-4 w-full max-w-xs">
                        <div className="flex justify-between text-xs font-medium text-blue-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Gallery */}
                  {formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((url, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                        >
                          <img
                            src={url}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center')
                            }}
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
                              title="Remove"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                          {/* Index badge */}
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-2">No images added yet</p>
                  )}
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