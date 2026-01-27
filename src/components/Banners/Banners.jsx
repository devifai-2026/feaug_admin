import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import bannerApi from '../../api/banners.api';
import { useToast } from '../../context/ToastContext';

const Banners = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { showToast } = useToast();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    bannerType: '',
    isActive: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, banner: null });

  useEffect(() => {
    fetchBanners();
  }, [pagination.page, filters]);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await bannerApi.getAllBanners(params);
      setBanners(response.data.banners || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / prev.limit) || 1,
      }));
    } catch (error) {
      console.error('Error fetching banners:', error);
      showToast('Error fetching banners', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, searchQuery, showToast]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchBanners();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ bannerType: '', isActive: '' });
    setSearchQuery('');
  };

  const handleDelete = async () => {
    if (!deleteModal.banner) return;

    try {
      await bannerApi.deleteBanner(deleteModal.banner._id);
      showToast('Banner deleted successfully', 'success');
      setDeleteModal({ open: false, banner: null });
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      showToast('Error deleting banner', 'error');
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      await bannerApi.updateBanner(banner._id, { isActive: !banner.isActive });
      showToast(`Banner ${banner.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner status:', error);
      showToast('Error updating banner status', 'error');
    }
  };

  const getBannerTypeColor = (type) => {
    switch (type) {
      case 'header':
        return 'bg-blue-100 text-blue-800';
      case 'footer':
        return 'bg-purple-100 text-purple-800';
      case 'promotional':
        return 'bg-green-100 text-green-800';
      case 'slider':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <main className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
                  <p className="text-gray-600 mt-1">Manage header, footer, and promotional banners</p>
                </div>
                <button
                  onClick={() => navigate('/banners/add')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Banner
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <PhotoIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Header</div>
                    <div className="text-xl font-bold">
                      {banners.filter(b => b.bannerType === 'header').length}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <PhotoIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Footer</div>
                    <div className="text-xl font-bold">
                      {banners.filter(b => b.bannerType === 'footer').length}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <PhotoIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Active</div>
                    <div className="text-xl font-bold">
                      {banners.filter(b => b.isActive).length}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <PhotoIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-xl font-bold">{banners.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search banners by title..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </form>

                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-500" />
                  <select
                    value={filters.bannerType}
                    onChange={(e) => handleFilterChange('bannerType', e.target.value)}
                    className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                    <option value="promotional">Promotional</option>
                    <option value="slider">Slider</option>
                  </select>

                  <select
                    value={filters.isActive}
                    onChange={(e) => handleFilterChange('isActive', e.target.value)}
                    className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>

                  {(filters.bannerType || filters.isActive || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Banners Grid */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-12">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No banners found</h3>
                  <p className="mt-1 text-gray-500">Get started by creating a new banner.</p>
                  <button
                    onClick={() => navigate('/banners/add')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Banner
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Banner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Page
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Range
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {banners.map((banner) => (
                          <tr key={banner._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-16 w-24 flex-shrink-0">
                                  <img
                                    className="h-16 w-24 object-cover rounded-lg"
                                    src={banner.image || 'https://via.placeholder.com/150'}
                                    alt={banner.title}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=150&h=100&fit=crop';
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {banner.title}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {banner.subtitle || 'No subtitle'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getBannerTypeColor(banner.bannerType)}`}>
                                {banner.bannerType || 'header'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {banner.page || 'home'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleToggleStatus(banner)}
                                className={`px-3 py-1 text-xs font-medium rounded-full ${banner.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}
                              >
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{formatDate(banner.startDate)}</div>
                              <div className="text-xs text-gray-400">
                                to {formatDate(banner.endDate)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => navigate(`/banners/view/${banner._id}`)}
                                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                  title="View"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => navigate(`/banners/edit/${banner._id}`)}
                                  className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                                  title="Edit"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => setDeleteModal({ open: true, banner })}
                                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.total > pagination.limit && (
                    <div className="bg-white px-6 py-3 border-t border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-4 md:mb-0">
                          <p className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                              {(pagination.page - 1) * pagination.limit + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                              {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            of <span className="font-medium">{pagination.total}</span> results
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page <= 1}
                            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeftIcon className="h-4 w-4 mr-1" />
                            Previous
                          </button>
                          <span className="text-sm text-gray-500 px-2">
                            Page {pagination.page} of {pagination.totalPages}
                          </span>
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page >= pagination.totalPages}
                            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setDeleteModal({ open: false, banner: null })} />
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Banner</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{deleteModal.banner?.title}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ open: false, banner: null })}
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
