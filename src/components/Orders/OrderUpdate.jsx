import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import Sidebar from '../Sidebar'
import Navbar from '../Navbar'

const OrderUpdate = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    status: '',
    paymentMethod: '',
    shippingMethod: '',
    shippingAddress: '',
    billingAddress: ''
  })

  // Mock order data
  const mockOrders = {
    'ORD-001': {
      id: 'ORD-001',
      customer: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      date: '2024-01-15',
      time: '14:30',
      amount: '₹125.00',
      status: 'Completed',
      paymentMethod: 'Credit Card',
      shippingMethod: 'Express Delivery',
      shippingAddress: '123 Main St, New York, NY 10001',
      billingAddress: '123 Main St, New York, NY 10001',
      items: [
        { id: 1, name: 'Wireless Headphones', price: '₹59.99', quantity: 1, total: '₹59.99' },
        { id: 2, name: 'USB-C Cable', price: '₹19.99', quantity: 2, total: '₹39.98' },
        { id: 3, name: 'Phone Case', price: '₹25.03', quantity: 1, total: '₹25.03' }
      ],
      subtotal: '₹124.00',
      shipping: '₹5.00',
      tax: '₹10.00',
      total: '₹139.00'
    },
    'ORD-002': {
      id: 'ORD-002',
      customer: 'Emma Johnson',
      email: 'emma.j@example.com',
      phone: '+1 (555) 987-6543',
      date: '2024-01-15',
      time: '11:15',
      amount: '₹89.99',
      status: 'Processing',
      paymentMethod: 'PayPal',
      shippingMethod: 'Standard Shipping',
      shippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
      billingAddress: '456 Oak Ave, Los Angeles, CA 90001',
      items: [
        { id: 1, name: 'T-shirt', price: '₹24.99', quantity: 2, total: '₹49.98' },
        { id: 2, name: 'Coffee Mug', price: '₹19.99', quantity: 2, total: '₹39.98' }
      ],
      subtotal: '₹89.96',
      shipping: '₹0.00',
      tax: '₹8.10',
      total: '₹98.06'
    }
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const orderData = mockOrders[id]
      if (orderData) {
        setOrder(orderData)
        setFormData({
          status: orderData.status,
          paymentMethod: orderData.paymentMethod,
          shippingMethod: orderData.shippingMethod,
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress
        })
      }
      setLoading(false)
    }, 500)
  }, [id])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'Processing': return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'Shipped': return <TruckIcon className="h-5 w-5 text-purple-500" />
      case 'Pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'Cancelled': return <XCircleIcon className="h-5 w-5 text-red-500" />
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Processing': return 'bg-blue-100 text-blue-800'
      case 'Shipped': return 'bg-purple-100 text-purple-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // In a real app, you would make an API call here
    console.log('Updating order:', id, formData)
    
    // Show success message
    alert(`Order ${id} updated successfully!`)
    
    // Navigate back to orders
    navigate('/orders')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-600">Order not found</div>
        <button 
          onClick={() => navigate('/orders')}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/orders')}
                    className="mr-4 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Update Order</h1>
                    <p className="text-gray-600">Order ID: #{order.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className={`ml-2 px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Update Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Update Order Details</h2>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="PayPal">PayPal</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cash on Delivery">Cash on Delivery</option>
                        </select>
                      </div>

                      {/* Shipping Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shipping Method
                        </label>
                        <select
                          name="shippingMethod"
                          value={formData.shippingMethod}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Standard Shipping">Standard Shipping</option>
                          <option value="Express Delivery">Express Delivery</option>
                          <option value="Next Day Delivery">Next Day Delivery</option>
                          <option value="Store Pickup">Store Pickup</option>
                        </select>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shipping Address
                        </label>
                        <textarea
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Billing Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Billing Address
                        </label>
                        <textarea
                          name="billingAddress"
                          value={formData.billingAddress}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-end space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => navigate('/orders')}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Update Order
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.customer}`}
                        alt={order.customer}
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500">Customer ID: CUST-{order.id.slice(-3)}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{order.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{order.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">#{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span>{order.date} at {order.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span>{order.items.length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold">{order.total}</span>
                    </div>
                  </div>
                </div>

                {/* Current Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Details</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
                      <div className="flex items-center">
                        <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Method</h3>
                      <div className="flex items-center">
                        <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{order.shippingMethod}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default OrderUpdate