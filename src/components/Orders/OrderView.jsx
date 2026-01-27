import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  PrinterIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'
import Sidebar from '../Sidebar'
import Navbar from '../Navbar'
import orderApi from '../../api/orders.api'
import { useToast } from '../../context/ToastContext'
import StatusUpdateModal from '../../components/Modals/StatusUpdateModal'

const OrderView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeline, setTimeline] = useState([])
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      fetchOrderDetails()
      fetchOrderTimeline()
    }
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await orderApi.getOrder(id)
      console.log("Order details response:", response)
      setOrder(response.data.order)
    } catch (error) {
      console.error("Error fetching order details:", error)
      showToast("Error fetching order details", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderTimeline = async () => {
    try {
      const response = await orderApi.getOrderTimeline(id)
      setTimeline(response.data.timeline || [])
    } catch (error) {
      console.error("Error fetching order timeline:", error)
    }
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-purple-500" />
      case 'pending':
      case 'confirmed':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'refunded':
      case 'returned':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'pending':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
      case 'returned':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status) => {
    const statusMap = {
      "pending": "Pending",
      "confirmed": "Confirmed",
      "processing": "Processing",
      "shipped": "Shipped",
      "delivered": "Completed",
      "cancelled": "Cancelled",
      "refunded": "Refunded",
      "returned": "Returned"
    }
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    return formatDate(dateString)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getShippingAddress = () => {
    if (!order?.addresses) return null
    const shippingAddr = order.addresses.find(addr => addr.type === 'shipping')
    if (!shippingAddr) return null

    return `${shippingAddr.addressLine1 || ''}${shippingAddr.addressLine2 ? `, ${shippingAddr.addressLine2}` : ''}, ${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.pincode || ''}, ${shippingAddr.country || ''}`
  }

  const getBillingAddress = () => {
    if (!order?.addresses) return null
    const billingAddr = order.addresses.find(addr => addr.type === 'billing')
    if (!billingAddr) return getShippingAddress() // Fallback to shipping address

    return `${billingAddr.addressLine1 || ''}${billingAddr.addressLine2 ? `, ${billingAddr.addressLine2}` : ''}, ${billingAddr.city || ''}, ${billingAddr.state || ''} ${billingAddr.pincode || ''}, ${billingAddr.country || ''}`
  }

  const getCustomerName = () => {
    if (!order?.user) return 'N/A'
    return `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Customer'
  }

  const getPaymentMethodText = (method) => {
    const methods = {
      'razorpay': 'Razorpay',
      'cod': 'Cash on Delivery',
      'card': 'Credit/Debit Card',
      'wallet': 'Wallet',
      'netbanking': 'Net Banking',
      'upi': 'UPI'
    }
    return methods[method] || method
  }

  const handlePrintInvoice = async () => {
    if (!order) return

    try {
      showToast("Generating invoice...", "info")
      const response = await orderApi.generateInvoice(order._id)

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${order.orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      showToast("Invoice downloaded successfully", "success")
    } catch (error) {
      console.error("Error generating invoice:", error)
      showToast("Error generating invoice", "error")
    }
  }

  const handleUpdateStatus = () => {
    setIsStatusModalOpen(true)
  }

  const handleStatusUpdated = (updatedOrder) => {
    setOrder(updatedOrder)
    fetchOrderTimeline() // Refresh timeline
    showToast("Order status updated successfully", "success")
  }

  const handleSendInvoiceEmail = async () => {
    if (!order) return

    try {
      setUpdating(true)
      const emailData = {
        email: order.user?.email || '',
        subject: `Invoice for Order ${order.orderId}`,
        message: `Dear ${getCustomerName()},\n\nPlease find attached the invoice for your order ${order.orderId}.\n\nThank you for your business!`
      }

      await orderApi.sendInvoiceEmail(order._id, emailData)
      showToast("Invoice email sent successfully", "success")
    } catch (error) {
      console.error("Error sending invoice email:", error)
      showToast("Error sending invoice email", "error")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-lg text-gray-600">Loading order details...</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex h-screen">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">Order not found</div>
                <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
                <button
                  onClick={() => navigate('/orders')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/orders')}
                    className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                    <p className="text-gray-600">Order ID: {order.orderId || order._id}</p>
                    <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleUpdateStatus}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      title="Update Status"
                    >
                      <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handlePrintInvoice}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      title="Download Invoice"
                    >
                      <PrinterIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handleSendInvoiceEmail}
                      disabled={updating}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      title="Send Invoice via Email"
                    >
                      <EnvelopeIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Order Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Order Items ({order.items?.length || 0})</h2>
                    <div className="flex items-center text-sm text-gray-500">
                      <ShoppingBagIcon className="h-4 w-4 mr-1" />
                      Total items: {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.productName || item.product?.name}
                                className="h-16 w-16 rounded-lg object-cover mr-4"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                                <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {item.productName || item.product?.name || 'Product'}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span>SKU: {item.sku || item.product?.sku || 'N/A'}</span>
                                <span>Quantity: {item.quantity || 1}</span>
                                {item.product?.category && (
                                  <span className="px-2 py-1 bg-gray-100 rounded">#{item.product.category}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatCurrency((item.price || 0) * (item.quantity || 1))}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(item.price || 0)} each
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No items found for this order
                      </div>
                    )}
                  </div>

                  {/* Order Totals */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(order.subtotal || 0)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(order.discount || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping Charge</span>
                        <span className="font-medium">{formatCurrency(order.shippingCharge || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (GST)</span>
                        <span className="font-medium">{formatCurrency(order.tax || 0)}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t text-lg font-bold">
                        <span>Grand Total</span>
                        <div className="flex items-center">
                          <CurrencyRupeeIcon className="h-5 w-5 mr-1" />
                          <span>{formatCurrency(order.grandTotal || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                {timeline.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
                    <div className="space-y-4">
                      {timeline.slice(0, 5).map((event, index) => (
                        <div key={event.id || index} className="flex items-start">
                          <div className={`h-3 w-3 rounded-full mt-2 ${event.type === 'order_created' ? 'bg-blue-500' :
                            event.type === 'status_change' ? 'bg-green-500' :
                              event.type === 'shipping_update' ? 'bg-purple-500' :
                                event.type === 'payment_received' ? 'bg-green-500' :
                                  event.type === 'order_shipped' ? 'bg-blue-500' :
                                    event.type === 'order_delivered' ? 'bg-green-500' :
                                      'bg-gray-500'
                            } mr-3`}></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{event.description}</div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              <span>{formatDate(event.date)}</span>
                              {event.admin && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>By: {event.admin}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 whitespace-nowrap">
                            {formatTimeAgo(event.date)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {timeline.length > 5 && (
                      <button
                        onClick={() => navigate(`/orders/${id}/timeline`)}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                      >
                        View full timeline ({timeline.length} events)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Order Details Sidebar */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.user?.email || order._id}`}
                        alt={getCustomerName()}
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{getCustomerName()}</div>
                        <div className="text-sm text-gray-500">User ID: {order.user?._id?.slice(-6) || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="truncate">{order.user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span>{order.user?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping & Billing */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping & Billing</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 break-words">
                          {getShippingAddress() || 'No shipping address provided'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Billing Address</h3>
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 break-words">
                          {getBillingAddress() || 'No billing address provided'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
                      <div className="flex items-center">
                        <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-600">{getPaymentMethodText(order.paymentMethod)}</span>
                          <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <TruckIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">
                            {order.shippingProvider || 'Standard Shipping'}
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 mr-2">Tracking:</span>
                            <span className="font-medium text-blue-600">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.estimatedDelivery && (
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              Est. Delivery: {formatDate(order.estimatedDelivery)}
                            </span>
                          </div>
                        )}
                        {order.deliveredAt && (
                          <div className="flex items-center text-sm">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-green-600">
                              Delivered on: {formatDate(order.deliveredAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Metadata */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Currency:</span>
                      <span className="text-sm font-medium">{order.currency || 'INR'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Invoice Number:</span>
                      <span className="text-sm font-medium">{order.invoiceNumber || 'N/A'}</span>
                    </div>
                    {order.razorpayOrderId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Razorpay Order ID:</span>
                        <span className="text-sm font-medium truncate max-w-[150px]">{order.razorpayOrderId}</span>
                      </div>
                    )}
                    {order.razorpayPaymentId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment ID:</span>
                        <span className="text-sm font-medium truncate max-w-[150px]">{order.razorpayPaymentId}</span>
                      </div>
                    )}
                    {order.shiprocketOrderId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Shiprocket ID:</span>
                        <span className="text-sm font-medium">{order.shiprocketOrderId}</span>
                      </div>
                    )}
                    {order.cancellationReason && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Cancellation Reason:</span>
                        <p className="text-sm text-gray-900 bg-red-50 p-2 rounded">{order.cancellationReason}</p>
                      </div>
                    )}
                    {order.adminNotes && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Admin Notes:</span>
                        <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">{order.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Status Update Modal */}
      {order && (
        <StatusUpdateModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          orderId={order._id}
          currentStatus={order.status}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  )
}

export default OrderView