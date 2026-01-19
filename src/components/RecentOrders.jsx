import { Link } from 'react-router-dom'
import { ArrowRightIcon, EyeIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'

const RecentOrders = ({ orders = [] }) => {
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700'
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return (
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
        )
      case 'pending':
        return (
          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
        )
      case 'processing':
        return (
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
        )
      default:
        return (
          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
        )
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (err) {
      return dateString
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '₹0'
    if (typeof amount === 'string' && amount.includes('₹')) return amount
    const numAmount = parseFloat(amount)
    return `₹${numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`
  }

  // Calculate totals once using useMemo for better performance
  const { displayOrders, totalAmount, hasOrders } = useMemo(() => {
    const displayOrders = orders.slice(0, 5)
    const totalAmount = orders.reduce((sum, order) => {
      const amount = typeof order.amount === 'string' 
        ? parseFloat(order.amount.replace(/[^0-9.-]+/g, '')) 
        : order.amount || 0
      return sum + amount
    }, 0)
    
    return {
      displayOrders,
      totalAmount,
      hasOrders: displayOrders.length > 0
    }
  }, [orders])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500 mt-1">Latest customer transactions</p>
        </div>
        <Link 
          to="/orders" 
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          View all
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* Orders Content - This section will grow/shrink */}
      <div className={`flex-1 ${hasOrders ? 'min-h-0' : ''}`}>
        {hasOrders ? (
          <div className="space-y-3">
            {displayOrders.map((order, index) => (
              <div 
                key={order.id || order.orderNumber || index}
                className="group hover:bg-gray-50 transition-colors rounded-lg p-4 border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-center justify-between">
                  {/* Left side - Order info */}
                  <div className="flex items-center gap-4">
                    {/* Order icon */}
                    {/* <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          #{index + 1}
                        </span>
                      </div>
                    </div> */}

                    {/* Order details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/orders/view/${order.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {order.orderNumber || `ORD-${index + 1}`}
                        </Link>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getStatusIcon(order.status)}
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer || 'Guest Customer'} • {formatDate(order.date)}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Amount and action */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(order.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.itemsCount ? `${order.itemsCount} items` : '1 item'}
                      </div>
                    </div>
                    <Link
                      to={`/orders/view/${order.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg 
                className="h-8 w-8 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Orders</h3>
            <p className="text-gray-600 mb-6 text-center max-w-sm">
              New orders will appear here as customers make purchases.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Products
            </Link>
          </div>
        )}
      </div>

      {/* Summary Footer - Always at bottom */}
      {hasOrders && (
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {Math.min(orders.length, 5)} of {orders.length} orders
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Total: {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecentOrders