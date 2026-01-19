import React, { useState } from 'react';
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

const UserAdd = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Viewer',
    status: 'Active',
    department: '',
    permissions: []
  });

  const [errors, setErrors] = useState({});

  const roles = [
    { value: 'Admin', label: 'Administrator', description: 'Full system access' },
    { value: 'Manager', label: 'Manager', description: 'Manage users and content' },
    { value: 'Editor', label: 'Editor', description: 'Create and edit content' },
    { value: 'Viewer', label: 'Viewer', description: 'View only access' },
  ];

  const permissionsList = [
    { id: 'dashboard', label: 'Dashboard Access' },
    { id: 'products', label: 'Product Management' },
    { id: 'orders', label: 'Order Management' },
    { id: 'categories', label: 'Category Management' },
    { id: 'invoices', label: 'Invoice Management' },
    { id: 'documents', label: 'Document Management' },
    { id: 'users', label: 'User Management' },
    { id: 'settings', label: 'System Settings' },
  ];

  const departments = [
    'Sales',
    'Marketing',
    'IT',
    'Finance',
    'HR',
    'Operations',
    'Customer Support',
    'Management'
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permissionId) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions: newPermissions };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    // Get existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Generate new user ID
    const newId = existingUsers.length > 0 
      ? Math.max(...existingUsers.map(u => u.id)) + 1 
      : 1;
    
    // Create new user object
    const newUser = {
      id: newId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      joinDate: new Date().toISOString().split('T')[0],
      permissions: formData.permissions,
    };
    
    // Add new user to array
    const updatedUsers = [...existingUsers, newUser];
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Dispatch storage event to notify other tabs/components
    window.dispatchEvent(new Event('storage'));
    
    // Show success message
    alert(`User "${formData.name}" has been added successfully!`);
    
    // Navigate back to users list
    navigate('/users');
    
  } catch (error) {
    console.error('Error saving user:', error);
    alert('Error saving user. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    if (Object.values(formData).some(value => 
      (typeof value === 'string' && value.trim() !== '') || 
      (Array.isArray(value) && value.length > 0)
    )) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        navigate('/users');
      }
    } else {
      navigate('/users');
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setFormData(prev => ({
      ...prev,
      password: password,
      confirmPassword: password
    }));
  };

  const getPermissionsForRole = (role) => {
    switch(role) {
      case 'Admin': return permissionsList.map(p => p.id);
      case 'Manager': return ['dashboard', 'products', 'orders', 'categories', 'invoices', 'documents'];
      case 'Editor': return ['dashboard', 'products', 'categories', 'documents'];
      case 'Viewer': return ['dashboard'];
      default: return ['dashboard'];
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: getPermissionsForRole(role)
    }));
  };

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={handleCancel}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Users
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
                  <p className="text-gray-600 mt-1">
                    Create a new user account with specific roles and permissions
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <UserIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Security Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <KeyIcon className="h-6 w-6 mr-2 text-green-600" />
                  Account Security
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="absolute right-2 top-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Generate
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 8 characters with letters, numbers, and symbols
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
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
              </div>

              {/* Role & Permissions Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 mr-2 text-purple-600" />
                  Role & Permissions
                </h2>
                
                {/* Role Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    User Role *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {roles.map((role) => (
                      <button
                        type="button"
                        key={role.value}
                        onClick={() => handleRoleChange(role.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.role === role.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-left">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-semibold ${
                              formData.role === role.value ? 'text-blue-700' : 'text-gray-800'
                            }`}>
                              {role.label}
                            </span>
                            {formData.role === role.value && (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{role.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                {/* Status */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Account Status
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'Active' }))}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        formData.status === 'Active'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'Inactive' }))}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        formData.status === 'Inactive'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Inactive
                    </button>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Module Permissions
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {permissionsList.map((permission) => (
                      <div key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={permission.id}
                          className="ml-3 text-sm text-gray-700 cursor-pointer"
                        >
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Review all information before creating the user account.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Creating User...
                        </>
                      ) : (
                        <>
                          <UserIcon className="h-5 w-5 mr-2" />
                          Create User Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserAdd;