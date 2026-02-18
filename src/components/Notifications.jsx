import React, { useState, useEffect } from "react";
import {
  BellIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  UserIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import notificationsApi from "../api/notifications.api";
import {
  transformNotification,
  getNotificationRoute,
} from "../utils/notificationUtils";
import { useNavigate } from "react-router-dom";

import { useSocket } from "../context/SocketContext";

const Notifications = () => {
  const { notifications: socketNotifications } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const navigate = useNavigate();

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const limit = 10;
      const offset = (page - 1) * limit;

      const response = await notificationsApi.getNotifications({
        limit,
        offset,
      });
      if (response.status === "success") {
        const transformed = response.data.notifications.map(
          transformNotification,
        );
        setNotifications(transformed);
        setPagination({
          page: response.data.page,
          totalPages: response.data.totalPages,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Merge socket notifications with list
  useEffect(() => {
    if (socketNotifications && socketNotifications.length > 0) {
      console.log(
        "🔔 Notifications Component received socket update:",
        socketNotifications[0],
      );
      const latest = socketNotifications[0];

      // Check if exists
      const exists = notifications.some(
        (n) =>
          n.id === latest.id ||
          (n.data?.orderId === latest.data?.orderId && n.type === latest.type),
      );

      if (!exists) {
        const formatted = {
          ...latest,
          icon:
            latest.icon === "ShoppingBagIcon"
              ? ShoppingBagIcon
              : InformationCircleIcon,
          color: latest.color || "bg-blue-500",
          time: "Just now",
        };

        setNotifications((prev) => [formatted, ...prev]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      }
    }
  }, [socketNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const [deletingIds, setDeletingIds] = useState([]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    // Animate out
    setDeletingIds((prev) => [...prev, id]);

    // Wait for animation
    setTimeout(async () => {
      try {
        await notificationsApi.deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setDeletingIds((prev) => prev.filter((delId) => delId !== id)); // Cleanup
      } catch (error) {
        console.error("Error deleting notification:", error);
        // Revert UI if needed or re-fetch
        fetchNotifications();
      }
    }, 300);
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    const route = getNotificationRoute(notification);
    if (route) {
      navigate(route);
    }
  };



  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notifications
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all your store notifications and alerts
            </p>
          </div>

          <button
            onClick={() => fetchNotifications()}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowPathIcon
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <BellIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="h-4 w-48 bg-gray-100 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-50 rounded"></div>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BellIcon className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No notifications found
            </h3>
            <p className="text-gray-500 text-center max-w-xs mt-2">
              When important events happen in your store, they'll appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative group overflow-hidden cursor-pointer transition-all duration-300 ease-in-out mb-2 rounded-lg border ${deletingIds.includes(notification.id)
                        ? "translate-x-full opacity-0 h-0 my-0 py-0"
                        : "opacity-100"
                      } ${!notification.read ? "bg-blue-50/40 border-blue-100" : "bg-white border-gray-100 hover:shadow-sm"}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4 p-4 sm:p-6">
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${notification.color}`}
                      >
                        <notification.icon className="h-5 w-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0 pr-8">
                        {" "}
                        {/* Right padding for delete button space */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4
                            className={`text-sm font-bold truncate ${!notification.read ? "text-blue-900" : "text-gray-900"}`}
                          >
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {notification.time}
                          </span>
                        </div>
                        <p
                          className={`text-sm leading-relaxed ${!notification.read ? "text-gray-700" : "text-gray-500"}`}
                        >
                          {notification.message}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Hover Delete Button */}
                      <button
                        onClick={(e) => handleDelete(notification.id, e)}
                        className="absolute right-4 top-4 p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                        title="Delete notification"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>

                      {!notification.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * 20 + 1} to{" "}
                  {Math.min(pagination.page * 20, pagination.total)} of{" "}
                  {pagination.total} notifications
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchNotifications(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchNotifications(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
