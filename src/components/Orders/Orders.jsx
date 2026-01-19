// components/Orders.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  EyeIcon,
  PrinterIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";;
import orderApi from "../../api/orders.api";
import { useToast } from "../../context/ToastContext";
import StatusUpdateModal from "../../components/Modals/StatusUpdateModal";
import ExportModal from "../../components/Modals/ExportOrderModal";

const Orders = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { showToast } = useToast();
  
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: { count: 12, revenue: 0 },
    processing: { count: 8, revenue: 0 },
    shipped: { count: 15, revenue: 0 },
    completed: { count: 156, revenue: 0 },
    cancelled: { count: 3, revenue: 0 },
    total: { orders: 194, revenue: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [sortBy, setSortBy] = useState("-createdAt");

  // Fetch data on component mount
  useEffect(() => {
    fetchOrders();
    fetchStatistics();
    fetchRecentActivities();
  }, [pagination.page, sortBy]);

  // Apply filters when they change
  useEffect(() => {
    if (pagination.page === 1) {
      fetchOrders();
    } else {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [filters, searchQuery]);

 // In your Orders component, update the fetchOrders function:
const fetchOrders = useCallback(async () => {
  try {
    setLoading(true);
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sort: sortBy,
      ...filters,
    };
    
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    const response = await orderApi.getAllOrders(params);
    console.log("Orders response:", response); // Debug log
    
    setOrders(response.data.orders || []);
    
    // Ensure total is a number and calculate totalPages safely
    const total = Number(response.total) || 0;
    const limit = Number(pagination.limit) || 10;
    const totalPages = Math.ceil(total / limit) || 1;
    
    setPagination(prev => ({
      ...prev,
      total: total,
      totalPages: totalPages,
      page: total > 0 ? Math.min(prev.page, totalPages) : 1 // Ensure page is valid
    }));
    
  } catch (error) {
    console.error("Error fetching orders:", error);
    showToast("Error fetching orders", "error");
  } finally {
    setLoading(false);
  }
}, [pagination.page, pagination.limit, sortBy, filters, searchQuery, showToast]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await orderApi.getOrdersByStatusCount();
      const counts = response.data.counts;
      
      setStats({
        pending: counts.pending || { count: 0, revenue: 0 },
        processing: counts.processing || { count: 0, revenue: 0 },
        shipped: counts.shipped || { count: 0, revenue: 0 },
        completed: counts.delivered || { count: 0, revenue: 0 },
        cancelled: counts.cancelled || { count: 0, revenue: 0 },
        total: counts.total || { orders: 0, revenue: 0 }
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      showToast("Error fetching statistics", "error");
    }
  }, [showToast]);

  const fetchRecentActivities = useCallback(async () => {
    try {
      const response = await orderApi.getRecentActivities();
      setRecentActivities(response.data.activities || []);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      showToast("Error fetching recent activities", "error");
    }
  }, [showToast]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
      case "Completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "processing":
      case "Processing":
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case "shipped":
      case "Shipped":
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case "pending":
      case "Pending":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
      case "Cancelled":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
      case "Completed":
        return "bg-green-100 text-green-800";
      case "processing":
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "pending":
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      paymentMethod: "",
      startDate: "",
      endDate: "",
    });
    setSearchQuery("");
  };

  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.length === 0) {
      showToast("Please select orders and choose a status", "warning");
      return;
    }

    try {
      await orderApi.bulkUpdateOrders({
        orderIds: selectedOrders,
        status: bulkStatus,
      });
      showToast("Orders updated successfully", "success");
      setSelectedOrders([]);
      setBulkStatus("");
      setIsStatusModalOpen(false);
      fetchOrders();
      fetchStatistics();
    } catch (error) {
      console.error("Error updating orders:", error);
      showToast("Error updating orders", "error");
    }
  };


  const handleViewOrder = (orderId) => {
    navigate(`/orders/view/${orderId}`);
  };

  const handlePrintOrder = async (order) => {
    try {
      const response = await orderApi.generateInvoice(order._id);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast("Invoice downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating invoice:", error);
      showToast("Error generating invoice", "error");
    }
  };

  const handleExportOrders = async (exportOptions) => {
    try {
      const response = await orderApi.exportOrders(exportOptions);
      
      // Convert to CSV
      const headers = Object.keys(response.data.orders[0] || {});
      const csvRows = [
        headers.join(','),
        ...response.data.orders.map(row => 
          headers.map(header => 
            JSON.stringify(row[header] || '')
          ).join(',')
        )
      ];
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast("Orders exported successfully", "success");
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Error exporting orders:", error);
      showToast("Error exporting orders", "error");
    }
  };

  const handleCreateManualOrder = () => {
    navigate("/orders/create");
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (field) => {
    setSortBy(field === sortBy ? `-${field}` : field);
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

        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-16"
          }`}
        >
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                  <p className="text-gray-600 mt-1">
                    Manage and track customer orders
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Export
                  </button>
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
                      placeholder="Search orders by ID, customer, or email..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </form>
                
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-500" />
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  {(filters.status || filters.startDate || filters.endDate) && (
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  {getStatusIcon("pending")}
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">Pending</div>
                    <div className="text-xl font-bold mt-1">{stats.pending.count}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  {getStatusIcon("processing")}
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">Processing</div>
                    <div className="text-xl font-bold mt-1">{stats.processing.count}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  {getStatusIcon("shipped")}
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">Shipped</div>
                    <div className="text-xl font-bold mt-1">{stats.shipped.count}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  {getStatusIcon("delivered")}
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">Completed</div>
                    <div className="text-xl font-bold mt-1">{stats.completed.count}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  {getStatusIcon("cancelled")}
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">Cancelled</div>
                    <div className="text-xl font-bold mt-1">{stats.cancelled.count}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="h-5 w-5 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">Total Orders</div>
                    <div className="text-xl font-bold mt-1">{stats.total.orders}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <span className="text-blue-800 font-medium">
                      {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Update Status</option>
                      <option value="processing">Mark as Processing</option>
                      <option value="shipped">Mark as Shipped</option>
                      <option value="delivered">Mark as Delivered</option>
                      <option value="cancelled">Mark as Cancelled</option>
                    </select>
                    <button
                      onClick={handleBulkStatusUpdate}
                      disabled={!bulkStatus}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setSelectedOrders([])}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedOrders.length === orders.length && orders.length > 0}
                              onChange={handleSelectAll}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                            onClick={() => handleSortChange('orderId')}
                          >
                            <div className="flex items-center">
                              Order ID
                              {sortBy === 'orderId' && ' ↓'}
                              {sortBy === '-orderId' && ' ↑'}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                            onClick={() => handleSortChange('createdAt')}
                          >
                            <div className="flex items-center">
                              Date
                              {sortBy === 'createdAt' && ' ↓'}
                              {sortBy === '-createdAt' && ' ↑'}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                            onClick={() => handleSortChange('grandTotal')}
                          >
                            <div className="flex items-center">
                              Amount
                              {sortBy === 'grandTotal' && ' ↓'}
                              {sortBy === '-grandTotal' && ' ↑'}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order._id)}
                                onChange={() => handleOrderSelect(order._id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderId}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.items?.length || 0} items
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  className="h-8 w-8 rounded-full"
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.user?._id || order.user?.firstName}`}
                                  alt={order.user?.firstName}
                                />
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {order.user?.firstName} {order.user?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {order.user?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(order.grandTotal)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(order.status)}
                                <span
                                  className={`ml-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewOrder(order._id)}
                                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                  title="View Details"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handlePrintOrder(order)}
                                  className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                  title="Print Invoice"
                                >
                                  <PrinterIcon className="h-5 w-5" />
                                </button>
                                {/* <button
                                  onClick={() => handleSingleStatusUpdate(order._id, 'processing')}
                                  className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                                  title="Update Status"
                                >
                                  <ArrowPathIcon className="h-5 w-5" />
                                </button> */}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                {/* Simpler Pagination */}
{pagination.total > 0 && (
  <div className="bg-white px-6 py-3 border-t border-gray-200">
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div className="mb-4 md:mb-0">
        <p className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {Math.max(1, (pagination.page - 1) * pagination.limit + 1)}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )}
          </span>{" "}
          of <span className="font-medium">{pagination.total}</span>{" "}
          results
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
          disabled={pagination.page <= 1}
          className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Previous
        </button>
        
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-500 px-2">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
        </div>
        
        <button
          onClick={() => handlePageChange(Math.min(pagination.totalPages || 1, pagination.page + 1))}
          disabled={pagination.page >= (pagination.totalPages || 1)}
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

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Order Activity
              </h2>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          activity.action === 'create' ? 'bg-purple-500' :
                          activity.action === 'update' ? 'bg-blue-500' :
                          activity.action === 'payment' ? 'bg-green-200' :
                          activity.action === 'delivered' ? 'bg-green-500' :
                          'bg-yellow-500'
                        } mr-3`}
                      ></div>
                      <div className="flex-1">
                        <span className="font-medium text-sm">{activity.orderId}</span>
                        <span className="text-gray-600 text-sm ml-2">{activity.description}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No recent activities
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExportOrders}
        />
      )}
    </div>
  );
};

export default Orders;