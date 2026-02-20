import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    UserIcon,
    EnvelopeIcon,
    CurrencyRupeeIcon,
    ShoppingBagIcon,
    TruckIcon,
} from '@heroicons/react/24/outline';

/**
 * Get the appropriate icon component for a notification type
 * @param {string} type - Notification type from backend
 * @returns {Component} - Heroicon component
 */
export const getNotificationIcon = (type) => {
    const iconMap = {
        new_order: ShoppingBagIcon,
        order_update: InformationCircleIcon,
        payment_received: CurrencyRupeeIcon,
        payment_failed: ExclamationTriangleIcon,
        low_stock: ExclamationTriangleIcon,
        out_of_stock: ExclamationTriangleIcon,
        new_user: UserIcon,
        new_review: CheckCircleIcon,
        refund_request: CurrencyRupeeIcon,
        shipping_update: TruckIcon,
        system: InformationCircleIcon,
        admin_notification: EnvelopeIcon,
    };

    return iconMap[type] || InformationCircleIcon;
};

/**
 * Get the appropriate color class for a notification type
 * @param {string} type - Notification type from backend
 * @returns {string} - Tailwind CSS color class
 */
export const getNotificationColor = (type) => {
    const colorMap = {
        new_order: 'bg-green-500',
        order_update: 'bg-blue-500',
        payment_received: 'bg-emerald-500',
        payment_failed: 'bg-red-500',
        low_stock: 'bg-yellow-500',
        out_of_stock: 'bg-red-500',
        new_user: 'bg-purple-500',
        new_review: 'bg-blue-500',
        refund_request: 'bg-orange-500',
        shipping_update: 'bg-indigo-500',
        system: 'bg-gray-500',
        admin_notification: 'bg-pink-500',
    };

    return colorMap[type] || 'bg-gray-500';
};

/**
 * Format a timestamp to relative time (e.g., "2 minutes ago")
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} - Formatted relative time
 */
export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';

    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now - then) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
};

/**
 * Get the navigation route for a notification based on its type and data
 * @param {Object} notification - Notification object
 * @returns {string|null} - Route path or null if no route
 */
export const getNotificationRoute = (notification) => {
    const { type, data, entityType, entityId } = notification;

    // Handle entity-based routing
    if (entityType && entityId) {
        switch (entityType) {
            case 'order':
                return `/orders/view/${entityId}`;
            case 'product':
                return `/products/view/${entityId}`;
            case 'user':
                return `/users/edit/${entityId}`;
            case 'review':
                return `/products`; // Could be enhanced to go to specific product
            default:
                break;
        }
    }

    // Handle type-based routing
    switch (type) {
        case 'new_order':
        case 'order_update':
        case 'payment_received':
        case 'refund_request':
        case 'shipping_update':
            return data?.orderDbId ? `/orders/view/${data.orderDbId}` : '/orders';

        case 'low_stock':
        case 'out_of_stock':
            return data?.productId ? `/products/view/${data.productId}` : '/products';

        case 'new_user':
            return data?.userId ? `/users/edit/${data.userId}` : '/users';

        case 'new_review':
            return data?.productId ? `/products/view/${data.productId}` : '/products';

        default:
            return null;
    }
};

/**
 * Transform backend notification to frontend format
 * @param {Object} notification - Backend notification object
 * @returns {Object} - Frontend-formatted notification
 */
export const transformNotification = (notification) => {
    return {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        time: formatRelativeTime(notification.createdAt),
        timestamp: notification.createdAt,
        read: notification.isRead || false,
        icon: getNotificationIcon(notification.type),
        color: getNotificationColor(notification.type),
        priority: notification.priority,
        data: notification.data,
        entityType: notification.entityType,
        entityId: notification.entityId,
    };
};
