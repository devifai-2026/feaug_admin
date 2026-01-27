import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import bannerApi from '../../api/banners.api';
import s3Api from '../../api/s3.api';
import { useToast } from '../../context/ToastContext';

const EditBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    mobileImage: '',
    bannerType: 'header',
    linkType: 'none',
    linkTarget: '',
    page: 'home',
    position: 'top',
    displayOrder: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    backgroundColor: '',
    textColor: '',
    buttonText: '',
    buttonColor: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBanner();
  }, [id]);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const response = await bannerApi.getBanner(id);
      const banner = response.data.banner;

      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        mobileImage: banner.mobileImage || '',
        bannerType: banner.bannerType || 'header',
        linkType: banner.linkType || 'none',
        linkTarget: banner.linkTarget || '',
        page: banner.page || 'home',
        position: banner.position || 'top',
        displayOrder: banner.displayOrder || 0,
        isActive: banner.isActive !== false,
        startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
        endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
        backgroundColor: banner.backgroundColor || '',
        textColor: banner.textColor || '',
        buttonText: banner.buttonText || '',
        buttonColor: banner.buttonColor || '',
      });
    } catch (error) {
      console.error('Error fetching banner:', error);
      showToast('Error fetching banner details', 'error');
      navigate('/banners');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e, type = 'desktop') => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      setUploading(true);

      const presignedResponse = await s3Api.getPresignedUrl({
        fileName: file.name,
        fileType: file.type,
        folder: 'banners',
      });

      await fetch(presignedResponse.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (type === 'desktop') {
        setFormData(prev => ({ ...prev, image: presignedResponse.data.fileUrl }));
      } else {
        setFormData(prev => ({ ...prev, mobileImage: presignedResponse.data.fileUrl }));
      }

      showToast('Image uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Error uploading image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (type = 'desktop') => {
    if (type === 'desktop') {
      setFormData(prev => ({ ...prev, image: '' }));
    } else {
      setFormData(prev => ({ ...prev, mobileImage: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.image) {
      newErrors.image = 'Banner image is required';
    }

    if (formData.linkType !== 'none' && !formData.linkTarget.trim()) {
      newErrors.linkTarget = 'Link target is required when link type is selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    try {
      setSaving(true);

      const bannerData = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder) || 0,
      };

      // Remove empty optional fields
      if (!bannerData.endDate) delete bannerData.endDate;
      if (!bannerData.mobileImage) delete bannerData.mobileImage;
      if (!bannerData.backgroundColor) delete bannerData.backgroundColor;
      if (!bannerData.textColor) delete bannerData.textColor;
      if (!bannerData.buttonText) delete bannerData.buttonText;
      if (!bannerData.buttonColor) delete bannerData.buttonColor;

      await bannerApi.updateBanner(id, bannerData);
      showToast('Banner updated successfully', 'success');
      navigate('/banners');
    } catch (error) {
      console.error('Error updating banner:', error);
      showToast(error.response?.data?.message || 'Error updating banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading banner...</p>
        </div>
      </div>
    );
  }

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
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate('/banners')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Banners
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Edit Banner</h1>
              <p className="text-gray-600 mt-1">Update banner details and settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter banner title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter banner subtitle (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Type *
                    </label>
                    <select
                      name="bannerType"
                      value={formData.bannerType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="header">Header Banner</option>
                      <option value="footer">Footer Banner</option>
                      <option value="promotional">Promotional Banner</option>
                      <option value="slider">Slider Banner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Page
                    </label>
                    <select
                      name="page"
                      value={formData.page}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="home">Home Page</option>
                      <option value="category">Category Page</option>
                      <option value="product">Product Page</option>
                      <option value="cart">Cart Page</option>
                      <option value="checkout">Checkout Page</option>
                      <option value="all">All Pages</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="top">Top</option>
                      <option value="middle">Middle</option>
                      <option value="bottom">Bottom</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="popup">Popup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Banner Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Desktop Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desktop Image *
                    </label>
                    {formData.image ? (
                      <div className="relative">
                        <img
                          src={formData.image}
                          alt="Banner preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('desktop')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${
                        errors.image ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploading ? (
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                          ) : (
                            <>
                              <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Click to upload desktop image</p>
                              <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'desktop')}
                          disabled={uploading}
                        />
                      </label>
                    )}
                    {errors.image && (
                      <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                    )}
                  </div>

                  {/* Mobile Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Image (Optional)
                    </label>
                    {formData.mobileImage ? (
                      <div className="relative">
                        <img
                          src={formData.mobileImage}
                          alt="Mobile banner preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('mobile')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploading ? (
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                          ) : (
                            <>
                              <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Click to upload mobile image</p>
                              <p className="text-xs text-gray-400">Optimized for mobile devices</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'mobile')}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Link Settings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Link Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Type
                    </label>
                    <select
                      name="linkType"
                      value={formData.linkType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="none">No Link</option>
                      <option value="product">Product</option>
                      <option value="category">Category</option>
                      <option value="collection">Collection</option>
                      <option value="url">Custom URL</option>
                    </select>
                  </div>

                  {formData.linkType !== 'none' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link Target *
                      </label>
                      <input
                        type="text"
                        name="linkTarget"
                        value={formData.linkTarget}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.linkTarget ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={formData.linkType === 'url' ? 'https://example.com' : 'Enter ID'}
                      />
                      {errors.linkTarget && (
                        <p className="mt-1 text-sm text-red-600">{errors.linkTarget}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Shop Now"
                    />
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduling</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave empty for no end date</p>
                  </div>

                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Styling */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Styling (Optional)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      name="backgroundColor"
                      value={formData.backgroundColor || '#ffffff'}
                      onChange={handleInputChange}
                      className="w-full h-10 px-2 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      name="textColor"
                      value={formData.textColor || '#000000'}
                      onChange={handleInputChange}
                      className="w-full h-10 px-2 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Color
                    </label>
                    <input
                      type="color"
                      name="buttonColor"
                      value={formData.buttonColor || '#3b82f6'}
                      onChange={handleInputChange}
                      className="w-full h-10 px-2 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/banners')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center ${
                    saving || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditBanner;
