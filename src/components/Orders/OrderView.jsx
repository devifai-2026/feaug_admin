import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  CurrencyRupeeIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";


import moment from "moment";
import orderApi from "../../api/orders.api";
import { useToast } from "../../context/ToastContext";
import { useSocket } from "../../context/SocketContext";
import StatusUpdateModal from "../../components/Modals/StatusUpdateModal";

const OrderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { on, off } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Shipment management states
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [couriers, setCouriers] = useState([]);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  // AWB manual edit
  const [editingAWB, setEditingAWB] = useState(false);
  const [awbInput, setAwbInput] = useState("");
  const [courierNameInput, setCourierNameInput] = useState("");
  const [awbSaving, setAwbSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      fetchOrderTimeline();
    }
  }, [id]);

  // Listen for real-time shipping events for this order
  useEffect(() => {
    const handleShippingIssue = (data) => {
      if (data.orderDbId === id || data.orderId === order?.orderId) {
        showToast(data.message || `Shipping issue: ${data.issue}`, "error");
        fetchOrderDetails();
      }
    };
    const handleShippingConfirmed = (data) => {
      if (data.orderDbId === id || data.orderId === order?.orderId) {
        showToast(data.message || "Shipment confirmed!", "success");
        fetchOrderDetails();
      }
    };
    const handleRetrySuccess = (data) => {
      if (data.orderDbId === id || data.orderId === order?.orderId) {
        showToast(data.message || "Shipment retry succeeded!", "success");
        fetchOrderDetails();
      }
    };

    on("shipping_issue", handleShippingIssue);
    on("shipping_confirmed", handleShippingConfirmed);
    on("shipping_retry_success", handleRetrySuccess);

    return () => {
      off("shipping_issue", handleShippingIssue);
      off("shipping_confirmed", handleShippingConfirmed);
      off("shipping_retry_success", handleRetrySuccess);
    };
  }, [id, order?.orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrder(id);
      console.log("Order details response:", response);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      showToast("Error fetching order details", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderTimeline = async () => {
    try {
      const response = await orderApi.getOrderTimeline(id);
      setTimeline(response.data.timeline || []);
    } catch (error) {
      console.error("Error fetching order timeline:", error);
    }
  };



  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "processing":
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case "pending":
      case "confirmed":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "refunded":
      case "returned":
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "pending":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
      case "returned":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Completed",
      cancelled: "Cancelled",
      refunded: "Refunded",
      returned: "Returned",
    };
    return (
      statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("DD-MM-YYYY");
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60)
      return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    return formatDate(dateString);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getShippingAddress = () => {
    if (!order?.addresses) return null;
    const shippingAddr = order.addresses.find(
      (addr) => addr.type === "shipping",
    );
    if (!shippingAddr) return null;

    return `${shippingAddr.addressLine1 || ""}${shippingAddr.addressLine2 ? `, ${shippingAddr.addressLine2}` : ""}, ${shippingAddr.city || ""}, ${shippingAddr.state || ""} ${shippingAddr.pincode || ""}, ${shippingAddr.country || ""}`;
  };

  const getBillingAddress = () => {
    if (!order?.addresses) return null;
    const billingAddr = order.addresses.find((addr) => addr.type === "billing");
    if (!billingAddr) return getShippingAddress(); // Fallback to shipping address

    return `${billingAddr.addressLine1 || ""}${billingAddr.addressLine2 ? `, ${billingAddr.addressLine2}` : ""}, ${billingAddr.city || ""}, ${billingAddr.state || ""} ${billingAddr.pincode || ""}, ${billingAddr.country || ""}`;
  };

  const getCustomerName = () => {
    if (!order?.user) return "N/A";
    return (
      `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() ||
      "Customer"
    );
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      razorpay: "Razorpay",
      cod: "Cash on Delivery",
      card: "Credit/Debit Card",
      wallet: "Wallet",
      netbanking: "Net Banking",
      upi: "UPI",
    };
    return methods[method] || method;
  };

  const handlePrintInvoice = async () => {
    if (!order) return;

    try {
      showToast("Generating invoice...", "info");
      const response = await orderApi.generateInvoice(order._id);

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
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

  const handleUpdateStatus = () => {
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdated = (updatedOrder) => {
    setOrder(updatedOrder);
    fetchOrderTimeline(); // Refresh timeline
    showToast("Order status updated successfully", "success");
  };

  const handleSendInvoiceEmail = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      const emailData = {
        email: order.user?.email || "",
        subject: `Invoice for Order ${order.orderId}`,
        message: `Dear ${getCustomerName()},\n\nPlease find attached the invoice for your order ${order.orderId}.\n\nThank you for your business!`,
      };

      await orderApi.sendInvoiceEmail(order._id, emailData);
      showToast("Invoice email sent successfully", "success");
    } catch (error) {
      console.error("Error sending invoice email:", error);
      showToast("Error sending invoice email", "error");
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // SHIPROCKET SHIPMENT MANAGEMENT HANDLERS
  // =====================================================

  const handleCreateShipment = async () => {
    if (!order) return;

    try {
      setShipmentLoading(true);
      showToast("Creating shipment...", "info");
      const response = await orderApi.createShipment(order._id);
      showToast("Shipment created successfully!", "success");
      fetchOrderDetails(); // Refresh order data
    } catch (error) {
      console.error("Error creating shipment:", error);
      showToast(
        error.response?.data?.message || "Error creating shipment",
        "error",
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleGetCouriers = async () => {
    if (!order) return;

    try {
      setShipmentLoading(true);
      const response = await orderApi.getAvailableCouriers(order._id, 0.5); // Default weight 0.5kg
      setCouriers(response.data?.couriers || []);
      setShowCourierModal(true);
    } catch (error) {
      console.error("Error fetching couriers:", error);
      showToast(
        error.response?.data?.message || "Error fetching available couriers",
        "error",
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleGenerateAWB = async (courierId = null) => {
    if (!order) return;

    try {
      setShipmentLoading(true);
      showToast("Generating AWB...", "info");
      const courierToUse = courierId || selectedCourier;
      const response = await orderApi.generateAWB(order._id, courierToUse);
      showToast("AWB generated successfully!", "success");
      setShowCourierModal(false);
      setSelectedCourier(null);
      fetchOrderDetails();
    } catch (error) {
      console.error("Error generating AWB:", error);
      showToast(
        error.response?.data?.message || "Error generating AWB",
        "error",
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleSchedulePickup = async () => {
    if (!order) return;

    try {
      setShipmentLoading(true);
      showToast("Scheduling pickup...", "info");
      const response = await orderApi.schedulePickup(order._id);
      showToast("Pickup scheduled successfully!", "success");
      fetchOrderDetails();
    } catch (error) {
      console.error("Error scheduling pickup:", error);
      showToast(
        error.response?.data?.message || "Error scheduling pickup",
        "error",
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleTrackShipment = async () => {
    if (!order) return;

    try {
      setShipmentLoading(true);
      const response = await orderApi.trackShipment(order._id);
      setTrackingData(response.data?.tracking || response.data);
      setShowTrackingModal(true);
    } catch (error) {
      console.error("Error tracking shipment:", error);
      showToast(
        error.response?.data?.message || "Error tracking shipment",
        "error",
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  const handlePrintLabel = async () => {
    if (!order) return;

    try {
      setShipmentLoading(true);
      showToast("Generating shipping label...", "info");
      const response = await orderApi.getShippingLabel(order._id);

      // Open label URL in new tab
      if (response.data?.labelUrl) {
        window.open(response.data.labelUrl, "_blank");
        showToast("Shipping label opened in new tab", "success");
      } else {
        showToast("Label URL not available", "error");
      }
    } catch (error) {
      console.error("Error printing label:", error);
      showToast(
        error.response?.data?.message || "Error generating shipping label",
        "error",
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!order || !cancelReason.trim()) {
      showToast("Please provide a cancellation reason", "error");
      return;
    }

    try {
      setShipmentLoading(true);
      showToast("Cancelling shipment...", "info");
      await orderApi.cancelShipment(order._id, cancelReason);
      showToast("Shipment cancelled successfully", "success");
      setShowCancelModal(false);
      setCancelReason("");
      fetchOrderDetails();
    } catch (error) {
      console.error("Error cancelling shipment:", error);
      showToast(
        error.response?.data?.message || "Error cancelling shipment",
        "error",
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleRetryShipment = async () => {
    if (!order) return;

    try {
      setShipmentLoading(true);
      showToast("Retrying shipment automation...", "info");
      const response = await orderApi.retryShipment(order._id);
      if (response.warning) {
        showToast(`Retry complete but: ${response.warning}`, "error");
      } else {
        showToast("Shipment automation completed successfully!", "success");
      }
      fetchOrderDetails();
    } catch (error) {
      console.error("Error retrying shipment:", error);
      showToast(
        error.response?.data?.message || "Error retrying shipment",
        "error",
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleSaveAWB = async () => {
    if (!awbInput.trim()) return;
    try {
      setAwbSaving(true);
      await orderApi.updateAWB(order._id, {
        awb: awbInput.trim(),
        courierName: courierNameInput.trim() || undefined,
      });
      showToast("AWB updated successfully!", "success");
      setEditingAWB(false);
      fetchOrderDetails();
    } catch (error) {
      showToast(error.response?.data?.message || "Error updating AWB", "error");
    } finally {
      setAwbSaving(false);
    }
  };

  const getShipmentStatusBadge = () => {
    if (!order) return null;

    if (order.shiprocketOrderId && order.shiprocketAWB) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          AWB: {order.shiprocketAWB}
        </span>
      );
    } else if (order.shiprocketOrderId) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Shipment Created
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Not Shipped
      </span>
    );
  };

  if (loading) {
    return (

      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">
            Loading order details...
          </div>
        </div>
      </div>

    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Order not found
          </div>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/orders")}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Details
                </h1>
                <p className="text-gray-600">
                  Order ID: {order.orderId || order._id}
                </p>
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                {getStatusIcon(order.status)}
                <span
                  className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}
                >
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
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    title="Track Package on Shiprocket"
                  >
                    <TruckIcon className="h-5 w-5 text-blue-600" />
                  </a>
                )}
             
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items ({order.items?.length || 0})
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <ShoppingBagIcon className="h-4 w-4 mr-1" />
                  Total items:{" "}
                  {order.items?.reduce(
                    (sum, item) => sum + (item.quantity || 1),
                    0,
                  ) || 0}
                </div>
              </div>

              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center">
                        {(() => {
                          let imageUrl =
                            item.productImage ||
                            item.product?.images?.[0]?.url ||
                            (typeof item.product?.images?.[0] === "string"
                              ? item.product?.images?.[0]
                              : null);

                          if (
                            imageUrl &&
                            !imageUrl.startsWith("http") &&
                            !imageUrl.startsWith("data:")
                          ) {
                            imageUrl = `http://localhost:5001${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
                          }

                          return imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.productName || item.product?.name}
                              className="h-16 w-16 rounded-lg object-cover mr-4"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/150?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                              <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          );
                        })()}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.productName ||
                              item.product?.name ||
                              "Product"}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>
                              SKU: {item.sku || item.product?.sku || "N/A"}
                            </span>
                            <span>Quantity: {item.quantity || 1}</span>
                            {item.product?.category && (
                              <span className="px-2 py-1 bg-gray-100 rounded">
                                #{item.product.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(
                            (item.price || 0) * (item.quantity || 1),
                          )}
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
                    <span className="font-medium">
                      {formatCurrency(order.subtotal || 0)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount {order.promoCode && `(${order.promoCode})`}
                      </span>
                      <span>-{formatCurrency(order.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Charge</span>
                    <span className="font-medium">
                      {formatCurrency(order.shippingCharge || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="font-medium">
                      {formatCurrency(order.tax || 0)}
                    </span>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Timeline
                </h2>
                <div className="space-y-4">
                  {timeline.slice(0, 5).map((event, index) => (
                    <div
                      key={event.id || index}
                      className="flex items-start"
                    >
                      <div
                        className={`h-3 w-3 rounded-full mt-2 ${event.type === "order_created"
                            ? "bg-blue-500"
                            : event.type === "status_change"
                              ? "bg-green-500"
                              : event.type === "shipping_update"
                                ? "bg-purple-500"
                                : event.type === "payment_received"
                                  ? "bg-green-500"
                                  : event.type === "order_shipped"
                                    ? "bg-blue-500"
                                    : event.type === "order_delivered"
                                      ? "bg-green-500"
                                      : "bg-gray-500"
                          } mr-3`}
                      ></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {event.description}
                        </div>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Link
                    to={`/users/edit/${order.user?._id}`}
                    className="flex items-center hover:opacity-80 transition-opacity group"
                  >
                    <img
                      className="h-12 w-12 rounded-full group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.user?.email || order._id}`}
                      alt={getCustomerName()}
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {getCustomerName()}
                      </div>
                      <div className="text-sm text-gray-500">
                        User ID: {order.user?._id?.slice(-6) || "N/A"}
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {order.user?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>{order.user?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Billing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping & Billing
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Shipping Address
                  </h3>
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 break-words">
                      {getShippingAddress() ||
                        "No shipping address provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Billing Address
                  </h3>
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 break-words">
                      {getBillingAddress() || "No billing address provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Payment Intent
                  </h3>
                  <div className="flex items-center">
                    <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-gray-600">
                        {getPaymentMethodText(order.paymentMethod)}
                      </span>
                      <div
                        className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {order.paymentStatus?.charAt(0).toUpperCase() +
                          order.paymentStatus?.slice(1) || "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Shipping Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <TruckIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        {order.shippingProvider || "Standard Shipping"}
                      </span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 mr-2">
                          Tracking:
                        </span>
                        <span className="font-medium text-blue-600">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          Est. Delivery:{" "}
                          {formatDate(order.estimatedDelivery)}
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

            {/* Shipment Management */}
            {!['cancelled', 'returned', 'refunded'].includes(order.status) && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Shipment Management
                  </h2>
                  {getShipmentStatusBadge()}
                </div>

                {/* No courier warning */}
                {!order.shiprocketAWB && order.shiprocketOrderId && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start">
                      <ExclamationCircleIcon className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">No AWB Assigned</p>
                        <p className="text-xs text-orange-600 mt-1">
                          Shiprocket order created but no courier could be assigned. Options:
                        </p>
                        <ul className="text-xs text-orange-600 mt-1 list-disc list-inside space-y-0.5">
                          <li><strong>Retry Automation</strong> — try again (useful if this was a temporary Shiprocket issue)</li>
                          <li><strong>Enter AWB manually</strong> — if you're shipping via a different courier outside Shiprocket</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* No shipment at all */}
                {!order.shiprocketOrderId && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      No shipment created yet.{' '}
                      {order.paymentStatus === 'paid'
                        ? 'Use "Retry Automation" to trigger the full Shiprocket flow, or enter an AWB manually if shipping outside Shiprocket.'
                        : 'Awaiting payment confirmation.'}
                    </p>
                  </div>
                )}

                {/* AWB info */}
                {order.shiprocketAWB && !editingAWB && (
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">AWB: <strong>{order.shiprocketAWB}</strong></span>
                      </div>
                      <button
                        onClick={() => { setAwbInput(order.shiprocketAWB); setCourierNameInput(order.courierName || ""); setEditingAWB(true); }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Edit
                      </button>
                    </div>
                    {order.courierName && (
                      <div className="flex items-center text-sm">
                        <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Courier: <strong>{order.courierName}</strong></span>
                      </div>
                    )}
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <TruckIcon className="h-4 w-4 mr-2" />
                        Track on Shiprocket →
                      </a>
                    )}
                  </div>
                )}

                {/* Inline AWB edit form */}
                {editingAWB && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                    <p className="text-xs font-medium text-gray-700">Edit AWB Details</p>
                    <input
                      type="text"
                      value={awbInput}
                      onChange={(e) => setAwbInput(e.target.value)}
                      placeholder="AWB number"
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={courierNameInput}
                      onChange={(e) => setCourierNameInput(e.target.value)}
                      placeholder="Courier name (optional)"
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveAWB}
                        disabled={awbSaving || !awbInput.trim()}
                        className="flex-1 text-sm bg-blue-600 text-white rounded px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {awbSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingAWB(false)}
                        className="flex-1 text-sm border border-gray-300 text-gray-700 rounded px-3 py-1.5 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual AWB entry when no AWB yet */}
                {!order.shiprocketAWB && !editingAWB && (
                  <div className="mb-2">
                    <button
                      onClick={() => { setAwbInput(""); setCourierNameInput(""); setEditingAWB(true); }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      + Enter AWB manually
                    </button>
                  </div>
                )}

                {!order.shiprocketAWB && editingAWB && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                    <p className="text-xs font-medium text-gray-700">Enter AWB Manually</p>
                    <input
                      type="text"
                      value={awbInput}
                      onChange={(e) => setAwbInput(e.target.value)}
                      placeholder="AWB number"
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={courierNameInput}
                      onChange={(e) => setCourierNameInput(e.target.value)}
                      placeholder="Courier name (optional)"
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveAWB}
                        disabled={awbSaving || !awbInput.trim()}
                        className="flex-1 text-sm bg-blue-600 text-white rounded px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {awbSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingAWB(false)}
                        className="flex-1 text-sm border border-gray-300 text-gray-700 rounded px-3 py-1.5 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  {/* Retry / Create buttons (when no AWB) */}
                  {!order.shiprocketAWB && (
                    <>
                      <button
                        onClick={handleRetryShipment}
                        disabled={shipmentLoading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        {shipmentLoading ? "Retrying..." : "Retry Shipment Automation"}
                      </button>
                      {!order.shiprocketOrderId && (
                        <button
                          onClick={handleCreateShipment}
                          disabled={shipmentLoading}
                          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          <TruckIcon className="h-4 w-4 mr-2" />
                          {shipmentLoading ? "Creating..." : "Create Shipment Manually"}
                        </button>
                      )}
                    </>
                  )}

                  {/* Actions when AWB exists */}
                  {order.shiprocketAWB && (
                    <>
                      <button
                        onClick={handleTrackShipment}
                        disabled={shipmentLoading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        <TruckIcon className="h-4 w-4 mr-2" />
                        {shipmentLoading ? "Loading..." : "Track Shipment"}
                      </button>
                      {!order.pickupScheduled && (
                        <button
                          onClick={handleSchedulePickup}
                          disabled={shipmentLoading}
                          className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {shipmentLoading ? "Scheduling..." : "Schedule Pickup"}
                        </button>
                      )}
                      <button
                        onClick={handlePrintLabel}
                        disabled={shipmentLoading}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        <PrinterIcon className="h-4 w-4 mr-2" />
                        Print Shipping Label
                      </button>
                      {!['delivered', 'returned'].includes(order.shippingStatus) && (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          disabled={shipmentLoading}
                          className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Cancel Shipment
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Order Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Currency:</span>
                  <span className="text-sm font-medium">
                    {order.currency || "INR"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Invoice Number:
                  </span>
                  <span className="text-sm font-medium">
                    {order.invoiceNumber || "N/A"}
                  </span>
                </div>
                {order.razorpayOrderId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Razorpay Order ID:
                    </span>
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {order.razorpayOrderId}
                    </span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Payment ID:
                    </span>
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {order.razorpayPaymentId}
                    </span>
                  </div>
                )}
                {order.shiprocketOrderId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Shiprocket ID:
                    </span>
                    <span className="text-sm font-medium">
                      {order.shiprocketOrderId}
                    </span>
                  </div>
                )}
                {order.cancellationReason && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      Cancellation Reason:
                    </span>
                    <p className="text-sm text-gray-900 bg-red-50 p-2 rounded">
                      {order.cancellationReason}
                    </p>
                  </div>
                )}
                {order.adminNotes && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      Admin Notes:
                    </span>
                    <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">
                      {order.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Status Update Modal */ }
  {
    order && (
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        orderId={order._id}
        currentStatus={order.status}
        onStatusUpdated={handleStatusUpdated}
      />
    )
  }

  {/* Courier Selection Modal */ }
  {
    showCourierModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Courier
            </h3>
            <button
              onClick={() => {
                setShowCourierModal(false);
                setSelectedCourier(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {couriers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TruckIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No couriers available for this delivery location</p>
              </div>
            ) : (
              <div className="space-y-3">
                {couriers.map((courier) => (
                  <div
                    key={courier.courier_company_id}
                    onClick={() =>
                      setSelectedCourier(courier.courier_company_id)
                    }
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedCourier === courier.courier_company_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {courier.courier_name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>
                            Est.{" "}
                            {courier.etd ||
                              courier.estimated_delivery_days ||
                              "N/A"}{" "}
                            days
                          </span>
                          {courier.rating && (
                            <span className="flex items-center">
                              ⭐ {courier.rating}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{courier.freight_charge || courier.rate || "N/A"}
                        </div>
                        {courier.cod_charges > 0 && (
                          <div className="text-xs text-gray-500">
                            COD: ₹{courier.cod_charges}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
            <button
              onClick={() => {
                setShowCourierModal(false);
                setSelectedCourier(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleGenerateAWB(selectedCourier)}
              disabled={!selectedCourier || shipmentLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {shipmentLoading ? "Generating..." : "Generate AWB"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* Tracking Modal */ }
  {
    showTrackingModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Shipment Tracking
            </h3>
            <button
              onClick={() => {
                setShowTrackingModal(false);
                setTrackingData(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {trackingData ? (
              <div className="space-y-4">
                {/* Current Status */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <TruckIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {trackingData.current_status ||
                          trackingData.shipment_status ||
                          "Status Unknown"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        AWB:{" "}
                        {order.shiprocketAWB ||
                          trackingData.awb_code ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking Activities */}
                {trackingData.tracking_data?.shipment_track_activities ||
                  trackingData.activities ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Tracking History
                    </h4>
                    {(
                      trackingData.tracking_data?.shipment_track_activities ||
                      trackingData.activities ||
                      []
                    ).map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start border-l-2 border-gray-200 pl-4 pb-4"
                      >
                        <div className="w-3 h-3 bg-blue-500 rounded-full -ml-[22px] mt-1"></div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {activity.activity || activity.status}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.location || ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.date || activity.timestamp || ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <InformationCircleIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p>No tracking activities available yet</p>
                  </div>
                )}

                {/* EDD */}
                {(trackingData.edd || trackingData.expected_delivery) && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-gray-700">
                        Expected Delivery:{" "}
                        <strong>
                          {trackingData.edd || trackingData.expected_delivery}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p>Loading tracking information...</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end p-4 border-t bg-gray-50">
            <button
              onClick={() => {
                setShowTrackingModal(false);
                setTrackingData(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* Cancel Shipment Modal */ }
  {
    showCancelModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Cancel Shipment
            </h3>
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  This action will cancel the shipment with Shiprocket. This
                  cannot be undone.
                </p>
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason *
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Keep Shipment
            </button>
            <button
              onClick={handleCancelShipment}
              disabled={!cancelReason.trim() || shipmentLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {shipmentLoading ? "Cancelling..." : "Cancel Shipment"}
            </button>
          </div>
        </div>
      </div>
    )
  }
    </>
  );
};

export default OrderView;
