import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Only connect if user is logged in
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Get API URL from environment or use default
    const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No auth token found, skipping socket connection");
      return;
    }

    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      auth: {
        token,
      },
      // Default transports (polling first) is often more robust
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setConnected(true);
      // Join admin room for receiving notifications
      // User ID can be _id or id depending on the model
      const userId = user.user._id || user.user.id;
      console.log(user, userId)
      if (userId) {
        socketInstance.emit("admin-join", userId);
        console.log("Joined admin room with userId:", userId);
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnected(false);
    });

    // Listen for new orders (backend emits 'new_order')
    socketInstance.on("new_order", (data) => {
      console.log("New order socket event received:", data);
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "new_order",
          title: "New Order",
          message:
            data.message ||
            `${data.userName || "A customer"} bought ${data.productName || "items"}`,
          timestamp: data.timestamp || new Date().toISOString(),
          read: false,
          data: data,
          color: "bg-green-500",
          icon: "ShoppingBagIcon", // Placeholder for logic handled in transform
        },
        ...prev,
      ]);
    });

    // Listen for order updates
    socketInstance.on("order-status-update", (data) => {
      console.log("🔥 SOCKET API EVENT RECEIVED: order-status-update", data);
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "order_update",
          title: "Order Updated",
          message: `Order #${data.orderId} status changed to ${data.status}`,
          timestamp: data.timestamp || new Date().toISOString(),
          read: false,
          data: data,
        },
        ...prev,
      ]);
    });

    // Listen for low stock alerts
    socketInstance.on("low_stock_alert", (data) => {
      console.log("🔥 SOCKET API EVENT RECEIVED: low_stock_alert", data);
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "low_stock",
          title: "Low Stock Alert",
          message: `${data.productName} is running low (${data.currentStock}/${data.threshold} units)`,
          timestamp: data.timestamp || new Date().toISOString(),
          read: false,
          data: data,
        },
        ...prev,
      ]);
    });

    setSocket(socketInstance);

    // Cleanup on unmount or user change
    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const value = {
    socket,
    connected,
    notifications,
    setNotifications,
    emit: (event, data) => {
      if (socket && connected) socket.emit(event, data);
    },
    on: (event, callback) => {
      if (socket) socket.on(event, callback);
    },
    off: (event, callback) => {
      if (socket) socket.off(event, callback);
    },
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
