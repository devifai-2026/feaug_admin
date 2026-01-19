// components/modals/StatusUpdateModal.jsx
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import orderApi from "../../api/orders.api";

const StatusUpdateModal = ({ 
  isOpen, 
  onClose, 
  orderId,
  currentStatus,
  onStatusUpdated 
}) => {
  const [status, setStatus] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [updateType, setUpdateType] = useState("order"); // 'order', 'shipping', 'payment'
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Fetch order details when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderApi.getOrder(orderId);
      setOrderDetails(response.data.order);
      setStatus(response.data.order.status);
      setPaymentStatus(response.data.order.paymentStatus);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStatus("");
      setCancellationReason("");
      setAdminNotes("");
      setTrackingNumber("");
      setTrackingUrl("");
      setEstimatedDelivery("");
      setUpdateType("order");
      setPaymentStatus("");
      setOrderDetails(null);
    }
  }, [isOpen]);

  const getStatusOptions = () => {
    const baseOptions = [
      { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
      { value: "processing", label: "Processing", color: "bg-indigo-100 text-indigo-800" },
      { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
      { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
      { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
      { value: "refunded", label: "Refunded", color: "bg-pink-100 text-pink-800" },
    ];

    // Filter out current status from options
    return baseOptions.filter(option => option.value !== currentStatus);
  };

  const getShippingStatusOptions = () => {
    return [
      { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
      { value: "processing", label: "Processing", color: "bg-indigo-100 text-indigo-800" },
      { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
      { value: "in_transit", label: "In Transit", color: "bg-orange-100 text-orange-800" },
      { value: "out_for_delivery", label: "Out for Delivery", color: "bg-teal-100 text-teal-800" },
      { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
      { value: "failed", label: "Delivery Failed", color: "bg-red-100 text-red-800" },
      { value: "returned", label: "Returned", color: "bg-gray-100 text-gray-800" },
    ];
  };

  const getPaymentStatusOptions = () => {
    return [
      { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      { value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
      { value: "failed", label: "Failed", color: "bg-red-100 text-red-800" },
      { value: "refunded", label: "Refunded", color: "bg-pink-100 text-pink-800" },
      { value: "partial_refund", label: "Partially Refunded", color: "bg-blue-100 text-blue-800" },
      { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-800" },
    ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      
      switch (updateType) {
        case "order":
          const orderData = { status };
          if (status === "cancelled" && cancellationReason) {
            orderData.cancellationReason = cancellationReason;
          }
          if (adminNotes) {
            orderData.adminNotes = adminNotes;
          }
          response = await orderApi.updateOrderStatus(orderId, orderData);
          break;
        
        case "shipping":
          const shippingData = { shippingStatus: status };
          if (trackingNumber) shippingData.trackingNumber = trackingNumber;
          if (trackingUrl) shippingData.trackingUrl = trackingUrl;
          if (estimatedDelivery) shippingData.estimatedDelivery = estimatedDelivery;
          response = await orderApi.updateShippingStatus(orderId, shippingData);
          break;
        
        case "payment":
          response = await orderApi.updatePaymentStatus(orderId, { paymentStatus });
          break;
        
        default:
          throw new Error("Invalid update type");
      }

      onStatusUpdated(response.data.order);
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStatus = () => {
    if (!orderDetails) return null;

    const getStatusColor = (status) => {
      switch (status) {
        case "pending": return "bg-yellow-100 text-yellow-800";
        case "confirmed": return "bg-blue-100 text-blue-800";
        case "processing": return "bg-indigo-100 text-indigo-800";
        case "shipped": return "bg-purple-100 text-purple-800";
        case "delivered": return "bg-green-100 text-green-800";
        case "cancelled": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-gray-500">Order Status</span>
            <div className={`mt-1 px-2 py-1 inline-flex text-xs font-medium rounded-full ${getStatusColor(orderDetails.status)}`}>
              {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Shipping</span>
            <div className={`mt-1 px-2 py-1 inline-flex text-xs font-medium rounded-full ${getStatusColor(orderDetails.shippingStatus)}`}>
              {orderDetails.shippingStatus?.charAt(0).toUpperCase() + orderDetails.shippingStatus?.slice(1) || "N/A"}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Payment</span>
            <div className={`mt-1 px-2 py-1 inline-flex text-xs font-medium rounded-full ${
              orderDetails.paymentStatus === "paid" ? "bg-green-100 text-green-800" :
              orderDetails.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {orderDetails.paymentStatus?.charAt(0).toUpperCase() + orderDetails.paymentStatus?.slice(1) || "N/A"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderUpdateForm = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Update Order Status
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {getStatusOptions().map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                status === option.value
                  ? `${option.color.split(' ')[0]} border-2 ${option.color.split(' ')[1]} border-current`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {status === "cancelled" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cancellation Reason
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            rows="3"
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Reason for cancellation..."
          />
          <div className="mt-2 text-xs text-gray-500">
            This will be visible to the customer and logged in order history.
          </div>
        </div>
      )}
    </>
  );

  const renderShippingUpdateForm = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shipping Status
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {getShippingStatusOptions().map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                status === option.value
                  ? `${option.color.split(' ')[0]} border-2 ${option.color.split(' ')[1]} border-current`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tracking Number
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter tracking number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Delivery
          </label>
          <input
            type="date"
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tracking URL (Optional)
        </label>
        <input
          type="url"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="https://tracking.carrier.com/..."
        />
      </div>
    </>
  );

  const renderPaymentUpdateForm = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Status
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {getPaymentStatusOptions().map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPaymentStatus(option.value)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              paymentStatus === option.value
                ? `${option.color.split(' ')[0]} border-2 ${option.color.split(' ')[1]} border-current`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Update Order Status
                    </h3>
                    {orderDetails && (
                      <p className="text-sm text-gray-500 mt-1">
                        Order ID: {orderDetails.orderId}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Current Status */}
                {orderDetails && renderCurrentStatus()}

                {/* Update Type Tabs */}
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {["order", "shipping", "payment"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setUpdateType(tab)}
                          className={`
                            py-2 px-1 border-b-2 font-medium text-sm
                            ${
                              updateType === tab
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                          `}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)} Update
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {updateType === "order" && renderOrderUpdateForm()}
                  {updateType === "shipping" && renderShippingUpdateForm()}
                  {updateType === "payment" && renderPaymentUpdateForm()}

                  {/* Admin Notes (Common for all update types) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows="2"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Add internal notes about this update..."
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      These notes are only visible to admins.
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || (!status && updateType !== "payment") || (updateType === "payment" && !paymentStatus)}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Updating...
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;