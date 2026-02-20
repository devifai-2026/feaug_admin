import { useState, useEffect } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  QueueListIcon
} from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router-dom'
import categoryApi from '../../api/categories.api'
import { useToast } from '../../context/ToastContext'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryTree, setCategoryTree] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    avgProducts: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  const { showToast } = useToast()
  const navigate = useNavigate()

  // Load categories from API
  useEffect(() => {
    fetchCategories()
    fetchCategoryTree()
  }, [])

  // Filter categories when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredCategories(filtered)
    }
  }, [searchTerm, categories])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await categoryApi.getAllCategories({
        sort: 'displayOrder'
      })
      setCategories(response.data.categories || [])
      setFilteredCategories(response.data.categories || [])
      calculateStats(response.data.categories || [])
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch categories'
      setError(errorMessage)
      console.error('Error fetching categories:', err)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryTree = async () => {
    try {
      const response = await categoryApi.getCategoryTree()
      setCategoryTree(response.data.categories || [])
    } catch (err) {
      console.error('Error fetching category tree:', err)
      showToast('Failed to load category tree', 'warning')
    }
  }

  const calculateStats = (categoriesList) => {
    const total = categoriesList.length
    const active = categoriesList.filter(cat => cat.isActive !== false).length

    let totalProducts = 0
    categoriesList.forEach(cat => {
      totalProducts += cat.productCount || 0
    })

    const avgProducts = total > 0 ? Math.round(totalProducts / total) : 0

    setStats({
      total,
      active,
      avgProducts
    })
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      await categoryApi.deleteCategory(id)

      const updatedCategories = categories.filter(category => category._id !== id)
      setCategories(updatedCategories)
      calculateStats(updatedCategories)

      const updatedTree = categoryTree.filter(cat => cat._id !== id)
      setCategoryTree(updatedTree)

      showToast('Category deleted successfully', 'success')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete category'

      if (errorMessage.includes('products') || errorMessage.includes('subcategories')) {
        showToast('Cannot delete category with associated products or subcategories', 'error')
      } else {
        showToast(errorMessage, 'error')
      }
    }
  }

  const handleViewSubcategories = (category) => {
    navigate(`/subcategories?category=${category._id}`)
  }

  const getCategoryColor = (category) => {
    if (!category.isActive) return 'bg-red-100 text-red-800'

    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-green-100 text-green-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800',
      'bg-cyan-100 text-cyan-800'
    ]

    const index = category._id ? parseInt(category._id.slice(-1), 16) % colors.length : 0
    return colors[index]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderCategoryTree = (tree) => {
    if (!tree || tree.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          No categories found. Add your first category to see the hierarchy.
        </div>
      )
    }

    const renderNode = (node, level = 0) => (
      <div key={node._id} className="mb-2">
        <div className={`flex items-center ${level > 0 ? 'ml-6' : ''}`}>
          {level > 0 && (
            <div className="flex">
              {Array.from({ length: level }).map((_, i) => (
                <div key={i} className="h-1 w-4 border-t border-gray-300 mr-2"></div>
              ))}
            </div>
          )}
          <FolderIcon className={`h-5 w-5 mr-2 ${node.isActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
          <span className="font-medium">{node.name}</span>
          <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
            {node.productCount || 0} products
          </span>
          {!node.isActive && (
            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              Inactive
            </span>
          )}
        </div>

        {node.children && node.children.length > 0 && (
          <div className="mt-2">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )

    return tree.map(node => renderNode(node))
  }

  return (
    // Only return the main content
    // Remove Sidebar and Navbar wrappers

    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Organize your products into categories</p>
            <div className="mt-2 text-sm text-gray-500">
              Total: {stats.total} categories • Showing {filteredCategories.length} results
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCategories}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {/* <Link
              to="/categories/add"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Category
            </Link> */}
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories by name or description..."
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title="Grid View"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title="List View"
            >
              <QueueListIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
              <FolderIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Categories</div>
              <div className="text-2xl font-bold mt-1">{stats.total}</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mr-4">
              <PhotoIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Active Categories</div>
              <div className="text-2xl font-bold mt-1">{stats.active}</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mr-4">
              <div className="text-orange-600 font-bold">∅</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Avg. Products per Category</div>
              <div className="text-2xl font-bold mt-1">{stats.avgProducts}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchCategories}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Categories Grid/List - Only show when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Categories Display */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
              <p className="text-gray-500">
                {searchTerm ? `No results for "${searchTerm}"` : 'Add your first category to get started'}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  to="/categories/add"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Category
                </Link>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredCategories.map((category) => (
                <div key={category._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`h-12 w-12 rounded-lg ${getCategoryColor(category).split(' ')[0]} flex items-center justify-center`}>
                        <FolderIcon className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{category.description || 'No description'}</p>
                      </div>
                    </div>
                    {/* <div className="flex items-center space-x-2">
                      <Link
                        to={`/categories/edit/${category._id}`}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        className={`p-1 ${category.productCount > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                        title={category.productCount > 0 ? 'Cannot delete category with products' : 'Delete'}
                        onClick={() => handleDeleteCategory(category._id)}
                        disabled={category.productCount > 0}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div> */}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Products:</span>
                      <span className="font-medium">{category.productCount || 0} items</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {category.parentCategory && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Parent:</span>
                        <span className="font-medium">
                          {typeof category.parentCategory === 'object'
                            ? category.parentCategory.name
                            : 'N/A'}
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleViewSubcategories(category)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Subcategories →
                        </button>
                        <span className="text-xs text-gray-500">
                          Updated: {formatDate(category.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>

                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-lg ${getCategoryColor(category).split(' ')[0]} flex items-center justify-center mr-3`}>
                            <FolderIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{category.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {category.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{category.productCount || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/categories/edit/${category._id}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                                  onClick={() => handleViewSubcategories(category)}
                                  className="text-green-600 hover:text-green-800"
                                  title="View Subcategories"
                                >
                                  <FolderIcon className="h-5 w-5" />
                                </button>
                          <button
                            className={`${category.productCount > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                            title={category.productCount > 0 ? 'Cannot delete category with products' : 'Delete'}
                            onClick={() => handleDeleteCategory(category._id)}
                            disabled={category.productCount > 0}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Category Tree */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Category Hierarchy</h2>
              <button
                onClick={fetchCategoryTree}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh Tree
              </button>
            </div>
            <div className="space-y-2">
              {renderCategoryTree(categoryTree)}
            </div>
          </div>


        </>
      )}
    </div>
  )
}

export default Categories