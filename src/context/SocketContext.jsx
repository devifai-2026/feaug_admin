import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Get API URL from environment or use default
        const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Get auth token and user ID
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');

        if (!token) {
            console.log('No auth token found, skipping socket connection');
            return;
        }

        // Initialize socket connection
        const socketInstance = io(SOCKET_URL, {
            auth: {
                token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        // Connection event handlers
        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setConnected(true);

            // Join admin room for receiving notifications
            if (userId) {
                socketInstance.emit('admin-join', userId);
                console.log('Joined admin room with userId:', userId);
            }
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setConnected(false);
        });

        // Listen for general notifications
        socketInstance.on('notification', (data) => {
            console.log('New notification received:', data);
            setNotifications(prev => [data, ...prev]);
        });

        // Listen for new orders (backend emits 'new_order')
        socketInstance.on('new_order', (data) => {
            console.log('New order received:', data);
            setNotifications(prev => [{
                id: Date.now(),
                type: 'order',
                title: 'New Order',
                message: `New order #${data.orderId} from ${data.userName} - ₹${data.total}`,
                timestamp: data.timestamp || new Date().toISOString(),
                read: false,
                data: data
            }, ...prev]);
        });

        // Listen for order updates (backend emits 'order-status-update')
        socketInstance.on('order-status-update', (data) => {
            console.log('Order status updated:', data);
            setNotifications(prev => [{
                id: Date.now(),
                type: 'order_update',
                title: 'Order Updated',
                message: `Order #${data.orderId} status changed to ${data.status}`,
                timestamp: data.timestamp || new Date().toISOString(),
                read: false,
                data: data
            }, ...prev]);
        });

        // Listen for low stock alerts (backend emits 'low_stock_alert')
        socketInstance.on('low_stock_alert', (data) => {
            console.log('Low stock alert:', data);
            setNotifications(prev => [{
                id: Date.now(),
                type: 'stock',
                title: 'Low Stock Alert',
                message: `${data.productName} is running low (${data.currentStock}/${data.threshold} units)`,
                timestamp: data.timestamp || new Date().toISOString(),
                read: false,
                data: data
            }, ...prev]);
        });

        // Listen for payment received (backend emits 'payment_received')
        socketInstance.on('payment_received', (data) => {
            console.log('Payment received:', data);
            setNotifications(prev => [{
                id: Date.now(),
                type: 'payment',
                title: 'Payment Received',
                message: `Payment of ₹${data.amount} received for order #${data.orderId}`,
                timestamp: data.timestamp || new Date().toISOString(),
                read: false,
                data: data
            }, ...prev]);
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const value = {
        socket,
        connected,
        notifications,
        setNotifications,
        // Helper methods
        emit: (event, data) => {
            if (socket && connected) {
                socket.emit(event, data);
            }
        },
        on: (event, callback) => {
            if (socket) {
                socket.on(event, callback);
            }
        },
        off: (event, callback) => {
            if (socket) {
                socket.off(event, callback);
            }
        }
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
