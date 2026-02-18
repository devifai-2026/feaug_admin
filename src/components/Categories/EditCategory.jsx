import { useState, useEffect } from 'react'
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Sidebar from '../Sidebar'
import Navbar from '../Navbar'
import categoryApi from '../../api/categories.api'
import s3Api from '../../api/s3.api'
import { useToast } from '../../context/ToastContext'

const EditCategory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [parentCategories, setParentCategories] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [s3UploadError, setS3UploadError] = useState(null)

  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    image: '',
    icon: '',
    displayOrder: 0,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: []
  })

  useEffect(() => {
    fetchCategory()
    fetchParentCategories()
  }, [id])

  useEffect(() => {
    // Create preview for new image file
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile)
      setImagePreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [imageFile])

  const fetchCategory = async () => {
    try {
      setFetching(true)
      const response = await categoryApi.getAllCategories()
      const category = response.data.categories.find(cat => cat._id === id)

      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          parentCategory: category.parentCategory?._id || '',
          image: category.image || '',
          icon: category.icon || '',
          displayOrder: category.displayOrder || 0,
          isActive: category.isActive ?? true,
          metaTitle: category.metaTitle || '',
          metaDescription: category.metaDescription || '',
          metaKeywords: category.metaKeywords || []
        })
      } else {
        setError('Category not found')
      }
    } catch (err) {
      setError('Failed to fetch category details')
      showToast('Failed to load category', 'error')
    } finally {
      setFetching(false)
    }
  }

  const fetchParentCategories = async () => {
    try {
      const response = await categoryApi.getAllCategories()
      // Filter out current category from parent options
      const parents = response.data.categories.filter(cat => cat._id !== id)
      setParentCategories(parents)
    } catch (err) {
      console.error('Failed to fetch parent categories:', err)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error')
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Image size must be less than 5MB', 'error')
        return
      }

      setImageFile(file)
      setS3UploadError(null)
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

    try {
      setLoading(true)
      setIsUploading(true)
      setError(null)

      let imageUrl = formData.image

      // Upload new image if selected
      if (imageFile) {
        try {
          setUploadProgress(20)
          const { presignedUrl, fileUrl } = await s3Api.getPresignedUrl(
            imageFile.name,
            imageFile.type
          )

          setUploadProgress(40)
          await s3Api.uploadToS3(presignedUrl, imageFile, (progress) => {
            setUploadProgress(40 + (progress * 0.4))
          })

          imageUrl = fileUrl
          setUploadProgress(80)
        } catch (uploadError) {
          console.error('S3 upload error:', uploadError)
          throw new Error('Failed to upload image')
        }
      }

      setUploadProgress(90)
      const dataToSubmit = { ...formData, image: imageUrl }
      await categoryApi.updateCategory(id, dataToSubmit)

      setUploadProgress(100)
      showToast('Category updated successfully', 'success')
      navigate('/categories')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update category'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  if (fetching) {
    return (
      <div className="flex h-screen">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      to="/categories"
                      className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeftIcon className="h-5 w-5 mr-1" />
                      Back to Categories
                    </Link>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
                  <p className="text-gray-600">Update category details and settings</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {(loading || isUploading) && (
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-blue-700">
                    {uploadProgress < 100 ? 'Processing...' : 'Complete!'}
                  </span>
                  <span className="text-blue-600 font-bold">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parent Category
                        </label>
                        <select
                          name="parentCategory"
                          value={formData.parentCategory}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">No Parent (Root Category)</option>
                          {parentCategories.map(category => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
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
                          placeholder="Describe this category..."
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
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Icon
                        </label>
                        <input
                          type="text"
                          name="icon"
                          value={formData.icon}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Icon class or name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Image
                        </label>
                        <div className="flex items-start gap-4">
                          {(imagePreview || formData.image) && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={imagePreview || formData.image}
                                alt="Category"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={loading || isUploading}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Upload new image to replace current one (Max 5MB)
                            </p>
                          </div>
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

                  {/* SEO Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
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
                      onClick={() => navigate('/categories')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || isUploading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading || isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isUploading ? 'Uploading...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EditCategory