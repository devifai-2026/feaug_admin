import { 
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ sidebarOpen, toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true) // Start as logged in for demo
  const navigate = useNavigate(); 

  const handleProfile = () => {
    navigate('/my-profile');
    setIsDropdownOpen(false);
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Order Received',
      message: 'Order #ORD-00123 has been placed by John Doe',
      type: 'order',
      time: '2 minutes ago',
      read: false,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      id: 2,
      title: 'Payment Successful',
      message: 'Payment of $1,250.00 received for Invoice #INV-001',
      type: 'payment',
      time: '1 hour ago',
      read: false,
      icon: CheckCircleIcon,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      title: 'Stock Alert',
      message: 'Product "Wireless Headphones" is running low on stock',
      type: 'alert',
      time: '3 hours ago',
      read: true,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500'
    },
    {
      id: 4,
      title: 'New User Registered',
      message: 'Jane Smith has registered as a new customer',
      type: 'user',
      time: '5 hours ago',
      read: true,
      icon: UserIcon,
      color: 'bg-purple-500'
    },
    {
      id: 5,
      title: 'System Update Available',
      message: 'New system update v2.1.0 is available for installation',
      type: 'system',
      time: '1 day ago',
      read: true,
      icon: InformationCircleIcon,
      color: 'bg-indigo-500'
    },
    {
      id: 6,
      title: 'New Message',
      message: 'You have received a new message from Support Team',
      type: 'message',
      time: '2 days ago',
      read: true,
      icon: EnvelopeIcon,
      color: 'bg-pink-500'
    }
  ])
  
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
    setIsNotificationOpen(false)
  }

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen)
    setIsDropdownOpen(false)
    
    // Mark all notifications as read when opening
    if (!isNotificationOpen) {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }))
      setNotifications(updatedNotifications)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
    alert('Logged out successfully!');
    setIsDropdownOpen(false);
  }

  const handleLogin = () => {
    navigate('/login');
  }

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    )
    setNotifications(updatedNotifications)
  }

  const clearAllNotifications = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([])
      setIsNotificationOpen(false)
    }
  }

  const deleteNotification = (id, e) => {
    e.stopPropagation()
    const updatedNotifications = notifications.filter(notification => notification.id !== id)
    setNotifications(updatedNotifications)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      
      // Close notification panel
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm relative">
      {/* Mobile Hamburger Icon - Left side */}
      <div className="flex items-center lg:hidden">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Search Bar - Centered on mobile, full width on desktop */}
      <div className="flex-1 mx-4 max-w-2xl">
        {/* <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Search for products, orders, users..."
          />
        </div> */}
      </div>

      {/* Right side: Icons and User */}
      <div className="flex items-center space-x-3">
        {/* Notifications - Only show when logged in */}
        {isLoggedIn && (
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={toggleNotifications}
              className="relative rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <p className="text-xs text-gray-500">
                      {unreadCount > 0 
                        ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                        : 'All caught up!'
                      }
                    </p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-[400px]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                        <BellIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-medium mb-1">No notifications</p>
                      <p className="text-sm text-gray-500">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${notification.color}`}>
                              <notification.icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={`text-sm font-medium truncate ${
                                  !notification.read ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </p>
                                <button
                                  onClick={(e) => deleteNotification(notification.id, e)}
                                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-500"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {notification.time}
                                </span>
                                {!notification.read && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setIsNotificationOpen(false);
                      }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User dropdown or Login button */}
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <div className="relative">
                <img
                  className="h-8 w-8 rounded-full border-2 border-gray-200"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                  alt="User"
                />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
              </div>
              {/* Hide dropdown chevron on mobile, show on desktop */}
              <ChevronDownIcon className={`hidden md:block h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Administrator
                    </span>
                  </div>
                </div>
                
                {/* Dropdown items */}
                <div className="py-1">
                  <button
                    onClick={handleProfile}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium">My Profile</div>
                      <div className="text-xs text-gray-500">View and edit your profile</div>
                    </div>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Logout</div>
                      <div className="text-xs text-red-500">Sign out from your account</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Login button when not logged in
          <button
            onClick={handleLogin}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="hidden md:inline font-medium">Login</span>
          </button>
        )}
      </div>
    </header>
  )
}

export default Navbar