import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRef } from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import bannerApi from '../../api/banners.api';
import s3Api from '../../api/s3.api';
import { useToast } from '../../context/ToastContext';

const AddBanner = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    subheader: '', // Adjusted to match model 'subheader'
    body: '',
    footer: '',
    images: [],
    bannerType: 'header',
    linkType: 'none',
    linkTarget: '',
    page: 'home',
    position: 'top',
    displayOrder: 0,
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    backgroundColor: '',
    textColor: '',
    buttonText: '',
    buttonColor: '',
    primaryImage: '' // Temporary state for selecting primary URL
  });

  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [errors, setErrors] = useState({});

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

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages(prev => [...prev, { url: newImageUrl.trim(), subheader: '' }]);
    setNewImageUrl('');
  };

  const removeImage = (index) => {
    const removedImage = images[index];
    setImages(prev => prev.filter((_, i) => i !== index));
    if (removedImage.url === formData.primaryImage) {
      setFormData(prev => ({ ...prev, primaryImage: '' }));
    }
  };

  const handleImageSubheaderChange = (index, subheader) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = { ...newImages[index], subheader };
      return newImages;
    });
  };

  const handleSetPrimaryImage = (url) => {
    setFormData(prev => ({ ...prev, primaryImage: url }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Get presigned URL
        const presignedResponse = await s3Api.getPresignedUrl(
          file.name,
          file.type,
          'banners'
        );

        // Upload to S3
        await fetch(presignedResponse.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        const uploadedUrl = presignedResponse.fileUrl;
        setImages(prev => [...prev, { url: uploadedUrl, subheader: '' }]);
      }
      showToast('Images uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading images:', error);
      showToast('Error uploading images', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (images.length === 0) {
      newErrors.image = 'At least one banner image is required';
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
      setLoading(true);

      const bannerData = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder) || 0,
        name: formData.title.toLowerCase().replace(/\s+/g, '-'),
        images: images.map((img, index) => ({
          url: img.url,
          subheader: img.subheader || '',
          isPrimary: img.url === (formData.primaryImage || images[0]?.url),
          alt: formData.title
        }))
      };

      delete bannerData.primaryImage;

      if (!bannerData.endDate) delete bannerData.endDate;
      if (!bannerData.backgroundColor) delete bannerData.backgroundColor;
      if (!bannerData.textColor) delete bannerData.textColor;
      if (!bannerData.buttonColor) delete bannerData.buttonColor;

      await bannerApi.createBanner(bannerData);
      showToast('Banner created successfully', 'success');
      navigate('/banners');
    } catch (error) {
      console.error('Error creating banner:', error);
      showToast(error.response?.data?.message || 'Error creating banner', 'error');
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Add New Banner</h1>
              <p className="text-gray-600 mt-1">Create a new banner for your website</p>
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter banner title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subheader
                    </label>
                    <input
                      type="text"
                      name="subheader"
                      value={formData.subheader}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter banner subheader (optional)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Content
                    </label>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter main banner content (optional)"
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Footer Text
                    </label>
                    <input
                      type="text"
                      name="footer"
                      value={formData.footer}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter footer text (optional)"
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

              {/* Media Management (Banners) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <PhotoIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Media Management
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Image URL Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Add Image via URL</label>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                          placeholder="Paste banner image URL here..."
                        />
                        <PhotoIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 active:scale-95"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* File Upload UI */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Images</label>
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-50 hover:border-blue-300">
                      <div className="p-3 bg-white rounded-full shadow-sm mb-4">
                        <ArrowUpTrayIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <label className="relative cursor-pointer group">
                          <span className="text-blue-600 font-bold group-hover:text-blue-700 transition-colors underline">Click to upload files</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            disabled={uploading}
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-1 font-medium italic">or drag and drop images here</p>
                      </div>
                      {uploading && (
                        <div className="mt-4 flex items-center text-blue-600 font-bold text-sm animate-pulse">
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Uploading Assets...
                        </div>
                      )}
                    </div>
                  </div>

                  {errors.image && <p className="text-sm text-red-500 font-medium">{errors.image}</p>}

                  {/* Image Gallery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`group relative flex flex-col bg-white rounded-xl overflow-hidden border-2 transition-all shadow-sm ${formData.primaryImage === img.url || (!formData.primaryImage && index === 0)
                          ? 'border-blue-500 ring-2 ring-blue-100'
                          : 'border-gray-100 hover:border-blue-300'
                          }`}
                      >
                        <div className="relative aspect-video">
                          <img
                            src={img.url}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(img.url)}
                              className={`p-2 rounded-lg transition-colors ${formData.primaryImage === img.url || (!formData.primaryImage && index === 0) ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
                              title="Set as Primary"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                              title="Remove Image"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                          {(formData.primaryImage === img.url || (!formData.primaryImage && index === 0)) && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                              Primary
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-50 border-t border-gray-100">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Image Subheader (Optional)</label>
                          <input
                            type="text"
                            value={img.subheader}
                            onChange={(e) => handleImageSubheaderChange(index, e.target.value)}
                            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="e.g., Summer Collection 2024"
                          />
                        </div>
                      </div>
                    ))}
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
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.linkTarget ? 'border-red-500' : 'border-gray-300'
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
                  disabled={loading || uploading}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center ${loading || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Banner'
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

export default AddBanner;
