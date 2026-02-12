import { useState, useEffect } from "react";
import {
  PlusIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import userApi from "../../api/user.api";

const Users = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [userStats, setUserStats] = useState(null);
  const [pagination, setPagination] = useState({
    totalUsers: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    currentPage: 1,
  });

  const statusOptions = ["All", "Active", "Inactive"];
  const roleOptions = ["All", "admin", "customer", "manager"];

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [currentPage, searchTerm, statusFilter, roleFilter, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters for server-side pagination and filtering
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort:
          sortConfig.direction === "desc"
            ? `-${sortConfig.key}`
            : sortConfig.key,
        search: searchTerm || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        role: roleFilter !== "All" ? roleFilter : "All",
      };

      // Remove undefined parameters
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key],
      );

      // Call the API with parameters
      const response = await userApi.getAllUsers(params);

      // Handle different response structures
      if (response.status === "success") {
        // Backend returns structured response
        const {
          users: userData,
          pagination: paginationData,
          stats,
        } = response.data;

        setUsers(userData || []);

        if (paginationData) {
          setPagination({
            totalUsers: paginationData.totalUsers || 0,
            totalPages: paginationData.totalPages || 1,
            hasNextPage: paginationData.hasNextPage || false,
            hasPrevPage: paginationData.hasPrevPage || false,
            currentPage: paginationData.currentPage || 1,
          });
        }

        if (stats) {
          setUserStats(stats);
        }
      } else if (Array.isArray(response)) {
        // Direct array response
        setUsers(response);
        setPagination((prev) => ({
          ...prev,
          totalUsers: response.length,
          totalPages: Math.ceil(response.length / itemsPerPage),
        }));
      } else if (response.data && Array.isArray(response.data)) {
        // Response with data property
        setUsers(response.data);
        setPagination((prev) => ({
          ...prev,
          totalUsers: response.data.length,
          totalPages: Math.ceil(response.data.length / itemsPerPage),
        }));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load users. Please try again.",
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const stats = await userApi.getUserStats();
      setUserStats(stats);
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border border-red-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "user":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await userApi.deleteUser(id);

        // Refresh the user list
        fetchUsers();
        fetchUserStats();

        // Show success message
        alert(`User "${name}" has been deleted successfully.`);
      } catch (err) {
        console.error("Error deleting user:", err);
        alert(
          err.response?.data?.message ||
            "Failed to delete user. Please try again.",
        );
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await userApi.updateUserStatus(id, !currentStatus);

      // Update local state
      const updatedUsers = users.map((user) =>
        user._id === id ? { ...user, isActive: !currentStatus } : user,
      );
      setUsers(updatedUsers);

      // Refresh stats
      fetchUserStats();
    } catch (err) {
      console.error("Error updating user status:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update user status. Please try again.",
      );
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setRoleFilter("All");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(1);
  };

  const refreshData = () => {
    fetchUsers();
    fetchUserStats();
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate displayed range
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(
    currentPage * itemsPerPage,
    pagination.totalUsers,
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex h-screen">
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <main
            className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? "lg:pl-6" : "lg:pl-6"}`}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${
            sidebarOpen ? "lg:pl-6" : "lg:pl-6"
          }`}
        >
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                  <p className="text-gray-600">
                    Manage user accounts and permissions (
                    {pagination.totalUsers} users)
                  </p>
                </div>
                <div className="flex items-center gap-3"></div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            )}

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Users</div>
                    <div className="text-2xl font-bold mt-1">
                      {userStats?.totalUsers || pagination.totalUsers}
                    </div>
                    {userStats?.newUsersToday > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        +{userStats.newUsersToday} today
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Active Users</div>
                    <div className="text-2xl font-bold mt-1">
                      {userStats?.activeUsers ||
                        users.filter((u) => u.isActive).length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        ((userStats?.activeUsers ||
                          users.filter((u) => u.isActive).length) /
                          (userStats?.totalUsers || users.length || 1)) *
                          100 || 0,
                      )}
                      % of total
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Verified Users</div>
                    <div className="text-2xl font-bold mt-1">
                      {userStats?.verifiedUsers ||
                        users.filter((u) => u.isEmailVerified).length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        ((userStats?.verifiedUsers ||
                          users.filter((u) => u.isEmailVerified).length) /
                          (userStats?.totalUsers || users.length || 1)) *
                          100 || 0,
                      )}
                      % verified
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <UserIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">New This Month</div>
                    <div className="text-2xl font-bold mt-1">
                      {userStats?.newThisMonth ||
                        users.filter((user) => {
                          if (!user.createdAt) return false;
                          const joinDate = new Date(user.createdAt);
                          const currentMonth = new Date().getMonth();
                          const currentYear = new Date().getFullYear();
                          return (
                            joinDate.getMonth() === currentMonth &&
                            joinDate.getFullYear() === currentYear
                          );
                        }).length}
                    </div>
                    {userStats?.monthlyGrowth && (
                      <div
                        className={`text-xs ${userStats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"} mt-1`}
                      >
                        {userStats.monthlyGrowth >= 0 ? "↑" : "↓"}{" "}
                        {Math.abs(userStats.monthlyGrowth)}% from last month
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search users by name, email, phone, or role..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page when searching
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          Status: {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      {roleOptions.map((option) => (
                        <option key={option} value={option}>
                          Role: {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Reset all filters"
                  >
                    <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("firstName")}
                      >
                        <div className="flex items-center">
                          User
                          {sortConfig.key === "firstName" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("role")}
                      >
                        <div className="flex items-center">
                          Role
                          {sortConfig.key === "role" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("isActive")}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig.key === "isActive" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center">
                          Joined
                          {sortConfig.key === "createdAt" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-lg mb-2">No users found</p>
                            <p className="text-sm mb-4">
                              {error ||
                                "Try adjusting your filters or search terms"}
                            </p>
                            <button
                              onClick={resetFilters}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Reset all filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Link
                                to={`/users/edit/${user._id}`}
                                className="flex items-center hover:opacity-80 transition-opacity group"
                              >
                                <img
                                  className="h-10 w-10 rounded-full bg-gray-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                                  src={
                                    user.profileImage ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || user._id}`
                                  }
                                  alt={`${user.firstName} ${user.lastName}`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || user._id}`;
                                  }}
                                />
                                <div className="ml-4 text-left">
                                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: #{user._id?.slice(-6) || "N/A"}
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900">
                                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                {user.email || "N/A"}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                                {user.phone || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`px-3 py-1 text-xs rounded-full ${getRoleColor(
                                  user.role || "user",
                                )}`}
                              >
                                {user.role || "user"}
                              </span>
                              {user.isEmailVerified && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full border border-green-200">
                                  Verified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleStatusToggle(user._id, user.isActive)
                                }
                                className={`p-1 rounded-full transition-colors ${
                                  user.isActive
                                    ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                                    : "text-red-600 hover:text-red-800 hover:bg-red-50"
                                }`}
                                title={`Toggle ${user.isActive ? "Inactive" : "Active"}`}
                              >
                                {user.isActive ? (
                                  <EyeIcon className="h-5 w-5" />
                                ) : (
                                  <EyeSlashIcon className="h-5 w-5" />
                                )}
                              </button>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  user.isActive
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/users/edit/${user._id}`}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() =>
                                  handleDelete(
                                    user._id,
                                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                                      user.email,
                                  )
                                }
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalUsers > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem}</span> to{" "}
                  <span className="font-medium">{indexOfLastItem}</span> of{" "}
                  <span className="font-medium">{pagination.totalUsers}</span>{" "}
                  users
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`p-2 rounded-lg border ${
                      !pagination.hasPrevPage
                        ? "text-gray-400 border-gray-300 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  )
                    .filter((page) => {
                      if (pagination.totalPages <= 5) return true;
                      if (page === 1 || page === pagination.totalPages)
                        return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1)
                        return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      if (prevPage && page - prevPage > 1) {
                        return (
                          <div
                            key={`ellipsis-${page}`}
                            className="flex items-center"
                          >
                            <span className="px-2 text-gray-500">...</span>
                            <button
                              onClick={() => goToPage(page)}
                              className={`px-3 py-1 rounded-lg ${
                                currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 rounded-lg ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`p-2 rounded-lg border ${
                      !pagination.hasNextPage
                        ? "text-gray-400 border-gray-300 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Users;
