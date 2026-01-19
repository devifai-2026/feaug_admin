import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,

  TrashIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,

  ArrowTrendingUpIcon,
  ClockIcon,
  HeartIcon,

  CalendarIcon,

  DocumentDuplicateIcon,
  ShieldCheckIcon as ShieldCheckSolid,
  EyeIcon,

  ArrowDownTrayIcon,
  ChartPieIcon,
  UsersIcon,

  BanknotesIcon,

} from "@heroicons/react/24/outline";
import {
  CheckBadgeIcon,
  FireIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import userApi from "../../api/user.api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale, // Add this
} from "chart.js";
import { FaRupeeSign } from "react-icons/fa"; // FontAwesome rupee
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  RadialLinearScale, // Add this
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "customer",
    isActive: true,
    isEmailVerified: false,
    profileImage: "",
    addresses: [],
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await userApi.getUserById(id);
      const { user, analytics, activityLog, recentOrders, wishlistItems } =
        response.data;

      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "customer",
        isActive: user.isActive !== undefined ? user.isActive : true,
        isEmailVerified: user.isEmailVerified || false,
        profileImage: user.profileImage || "",
        addresses: user.addresses || [],
      });

      setOriginalData(user);
      setAnalytics(analytics);
      setActivityLog(activityLog || []);
      setRecentOrders(recentOrders || []);
      setWishlistItems(wishlistItems || []);
    } catch (err) {
      console.error("Error loading user:", err);
      setErrorMessage("Failed to load user data");
      setTimeout(() => navigate("/users"), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Premium chart configurations

  const spendingTrendChart = {
  labels: (() => {
    // Generate last 6 months labels
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString("en-US", { month: "short" }));
    }
    
    return months;
  })(),
  datasets: [
    {
      label: "Spending Trend",
      data: (() => {
        // Create a map of month->amount from analytics data
        const monthlyMap = {};
        analytics?.monthlyData?.forEach(item => {
          const date = new Date(item.month);
          const monthKey = date.toLocaleDateString("en-US", { month: "short" });
          monthlyMap[monthKey] = item.amount;
        });
        
        // Generate last 6 months data
        const now = new Date();
        const data = [];
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleDateString("en-US", { month: "short" });
          const amount = monthlyMap[monthKey] || 0;
          data.push(amount / 1000); // Convert to thousands
        }
        
        return data;
      })(),
      borderColor: "rgba(139, 92, 246, 0.9)",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      borderWidth: 3,
      fill: true,
      tension: 0.5,
      pointBackgroundColor: "rgb(139, 92, 246)",
      pointBorderColor: "#fff",
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
    },
  ],
};

  const spendingTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        padding: 12,
        titleFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        borderColor: "rgba(139, 92, 246, 0.3)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) =>
            `₹${(context.raw * 1000).toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: "rgba(107, 114, 128, 0.8)",
          callback: (value) => `₹${value}K`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: "rgba(107, 114, 128, 0.8)",
        },
      },
    },
  };

  const orderDistributionChart = {
    labels: ["Completed", "Processing", "Pending", "Cancelled"],
    datasets: [
      {
        data: [
          analytics?.orderStats?.completedOrders || 0,
          analytics?.orderStats?.pendingOrders || 0,
          analytics?.orderStats?.pendingOrders || 0,
          analytics?.orderStats?.cancelledOrders || 0,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.9)",
          "rgba(59, 130, 246, 0.9)",
          "rgba(250, 204, 21, 0.9)",
          "rgba(239, 68, 68, 0.9)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(59, 130, 246)",
          "rgb(250, 204, 21)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
        hoverOffset: 20,
      },
    ],
  };

  const orderDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        padding: 12,
        titleFont: {
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          family: "'Inter', sans-serif",
        },
      },
    },
    cutout: "75%",
  };

  const userEngagementRadarChart = {
    labels: ["Orders", "Login Frequency", "Wishlist", "Cart Activity"],
    datasets: [
      {
        label: "Engagement Score",
        data: [
          analytics?.orderStats?.totalOrders || 0,
          analytics?.loginCount || 0,
          analytics?.wishlistCount || 0,
          analytics?.cartItemsCount || 0,
        ],
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderColor: "rgba(139, 92, 246, 0.9)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(139, 92, 246, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const userEngagementOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        padding: 12,
        titleFont: {
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          family: "'Inter', sans-serif",
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: "rgba(0, 0, 0, 0.06)",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
        },
        ticks: {
          backdropColor: "transparent",
          font: {
            family: "'Inter', sans-serif",
            size: 10,
          },
          color: "rgba(107, 114, 128, 0.8)",
        },
        pointLabels: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: "rgba(75, 85, 99, 0.9)",
        },
      },
    },
  };

  const handleStatusToggle = async () => {
    try {
      await userApi.updateUserStatus(id, !formData.isActive);
      setFormData((prev) => ({
        ...prev,
        isActive: !prev.isActive,
      }));
      setSuccessMessage(
        `User ${!formData.isActive ? "activated" : "deactivated"} successfully`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Error updating user status");
    }
  };

  const handleSaveChanges = async () => {
    try {
      await userApi.updateUser(id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      });
      setSuccessMessage("User updated successfully");
      setShowSaveModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Error updating user");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: {
        gradient: "from-rose-500 to-pink-600",
        icon: ShieldCheckSolid,
        label: "Administrator",
      },
      manager: {
        gradient: "from-blue-500 to-indigo-600",
        icon: UsersIcon,
        label: "Manager",
      },
      customer: {
        gradient: "from-emerald-500 to-green-600",
        icon: UserIcon,
        label: "Customer",
      },
    };

    const { gradient, icon: Icon, label } = config[role] || config.customer;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-medium`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      active: {
        color: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
        icon: CheckCircleIcon,
        label: "Active",
      },
      inactive: {
        color: "bg-rose-500/10 text-rose-700 border-rose-200",
        icon: XCircleIcon,
        label: "Inactive",
      },
    };

    const statusKey = formData.isActive ? "active" : "inactive";
    const { color, icon: Icon, label } = config[statusKey];

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${color} text-sm font-medium`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Sidebar sidebarOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-48 mb-4"></div>
                <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-8"></div>
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-24 bg-white rounded-2xl shadow-sm border border-gray-200"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/users")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group transition-all duration-300"
                  >
                    <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Users</span>
                  </button>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span className="text-sm text-gray-500">User Management</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20"></div>
                    <img
                      className="relative h-20 w-20 rounded-2xl border-4 border-white shadow-lg"
                      src={
                        formData.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}&backgroundColor=8b5cf6`
                      }
                      alt="Profile"
                    />
                    {formData.isActive && (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-3 border-white shadow-md flex items-center justify-center">
                        <CheckCircleIcon className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {formData.firstName} {formData.lastName}
                    </h1>
                    <p className="text-gray-600 mt-1">{formData.email}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {getRoleBadge(formData.role)}
                      {getStatusBadge()}
                      {formData.isEmailVerified && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-200 text-sm font-medium">
                          <CheckBadgeIcon className="h-4 w-4" />
                          Email Verified
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStatusToggle}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      formData.isActive
                        ? "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg"
                        : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {formData.isActive ? (
                      <>
                        <XCircleIcon className="h-5 w-5" />
                        Deactivate User
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Activate User
                      </>
                    )}
                  </button>
                   <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Delete User
                  </button>
                </div>

              </div>
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-6 animate-slideDown">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl flex items-center gap-3 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-emerald-700 font-medium">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 animate-slideDown">
                <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl flex items-center gap-3 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-rose-600" />
                  </div>
                  <p className="text-rose-700 font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                    {(
                      (analytics?.orderStats?.completedOrders /
                        (analytics?.orderStats?.totalOrders || 1)) *
                      100
                    ).toFixed(0)}
                    % Rate
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.orderStats?.totalOrders || 0}
                </p>
                <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{
                      width: `${
                        (analytics?.orderStats?.completedOrders /
                          (analytics?.orderStats?.totalOrders || 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                    <FaRupeeSign className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(analytics?.orderStats?.totalSpent || 0)}
                </p>
                <div className="mt-3 flex items-center gap-1 text-sm text-emerald-600">
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                  <span>Growing steadily</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <HeartIcon className="h-6 w-6 text-rose-600" />
                  </div>
                  <span className="text-sm font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                    {analytics?.wishlistCount || 0} Items
                  </span>
                </div>
                <p className="text-sm text-gray-600">Wishlist</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.wishlistCount || 0}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 border-2 border-white"
                      ></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    Active interests
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    {activityLog.length} Events
                  </span>
                </div>
                <p className="text-sm text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activityLog.length}
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    Last:{" "}
                    {activityLog[0]
                      ? formatDate(activityLog[0].createdAt).split(",")[0]
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Premium Tabs */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  {[
                    "overview",
                    "profile",
                    "orders",
                    "analytics",
                    "activity",
                  ].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeTab === tab
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="capitalize">{tab}</span>
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Spending Trend Chart */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Spending Trend
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Monthly spending pattern
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                          ₹
                          {(analytics?.orderStats?.totalSpent / 1000).toFixed(
                            1
                          )}
                          K Total
                        </span>
                      </div>
                    </div>
                    <div className="h-64">
                      <Line
                        data={spendingTrendChart}
                        options={spendingTrendOptions}
                      />
                    </div>
                  </div>

                  {/* Order Distribution Chart */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order Distribution
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Status breakdown of orders
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                          {analytics?.orderStats?.totalOrders || 0} Orders
                        </span>
                      </div>
                    </div>
                    <div className="h-64">
                      <Doughnut
                        data={orderDistributionChart}
                        options={orderDistributionOptions}
                      />
                    </div>
                  </div>

                  {/* User Engagement Radar */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Engagement Score
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Multi-dimensional analysis
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                       
                      </div>
                    </div>
                    <div className="h-64">
                      <Radar
                        data={userEngagementRadarChart}
                        options={userEngagementOptions}
                      />
                    </div>
                  </div>

                  {/* Quick Actions & Info */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Account Information
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          User details & quick actions
                        </p>
                      </div>
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Member Since
                        </span>
                        <span className="font-medium">
                          {formatDate(originalData?.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Last Activity
                        </span>
                        <span className="font-medium">
                          {activityLog[0]
                            ? formatDate(activityLog[0].createdAt).split(
                                " at "
                              )[0]
                            : "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Email Status
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            formData.isEmailVerified
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {formData.isEmailVerified ? "Verified" : "Pending"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 mt-6">
                        <button className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-300 flex flex-col items-center justify-center">
                          <EnvelopeIcon className="h-5 w-5 text-blue-600 mb-2" />
                          <span className="text-sm font-medium text-gray-900">
                            Send Email
                          </span>
                        </button>

        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Personal Info */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Personal Information Card */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                          <UserIcon className="h-6 w-6 text-purple-600" />
                          Personal Information
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Update user's personal details
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          First Name
                        </label>
                        <div className="relative">
                          <input
                            readOnly
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3.5 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white"
                            placeholder="Enter first name"
                          />
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Last Name
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white"
                          placeholder="Enter last name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            readOnly
                            value={formData.email}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3.5 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white"
                            placeholder="user@example.com"
                          />
                          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Phone Number
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            readOnly
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3.5 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white"
                            placeholder="+91 12345 67890"
                          />
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role & Permissions Card */}
                </div>

                {/* Right Column - Side Stats */}
                <div className="space-y-8">
                  {/* Account Status Card */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Account Status
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Account Active
                          </p>
                          <p className="text-sm text-gray-600">
                            User can access the system
                          </p>
                        </div>
                        <button
                          onClick={handleStatusToggle}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            formData.isActive ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                              formData.isActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="h-px bg-gray-200"></div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Email Verified
                          </p>
                          <p className="text-sm text-gray-600">
                            Email confirmation status
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            formData.isEmailVerified
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {formData.isEmailVerified ? "Verified" : "Pending"}
                        </div>
                      </div>

                      <div className="h-px bg-gray-200"></div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Last Updated
                          </p>
                          <p className="text-sm text-gray-600">
                            Profile modification date
                          </p>
                        </div>
                        <div className="text-sm text-gray-900">
                          {formatDate(originalData?.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Card */}
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-6">
                      User Insights
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <span className="text-sm opacity-90">
                          Avg Order Value
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(
                            analytics?.orderStats?.avgOrderValue || 0
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <span className="text-sm opacity-90">
                          Order Frequency
                        </span>
                        <span className="font-semibold">
                          {(analytics?.orderStats?.totalOrders || 0) > 0
                            ? "Monthly"
                            : "No Orders"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <span className="text-sm opacity-90">
                          Preferred Category
                        </span>
                        <span className="font-semibold">
                          {analytics?.categorySpending?.[0]?._id || "N/A"}
                        </span>
                      </div>
                    </div>

                    <button className="w-full mt-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2">
                      <SparklesIcon className="h-5 w-5" />
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab - Same structure but with premium styling */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Revenue Analysis
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Monthly revenue breakdown
                        </p>
                      </div>
                      <BanknotesIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="h-64">
                      <Bar
                        data={spendingTrendChart}
                        options={spendingTrendOptions}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Performance Metrics
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Key user performance indicators
                        </p>
                      </div>
                      <ChartPieIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="h-64">
                      <Doughnut
                        data={orderDistributionChart}
                        options={orderDistributionOptions}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                    Recent Activity
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    User actions and system events
                  </p>
                </div>

                <div className="divide-y divide-gray-200">
                  {activityLog.slice(0, 10).map((activity, index) => (
                    <div
                      key={activity._id}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                            activity.action.includes("ACTIVATED")
                              ? "bg-emerald-100"
                              : activity.action.includes("DEACTIVATED")
                              ? "bg-rose-100"
                              : "bg-purple-100"
                          }`}
                        >
                          {activity.action.includes("ACTIVATED") ? (
                            <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                          ) : activity.action.includes("DEACTIVATED") ? (
                            <XCircleIcon className="h-6 w-6 text-rose-600" />
                          ) : (
                            <UserIcon className="h-6 w-6 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {activity.action.replace(/_/g, " ")}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(activity.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Performed by{" "}
                            <span className="font-medium">
                              {activity.performedBy?.fullName}
                            </span>
                          </p>
                          {activity.details && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                {JSON.stringify(activity.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
                        Order History
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {recentOrders.length} orders found
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2">
                      <ShoppingBagIcon className="h-5 w-5" />
                      View All Orders
                    </button>
                  </div>
                </div>

                {recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Order Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                          <tr
                            key={order._id}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {order.orderId ||
                                    `#${order._id.slice(-8).toUpperCase()}`}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Invoice: {order.invoiceNumber || "N/A"}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-900">
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(order.createdAt).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    order.status === "delivered"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : order.status === "pending"
                                      ? "bg-amber-100 text-amber-700"
                                      : order.status === "shipped"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {order.status}
                                </span>
                                <p className="text-xs text-gray-500">
                                  Payment: {order.paymentStatus}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(order.grandTotal)}
                                </p>
                                {order.discount > 0 && (
                                  <p className="text-xs text-emerald-600 mt-1">
                                    Saved: {formatCurrency(order.discount)}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-900">
                                  {order.items?.length || 0} products
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {order.items?.reduce(
                                    (sum, item) => sum + (item.quantity || 1),
                                    0
                                  ) || 0}{" "}
                                  units
                                </p>
                                {order.items?.[0]?.productName && (
                                  <p className="text-xs text-gray-500 truncate max-w-[120px] mt-1">
                                    {order.items[0].productName}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors">
                                <EyeIcon className="h-4 w-4" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <ShoppingBagIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      No orders found for this user
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      The user hasn't placed any orders yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Save Changes Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 animate-scaleIn">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mr-4">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Save Changes
                </h3>
                <p className="text-sm text-gray-600">Confirm profile updates</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to update the profile of{" "}
                <span className="font-semibold text-gray-900">
                  {formData.firstName} {formData.lastName}
                </span>
                ?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 animate-scaleIn">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete User
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-rose-800">
                Warning: Deleting{" "}
                <span className="font-semibold">
                  {formData.firstName} {formData.lastName}
                </span>{" "}
                will permanently remove:
              </p>
              <ul className="mt-2 text-sm text-rose-700 space-y-1">
                <li>• All user data and profile information</li>
                <li>• Order history and transaction records</li>
                <li>• Wishlist and saved preferences</li>
                <li>• Activity logs and engagement data</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  navigate("/users");
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-medium"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEdit;
