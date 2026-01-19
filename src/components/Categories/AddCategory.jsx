import { useState, useEffect } from 'react'
import { 
  ArrowLeftIcon,
  CheckIcon,
  PhotoIcon,
  XMarkIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../Sidebar'
import Navbar from '../Navbar'
import categoryApi from '../../api/categories.api'
import s3Api from '../../api/s3.api'
import { useToast } from '../../context/ToastContext'

const AddCategory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [imagePreview, setImagePreview] = useState(null)
  const [keywordInput, setKeywordInput] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [s3UploadError, setS3UploadError] = useState(null)
  
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: []
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Create preview for image file
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile)
      setImagePreview(objectUrl)
      
      // Clean up the object URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setImagePreview(null)
    }
  }, [imageFile])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else if (type === 'file') {
      const file = e.target.files[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({ ...prev, image: 'Please select an image file' }))
          return
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
          return
        }
        
        setImageFile(file)
        setS3UploadError(null) // Clear any previous S3 errors
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    // Image is required - must upload a file
    if (!imageFile) {
      newErrors.image = 'Please upload an image'
    }
    
    if (formData.displayOrder === '' || formData.displayOrder < 0) {
      newErrors.displayOrder = 'Display order is required and must be 0 or greater'
    }
    
    if (!formData.metaTitle.trim()) {
      newErrors.metaTitle = 'Meta title is required'
    }
    
    if (!formData.metaDescription.trim()) {
      newErrors.metaDescription = 'Meta description is required'
    }
    
    if (formData.metaKeywords.length === 0) {
      newErrors.metaKeywords = 'At least one meta keyword is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim()
    if (keyword && !formData.metaKeywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        metaKeywords: [...prev.metaKeywords, keyword]
      }))
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter((_, i) => i !== index)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddKeyword()
    }
  }

  // Test S3 upload separately
  const testS3Upload = async () => {
    if (!imageFile) {
      showToast('Please select an image first', 'error')
      return
    }
    
    try {
      console.log('Testing S3 upload with file:', imageFile)
      
      // Get presigned URL
      const { presignedUrl, fileUrl } = await s3Api.getPresignedUrl(
        imageFile.name,
        imageFile.type
      )
      
      console.log('Got presigned URL:', presignedUrl)
      console.log('File will be available at:', fileUrl)
      
      // Upload to S3
      await s3Api.uploadToS3(presignedUrl, imageFile, (progress) => {
        console.log('Upload progress:', progress + '%')
      })
      
      console.log('Upload complete!')
      showToast('S3 upload test successful! URL: ' + fileUrl, 'success')
      
    } catch (error) {
      console.error('S3 test failed:', error)
      showToast('S3 test failed: ' + error.message, 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('Please fill all required fields', 'error')
      return
    }

    try {
      setLoading(true)
      setIsUploading(true)
      setUploadProgress(10) // Start at 10% for form validation
      setS3UploadError(null)
      
      let imageUrl = ''
      
      // Step 1: Upload image to S3 (only when form is submitted)
      if (imageFile) {
        try {
          console.log('Starting S3 upload process...')
          
          // Show progress
          setUploadProgress(20) // 20% - Starting S3 process
          
          // Get presigned URL from backend
          console.log('Getting presigned URL for:', imageFile.name, imageFile.type)
          const { presignedUrl, fileUrl } = await s3Api.getPresignedUrl(
            imageFile.name,
            imageFile.type
          )
          
          console.log('Presigned URL received:', presignedUrl)
          console.log('File URL will be:', fileUrl)
          
          setUploadProgress(40) // 40% - Got presigned URL
          
          // Upload to S3 with progress tracking
          console.log('Uploading to S3...')
          await s3Api.uploadToS3(presignedUrl, imageFile, (progress) => {
            // Map progress from 40-80% for S3 upload
            const mappedProgress = 40 + (progress * 0.4)
            setUploadProgress(mappedProgress)
          })
          
          setUploadProgress(80) // 80% - S3 upload complete
          imageUrl = fileUrl
          
          console.log('Image uploaded to S3 successfully:', imageUrl)
          
        } catch (uploadError) {
          console.error('S3 upload error:', uploadError)
          setS3UploadError(uploadError.message || 'Failed to upload image')
          showToast('Failed to upload image. Please try again.', 'error')
          setLoading(false)
          setIsUploading(false)
          setUploadProgress(0)
          return
        }
      }
      
      // Step 2: Prepare and send category data to backend
      const submitData = {
        name: formData.name,
        description: formData.description,
        displayOrder: parseInt(formData.displayOrder),
        isActive: formData.isActive,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        metaKeywords: JSON.stringify(formData.metaKeywords),
        image: imageUrl, // Send as 'image' not 'imageUrl'
      }
      
      console.log('Submitting category data:', submitData)
      
      setUploadProgress(90) // 90% - Preparing API request
      
      // Step 3: Create category in database
      const response = await categoryApi.createCategory(submitData)
      
      console.log('Category created successfully:', response)
      
      setUploadProgress(100) // 100% - Complete
      
      showToast('Category created successfully!', 'success')
      
      // Wait a moment to show completion, then redirect
      setTimeout(() => {
        navigate('/categories')
      }, 1000)
      
    } catch (err) {
      console.error('Full error details:', err)
      console.error('Error response:', err.response)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create category'
      showToast(errorMessage, 'error')
      setUploadProgress(0)
    } finally {
      setLoading(false)
      setIsUploading(false)
    }
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: DocumentTextIcon },
    { id: 'image', name: 'Image', icon: PhotoIcon },
    { id: 'display', name: 'Display', icon: EyeIcon },
    { id: 'seo', name: 'SEO', icon: MagnifyingGlassIcon },
  ]

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  // Truncate description for preview
  const truncateDescription = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link to="/categories" className="text-gray-500 hover:text-gray-700">
                    Categories
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Add New Category</li>
              </ol>
            </nav>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="lg:w-2/3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Form Header */}
                  <div className="px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
                        <p className="text-gray-600 mt-1">All fields are required <span className="text-red-500">*</span></p>
                      </div>
                      <Link
                        to="/categories"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                      </Link>
                    </div>
                  </div>

                  {/* Overall Progress Bar */}
                  {(loading || isUploading) && (
                    <div className="px-8 py-4 border-b border-gray-200 bg-blue-50">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-blue-700">
                          {uploadProgress < 100 ? 'Processing...' : 'Complete!'}
                        </span>
                        <span className="text-blue-600 font-bold">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600">
                        {uploadProgress < 30 && 'Validating form...'}
                        {uploadProgress >= 30 && uploadProgress < 80 && 'Uploading image to S3...'}
                        {uploadProgress >= 80 && uploadProgress < 100 && 'Creating category in database...'}
                        {uploadProgress === 100 && 'Redirecting...'}
                      </div>
                    </div>
                  )}

                  {/* Tab Navigation */}
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-8" aria-label="Tabs">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                            flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                          `}
                          disabled={loading || isUploading}
                        >
                          <tab.icon className="h-5 w-5" />
                          {tab.name}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Form Content */}
                  <form onSubmit={handleSubmit} className="p-8">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Category Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading || isUploading}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.name ? 'border-red-300' : 'border-gray-300'
                            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            placeholder="e.g., Electronics, Clothing, Home & Garden"
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                          )}
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              A descriptive name for your category
                            </p>
                            <span className="text-xs text-gray-500">
                              {formData.name.length}/100
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            required
                            disabled={loading || isUploading}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.description ? 'border-red-300' : 'border-gray-300'
                            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            placeholder="Describe what products belong in this category..."
                          />
                          {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                          )}
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              Detailed description of the category
                            </p>
                            <span className="text-xs text-gray-500">
                              {formData.description.length}/500
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Tab - Only file upload, no URL input */}
                    {activeTab === 'image' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-4">
                            Category Image <span className="text-red-500">*</span>
                          </label>
                          
                          <div className="flex flex-col lg:flex-row gap-8">
                            {/* Upload Area */}
                            <div className="lg:w-1/2">
                              <div className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
                                errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                              } ${loading || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="flex flex-col items-center justify-center text-center">
                                  <PhotoIcon className={`h-12 w-12 mb-4 ${
                                    errors.image ? 'text-red-400' : 'text-gray-400'
                                  }`} />
                                  <p className="text-sm font-medium text-gray-900 mb-1">
                                    Click to upload image
                                  </p>
                                  <p className="text-xs text-gray-500 mb-4">
                                    PNG, JPG, GIF up to 5MB
                                  </p>
                                  <input
                                    type="file"
                                    id="image-upload"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="hidden"
                                    disabled={loading || isUploading}
                                  />
                                  <label
                                    htmlFor="image-upload"
                                    className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                                      loading || isUploading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    Choose File
                                  </label>
                                </div>
                              </div>
                              {errors.image && (
                                <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                              )}
                              <p className="mt-4 text-sm text-gray-600">
                                <InformationCircleIcon className="h-4 w-4 inline-block mr-1" />
                                Image will be uploaded to S3 when you submit the form
                              </p>
                            </div>

                            {/* Preview */}
                            <div className="lg:w-1/2">
                              {imagePreview ? (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                      Image Preview
                                    </label>
                                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                      <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setImagePreview(null)
                                      setImageFile(null)
                                    }}
                                    disabled={loading || isUploading}
                                    className="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Remove Image
                                  </button>
                                </div>
                              ) : (
                                <div className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center ${
                                  errors.image ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                }`}>
                                  <div className="text-center">
                                    <PhotoIcon className={`h-16 w-16 mx-auto mb-3 ${
                                      errors.image ? 'text-red-400' : 'text-gray-300'
                                    }`} />
                                    <p className={`text-sm ${
                                      errors.image ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                      {errors.image ? 'Please upload an image' : 'No image selected'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      Image required for category
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display Tab */}
                    {activeTab === 'display' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Display Order <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="displayOrder"
                              value={formData.displayOrder}
                              onChange={handleChange}
                              min="0"
                              step="1"
                              required
                              disabled={loading || isUploading}
                              className={`w-full px-4 py-3 rounded-lg border ${
                                errors.displayOrder ? 'border-red-300' : 'border-gray-300'
                              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            />
                            {errors.displayOrder && (
                              <p className="mt-1 text-sm text-red-600">{errors.displayOrder}</p>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Categories are sorted by this number (0 = highest priority)
                          </p>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              id="isActive"
                              name="isActive"
                              checked={formData.isActive}
                              onChange={handleChange}
                              disabled={loading || isUploading}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-200"
                            />
                          </div>
                          <div>
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                              Active Status <span className="text-red-500">*</span>
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                              When active, category will be visible to customers
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SEO Tab */}
                    {activeTab === 'seo' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Meta Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleChange}
                            required
                            disabled={loading || isUploading}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.metaTitle ? 'border-red-300' : 'border-gray-300'
                            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            placeholder="Title for search engines"
                          />
                          {errors.metaTitle && (
                            <p className="mt-1 text-sm text-red-600">{errors.metaTitle}</p>
                          )}
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              Title for search engine results
                            </p>
                            <span className="text-xs text-gray-500">
                              {formData.metaTitle.length}/60
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Meta Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            rows={3}
                            required
                            disabled={loading || isUploading}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.metaDescription ? 'border-red-300' : 'border-gray-300'
                            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            placeholder="Description for search engine results"
                          />
                          {errors.metaDescription && (
                            <p className="mt-1 text-sm text-red-600">{errors.metaDescription}</p>
                          )}
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              Description for search engine results
                            </p>
                            <span className="text-xs text-gray-500">
                              {formData.metaDescription.length}/160
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Meta Keywords <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={loading || isUploading}
                                className={`flex-1 px-4 py-3 rounded-lg border ${
                                  errors.metaKeywords ? 'border-red-300' : 'border-gray-300'
                                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                placeholder="Add keyword and press Enter"
                              />
                              <button
                                type="button"
                                onClick={handleAddKeyword}
                                disabled={loading || isUploading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Add
                              </button>
                            </div>
                            
                            {errors.metaKeywords && (
                              <p className="text-sm text-red-600">{errors.metaKeywords}</p>
                            )}
                            
                            {formData.metaKeywords.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {formData.metaKeywords.map((keyword, index) => (
                                  <div
                                    key={index}
                                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm"
                                  >
                                    <span>{keyword}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveKeyword(index)}
                                      disabled={loading || isUploading}
                                      className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                                    >
                                      <XMarkIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Add at least one keyword for SEO
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Navigation & Submit */}
                    <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => navigate('/categories')}
                          disabled={loading || isUploading}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading || isUploading}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckIcon className="h-5 w-5" />
                              Create Category
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Sidebar Help & Preview */}
              <div className="lg:w-1/3 space-y-6">
                {/* Help Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <InformationCircleIcon className="h-5 w-5 inline-block mr-2" />
                    Required Fields
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">*</span>
                      <span><span className="font-medium">Category Name:</span> Required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">*</span>
                      <span><span className="font-medium">Description:</span> Required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">*</span>
                      <span><span className="font-medium">Image:</span> File upload required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">*</span>
                      <span><span className="font-medium">Display Order:</span> Required (0+)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">*</span>
                      <span><span className="font-medium">Active Status:</span> Required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">*</span>
                      <span><span className="font-medium">SEO Fields:</span> All required</span>
                    </li>
                  </ul>
                </div>

                {/* Preview Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {formData.name || 'Category Name'}
                        </h4>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500 line-clamp-3">
                            {formData.description ? truncateDescription(formData.description, 120) : 'Category description will appear here...'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span>Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {formData.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span>Display Order:</span>
                        <span className="font-medium">{formData.displayOrder}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span>Meta Title:</span>
                        <span className={`font-medium ${
                          formData.metaTitle ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {formData.metaTitle ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span>Meta Description:</span>
                        <span className={`font-medium ${
                          formData.metaDescription ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {formData.metaDescription ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Keywords:</span>
                        <span className={`font-medium ${
                          formData.metaKeywords.length > 0 ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {formData.metaKeywords.length} added
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Progress Card (only shown during upload) */}
                {(loading || isUploading) && (
                  <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">
                      <CloudArrowUpIcon className="h-5 w-5 inline-block mr-2" />
                      Upload Progress
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-blue-700">
                            Processing Category Creation
                          </span>
                          <span className="text-sm font-bold text-blue-600">
                            {Math.round(uploadProgress)}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-blue-700">
                        <div className={`flex items-center ${uploadProgress >= 10 ? 'text-green-600' : ''}`}>
                          <div className={`h-2 w-2 rounded-full mr-2 ${uploadProgress >= 10 ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                          <span>Form Validation</span>
                        </div>
                        <div className={`flex items-center ${uploadProgress >= 30 ? 'text-green-600' : ''}`}>
                          <div className={`h-2 w-2 rounded-full mr-2 ${uploadProgress >= 30 ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                          <span>Generating S3 Upload URL</span>
                        </div>
                        <div className={`flex items-center ${uploadProgress >= 80 ? 'text-green-600' : ''}`}>
                          <div className={`h-2 w-2 rounded-full mr-2 ${uploadProgress >= 80 ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                          <span>Uploading Image to S3</span>
                        </div>
                        <div className={`flex items-center ${uploadProgress >= 90 ? 'text-green-600' : ''}`}>
                          <div className={`h-2 w-2 rounded-full mr-2 ${uploadProgress >= 90 ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                          <span>Creating Category in Database</span>
                        </div>
                        <div className={`flex items-center ${uploadProgress >= 100 ? 'text-green-600' : ''}`}>
                          <div className={`h-2 w-2 rounded-full mr-2 ${uploadProgress >= 100 ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                          <span>Complete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          line-clamp: 3;
        }
      `}</style>
    </div>
  )
}

export default AddCategory