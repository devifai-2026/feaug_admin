import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CameraIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

const MyProfile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    joinDate: '',
    location: '',
    bio: '',
    avatar: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    department: '',
    location: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load profile data (in real app, this would be from API)
    const loadProfileData = () => {
      setTimeout(() => {
        const mockProfileData = {
          name: 'Admin User',
          email: 'admin@example.com',
          phone: '+1 234 567 8900',
          role: 'Administrator',
          department: 'Management',
          joinDate: '2023-01-15',
          location: 'New York, USA',
          bio: 'System administrator with full access to all modules. Responsible for managing users, products, and system settings.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminProfile'
        };
        
        setProfileData(mockProfileData);
        setFormData({
          name: mockProfileData.name,
          email: mockProfileData.email,
          phone: mockProfileData.phone,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          department: mockProfileData.department,
          location: mockProfileData.location,
          bio: mockProfileData.bio
        });
        setLoading(false);
      }, 500);
    };

    loadProfileData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    
    if (!formData.department) newErrors.department = 'Department is required';

    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const formErrors = validateProfileForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile data
      const updatedProfile = {
        ...profileData,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        location: formData.location,
        bio: formData.bio
      };
      
      setProfileData(updatedProfile);
      setIsEditing(false);
      setErrors({});
      
      // Show success message
      alert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    const formErrors = validatePasswordForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setErrors({});
      
      // Show success message
      alert('Password changed successfully!');
      
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      department: profileData.department,
      location: profileData.location,
      bio: profileData.bio
    });
    setErrors({});
  };

  const handleAvatarChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setProfileData(prev => ({
            ...prev,
            avatar: event.target.result
          }));
          alert('Profile picture updated successfully!');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                  <p className="text-gray-600 mt-1">
                    Manage your account settings and preferences
                  </p>
                </div>
                
                {!isEditing && activeTab === 'profile' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <img
                    className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                    src={profileData.avatar}
                    alt={profileData.name}
                  />
                  <button
                    onClick={handleAvatarChange}
                    className="absolute bottom-0 right-0 h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                    title="Change photo"
                  >
                    <CameraIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                          <ShieldCheckIcon className="h-4 w-4 mr-1" />
                          {profileData.role}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 text-right">
                      <div className="text-sm text-gray-600">Member Since</div>
                      <div className="text-lg font-semibold text-gray-900">{formatDate(profileData.joinDate)}</div>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center text-gray-700">
                      <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                      <span>{profileData.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <BuildingOfficeIcon className="h-5 w-5 mr-3 text-gray-400" />
                      <span>{profileData.department}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                      <span>{profileData.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserIcon className="h-5 w-5 inline mr-2" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <LockClosedIcon className="h-5 w-5 inline mr-2" />
                Security
              </button>
            </div>

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                {!isEditing ? (
                  /* View Mode */
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
                    
                    <div className="space-y-6">
                      {/* Bio Section */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">{profileData.bio}</p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Full Name</h4>
                          <p className="text-gray-900">{profileData.name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Email Address</h4>
                          <p className="text-gray-900">{profileData.email}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Phone Number</h4>
                          <p className="text-gray-900">{profileData.phone}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Department</h4>
                          <p className="text-gray-900">{profileData.department}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                          <p className="text-gray-900">{profileData.location}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Join Date</h4>
                          <p className="text-gray-900">{formatDate(profileData.joinDate)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Edit Mode */
                  <form onSubmit={handleProfileUpdate}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile Information</h3>
                    
                    <div className="space-y-6">
                      {/* Bio Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          About
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department *
                          </label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.department ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select Department</option>
                            <option value="Sales">Sales</option>
                            <option value="Marketing">Marketing</option>
                            <option value="IT">IT</option>
                            <option value="Finance">Finance</option>
                            <option value="HR">HR</option>
                            <option value="Operations">Operations</option>
                            <option value="Customer Support">Customer Support</option>
                            <option value="Management">Management</option>
                          </select>
                          {errors.department && (
                            <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center ${
                          saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                        }`}
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <KeyIcon className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Change Password</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          For security reasons, please enter your current password before setting a new one.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                      )}
                    </div>
                    <div className="md:col-span-2"></div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Minimum 8 characters with letters, numbers, and symbols
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Security Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Password Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                        Use a combination of uppercase and lowercase letters
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                        Include numbers and special characters
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                        Avoid using personal information or common words
                      </li>
                    </ul>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center ${
                        saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="h-5 w-5 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Account Age</div>
                    <div className="text-2xl font-bold mt-1">1 year</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Security Level</div>
                    <div className="text-2xl font-bold mt-1">High</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <UserIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Last Updated</div>
                    <div className="text-2xl font-bold mt-1">Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyProfile;