import React, { useState } from 'react'
import { 
  ArrowLeftIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../Sidebar'
import Navbar from '../Navbar'

const AddProduct = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    sku: '',
    weight: '',
    dimensions: '',
    image: ''
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field if user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required'
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required'
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Create new product object
    const newProduct = {
      id: Date.now(), // Generate unique ID
      name: formData.name,
      category: formData.category,
      price: `$${parseFloat(formData.price).toFixed(2)}`,
      stock: parseInt(formData.stock),
      status: parseInt(formData.stock) > 50 ? 'In Stock' : 
               parseInt(formData.stock) > 20 ? 'In Stock' : 
               parseInt(formData.stock) > 0 ? 'Low Stock' : 'Out of Stock',
      image: formData.image || 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=150&h=150&fit=crop',
      sku: formData.sku,
      description: formData.description,
      weight: formData.weight,
      dimensions: formData.dimensions
    }

    // Get existing products from localStorage
    let existingProducts = []
    try {
      const storedProducts = localStorage.getItem('products')
      existingProducts = storedProducts ? JSON.parse(storedProducts) : []
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      existingProducts = []
    }

    // Add new product at the beginning of the array
    const updatedProducts = [newProduct, ...existingProducts]
    
    // Save to localStorage
    try {
      localStorage.setItem('products', JSON.stringify(updatedProducts))
      
      // Also update a flag to trigger refresh in Products component
      localStorage.setItem('products_updated', Date.now().toString())
      
      // Show success message
      alert('Product added successfully!')
      
      // Redirect to products page
      navigate('/products')
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      alert('Error saving product. Please try again.')
    }
  }

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Sports',
    'Books',
    'Beauty',
    'Toys',
    'Automotive'
  ]

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Link 
                    to="/products" 
                    className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-600">Fill in the details to add a new product</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.stock ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter stock quantity"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.stock}
                      </p>
                    )}
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU (Stock Keeping Unit) *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.sku ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., PROD-001"
                    />
                    {errors.sku && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.sku}
                      </p>
                    )}
                  </div>

                  {/* Product Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhotoIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product description..."
                  />
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Additional Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 0.5"
                    />
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensions (L x W x H)
                    </label>
                    <input
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 10 x 5 x 3 cm"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link
                    to="/products"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Product
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AddProduct