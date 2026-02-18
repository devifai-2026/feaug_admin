import React, { useState, useEffect, useRef } from "react";
import {
  PrinterIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

import moment from "moment";

import invoiceApi from "../../api/invoices.api";
import orderApi from "../../api/orders.api";

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [printing, setPrinting] = useState(false);
  const invoiceRef = useRef();

  // Helper function to format amount with rupee symbol
  const formatRupee = (amount) => {
    // Remove any existing dollar signs and add rupee symbol
    const cleanAmount = amount.replace("$", "").trim();
    return `₹${cleanAmount}`;
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      // Fetch the order as it contains all invoice data
      const response = await orderApi.getOrder(id);

      // Robustly find order object
      const order =
        response?.data?.order ||
        response?.data ||
        response?.order ||
        response;

      if (order && (order._id || order.id)) {
        const shippingAddr =
          order.shippingAddress ||
          (order.addresses &&
            order.addresses.find((a) => a.type === "shipping"));

        // Transform real order data to invoice format
        const transformedInvoice = {
          id:
            order.invoiceNumber ||
            order.orderNumber ||
            order.orderId ||
            order._id,
          orderId: order._id || order.id,
          client:
            shippingAddr?.fullName ||
            shippingAddr?.name ||
            order.user?.fullName ||
            (order.user?.firstName
              ? `${order.user.firstName} ${order.user.lastName || ""}`.trim()
              : null) ||
            order.user?.name ||
            "Guest",
          clientEmail: order.user?.email || shippingAddr?.email || "N/A",
          clientAddress: shippingAddr
            ? `${shippingAddr.addressLine1 || shippingAddr.street || ""}, ${shippingAddr.city || ""}, ${shippingAddr.state || ""} ${shippingAddr.pincode || shippingAddr.zipCode || ""}`
              .trim()
              .replace(/^, /, "")
            : "N/A",
          date: order.createdAt,
          dueDate:
            order.dueDate ||
            new Date(
              new Date(order.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          amount: `₹${(order.grandTotal || order.totalAmount || order.total || 0).toLocaleString()}`,
          tax: `₹${(order.tax || order.taxAmount || 0).toLocaleString()}`,
          subtotal: `₹${(order.subtotal || (order.totalAmount || 0) - (order.taxAmount || 0)).toLocaleString()}`,
          status:
            order.paymentStatus === "paid" || order.status === "delivered"
              ? "Paid"
              : order.paymentStatus === "pending"
                ? "Pending"
                : "Overdue",
          items: (order.items || []).map((item) => ({
            description:
              item.productName ||
              item.description ||
              item.product?.name ||
              item.name ||
              "Product",
            quantity: item.quantity || 1,
            price: `₹${(item.price || 0).toLocaleString()}`,
            total: `₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`,
          })),
          notes: order.notes || "Thank you for your business.",
          paymentMethod: order.paymentMethod || "N/A",
          paymentDate: order.paymentDate || null,
        };

        setInvoice(transformedInvoice);
      } else {
        console.error("Order not found in response:", response);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    } finally {
      setLoading(false);
    }
  };



  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "Pending":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "Overdue":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("DD-MM-YYYY");
  };

  const generatePDF = () => {
    if (!invoice) return;

    setDownloadingPDF(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // Set metadata
      pdf.setProperties({
        title: `${invoice.id} - ${invoice.client}`,
        subject: "Invoice",
        author: "Invoice Management System",
        keywords: "invoice, billing, payment",
      });

      // Company header with styling
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.setFont("helvetica", "bold");
      pdf.text("INVOICE", 105, 25, null, null, "center");

      // Add decorative line
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(20, 30, 190, 30);

      // Company info box
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("From:", 20, 40);
      pdf.setFont("helvetica", "normal");
      pdf.text("Your Company Name", 20, 45);
      pdf.text("123 Business Street", 20, 50);
      pdf.text("City, State 12345", 20, 55);
      pdf.text("contact@yourcompany.com", 20, 60);
      pdf.text("(123) 456-7890", 20, 65);

      // Invoice details box
      pdf.setFont("helvetica", "bold");
      pdf.text("Invoice Details:", 150, 40);
      pdf.setFont("helvetica", "normal");

      pdf.text(`Invoice #: ${invoice.id}`, 150, 45);
      pdf.text(`Date: ${formatDate(invoice.date)}`, 150, 50);
      pdf.text(`Due Date: ${formatDate(invoice.dueDate)}`, 150, 55);
      pdf.text(`Status: ${invoice.status}`, 150, 60);

      // Client info
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Bill To:", 20, 80);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(invoice.client, 20, 85);
      pdf.text(invoice.clientAddress, 20, 90);
      pdf.text(invoice.clientEmail, 20, 95);

      // Items table header with styling
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(59, 130, 246);
      pdf.rect(20, 110, 170, 10, "F");
      pdf.text("Description", 25, 117);
      pdf.text("Quantity", 110, 117);
      pdf.text("Price", 140, 117);
      pdf.text("Total", 170, 117);

      // Items
      pdf.setTextColor(0, 0, 0);
      let yPos = 125;
      invoice.items.forEach((item, index) => {
        pdf.text(item.description, 25, yPos);
        pdf.text(item.quantity.toString(), 110, yPos);
        pdf.text(item.price, 140, yPos);
        pdf.text(item.total, 170, yPos);
        yPos += 8;
      });

      // Totals section with styling
      yPos += 15;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(140, yPos, 190, yPos);
      yPos += 5;

      pdf.setFontSize(12);
      pdf.text("Subtotal:", 140, yPos);
      pdf.text(invoice.subtotal, 170, yPos);

      yPos += 8;
      pdf.text("Tax (10%):", 140, yPos);
      pdf.text(invoice.tax, 170, yPos);

      yPos += 8;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(140, yPos, 190, yPos);
      yPos += 10;

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text("Total Amount:", 140, yPos);
      pdf.text(invoice.amount, 170, yPos);

      // Notes section
      yPos += 20;
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Notes:", 20, yPos);
      pdf.setFont("helvetica", "normal");

      // Split notes into multiple lines if too long
      const notesLines = pdf.splitTextToSize(invoice.notes, 170);
      pdf.text(notesLines, 20, yPos + 5);

      // Footer
      yPos = 280;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text("Thank you for your business!", 105, yPos, null, null, "center");
      pdf.text(
        `Generated on: ${new Date().toLocaleString()}`,
        105,
        yPos + 5,
        null,
        null,
        "center",
      );
      pdf.text(
        "Invoice Management System • Professional Invoice",
        105,
        yPos + 10,
        null,
        null,
        "center",
      );

      // Save PDF
      pdf.save(
        `Invoice_${invoice.id}_${invoice.client.replace(/\s+/g, "_")}.pdf`,
      );

      // Show success message
      alert(
        `PDF generated successfully: Invoice_${invoice.id}_${invoice.client.replace(/\s+/g, "_")}.pdf`,
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const printInvoice = () => {
    if (!invoice) return;

    setPrinting(true);

    try {
      // Create a print-friendly version
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow pop-ups to print invoice");
        setPrinting(false);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
              }
              .no-print { display: none !important; }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
            }
            .invoice-header h1 {
              color: #3b82f6;
              font-size: 28px;
              margin-bottom: 5px;
            }
            .invoice-header p {
              color: #666;
              font-size: 14px;
            }
            .company-info, .client-info {
              margin-bottom: 30px;
            }
            .section-title {
              color: #3b82f6;
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            .invoice-table th {
              background-color: #3b82f6;
              color: white;
              text-align: left;
              padding: 12px 15px;
              font-weight: 600;
            }
            .invoice-table td {
              padding: 12px 15px;
              border-bottom: 1px solid #e5e7eb;
            }
            .invoice-table tr:hover {
              background-color: #f9fafb;
            }
            .totals {
              text-align: right;
              margin-top: 30px;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 10px;
            }
            .total-label {
              width: 150px;
              text-align: right;
              padding-right: 20px;
            }
            .total-value {
              width: 150px;
              font-weight: 600;
            }
            .grand-total {
              font-size: 18px;
              font-weight: bold;
              color: #3b82f6;
              border-top: 2px solid #3b82f6;
              padding-top: 10px;
              margin-top: 10px;
            }
            .notes {
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
              border-left: 4px solid #3b82f6;
            }
            .notes h3 {
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              margin-left: 10px;
            }
            .status-paid { background-color: #d1fae5; color: #065f46; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-overdue { background-color: #fee2e2; color: #991b1b; }
            .footer {
              text-align: center;
              margin-top: 50px;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            .currency {
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>INVOICE</h1>
            <p>Professional Invoice Document</p>
          </div>
          
          <div class="info-grid">
            <div class="company-info">
              <div class="section-title">From</div>
              <p><strong>Your Company Name</strong></p>
              <p>123 Business Street</p>
              <p>City, State 12345</p>
              <p>contact@yourcompany.com</p>
              <p>(123) 456-7890</p>
            </div>
            
            <div class="client-info">
              <div class="section-title">Bill To</div>
              <p><strong>${invoice.client}</strong></p>
              <p>${invoice.clientAddress}</p>
              <p>${invoice.clientEmail}</p>
            </div>
          </div>
          
          <div class="info-grid">
            <div>
              <div class="section-title">Invoice Details</div>
              <p><strong>Invoice #:</strong> ${invoice.id}</p>
              <p><strong>Date:</strong> ${formatDate(invoice.date)}</p>
              <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
              <p><strong>Status:</strong> ${invoice.status} 
                <span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span>
              </p>
            </div>
            
            <div>
              <div class="section-title">Payment Information</div>
              <p><strong>Payment Method:</strong> ${invoice.paymentMethod || "N/A"}</p>
              <p><strong>Payment Date:</strong> ${invoice.paymentDate ? formatDate(invoice.paymentDate) : "Pending"}</p>
            </div>
          </div>
          
          <div class="section-title">Items</div>
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
          .map(
            (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td class="currency">${item.price}</td>
                  <td class="currency"><strong>${item.total}</strong></td>
                </tr>
              `,
          )
          .join("")}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <div class="total-label">Subtotal:</div>
              <div class="total-value currency">${invoice.subtotal}</div>
            </div>
            <div class="total-row">
              <div class="total-label">Tax (10%):</div>
              <div class="total-value currency">${invoice.tax}</div>
            </div>
            <div class="total-row grand-total">
              <div class="total-label">Total Amount:</div>
              <div class="total-value currency">${invoice.amount}</div>
            </div>
          </div>
          
          <div class="notes">
            <h3>Notes</h3>
            <p>${invoice.notes}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Invoice Management System • Professional Invoice</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.close();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error("Print error:", error);
      alert("Error printing invoice. Please try again.");
    } finally {
      setPrinting(false);
    }
  };

  const markAsPaid = () => {
    if (window.confirm(`Mark invoice ${invoice.id} as paid?`)) {
      alert(`Invoice ${invoice.id} marked as paid`);
      // Update invoice status
    }
  };

  const shareInvoice = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Invoice ${invoice.id}`,
          text: `Invoice ${invoice.id} for ${invoice.client} - Amount: ${invoice.amount}`,
          url: window.location.href,
        })
        .then(() => console.log("Invoice shared successfully"))
        .catch((error) => console.log("Error sharing invoice:", error));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Invoice link copied to clipboard!"))
        .catch(() =>
          alert("Could not copy link. Please copy the URL manually."),
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invoice Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The invoice you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/invoices")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/invoices")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Invoices
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice {invoice.id}
              </h1>
              <p className="text-gray-600 mt-1">
                For {invoice.client} • Issued {formatDate(invoice.date)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={generatePDF}
                disabled={downloadingPDF}
                className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${downloadingPDF
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
                  }`}
              >
                {downloadingPDF ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Status Banner */}
        <div
          className={`mb-8 p-6 rounded-xl ${getStatusColor(invoice.status)} border-l-4 ${invoice.status === "Paid"
            ? "border-green-500"
            : invoice.status === "Pending"
              ? "border-yellow-500"
              : "border-red-500"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(invoice.status)}
              <div className="ml-3">
                <h3 className="text-lg font-semibold">
                  Invoice Status: {invoice.status}
                </h3>
                <p className="text-sm mt-1">
                  {invoice.status === "Paid"
                    ? `Paid on ${formatDate(invoice.paymentDate)} via ${invoice.paymentMethod}`
                    : invoice.status === "Pending"
                      ? `Due on ${formatDate(invoice.dueDate)}`
                      : `Overdue since ${formatDate(invoice.dueDate)}`}
                </p>
              </div>
            </div>
            {invoice.status !== "Paid" && (
              <button
                onClick={markAsPaid}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Paid
              </button>
            )}
          </div>
        </div>

        {/* Invoice Details Card */}
        <div
          ref={invoiceRef}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                From
              </h3>
              <div className="space-y-2">
                <p className="text-xl font-bold text-blue-600">
                  Your Company Name
                </p>
                <p className="text-gray-600">123 Business Street</p>
                <p className="text-gray-600">City, State 12345</p>
                <p className="text-gray-600">contact@yourcompany.com</p>
                <p className="text-gray-600">(123) 456-7890</p>
              </div>
            </div>

            {/* Client Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bill To
              </h3>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-900">
                  {invoice.client}
                </p>
                <p className="text-gray-600">{invoice.clientAddress}</p>
                <p className="text-gray-600">{invoice.clientEmail}</p>
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="text-lg font-semibold text-gray-900">
                {invoice.id}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(invoice.date)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(invoice.dueDate)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="text-lg font-semibold text-gray-900">
                {invoice.paymentMethod || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Items
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                    Quantity
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900">
                      {item.description}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {item.price}
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-semibold">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-sm">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{invoice.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-semibold">{invoice.tax}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">{invoice.amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notes
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{invoice.notes}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={generatePDF}
                disabled={downloadingPDF}
                className={`w-full flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg transition-colors border border-green-200 ${downloadingPDF
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-100"
                  }`}
              >
                {downloadingPDF ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-green-700 border-t-transparent rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download PDF
                  </>
                )}
              </button>

              <button
                onClick={shareInvoice}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
              >
                <ShareIcon className="h-5 w-5 mr-2" />
                Share Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
