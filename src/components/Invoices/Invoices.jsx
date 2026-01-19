import { useState } from 'react'
import { 
  PlusIcon,
  ReceiptRefundIcon,
  EyeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import Sidebar from '../Sidebar'
import Navbar from '../Navbar'

const Invoices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const [printing, setPrinting] = useState(null)

  const invoices = [
    { 
      id: 'INV-001', 
      client: 'Tech Corp Inc.', 
      clientEmail: 'billing@techcorp.com',
      clientAddress: '123 Tech Street, San Francisco, CA 94107',
      date: '2024-01-15', 
      dueDate: '2024-02-15',
      amount: '₹1,250.00',
      tax: '₹112.50',
      subtotal: '₹1,137.50',
      status: 'Paid',
      items: [
        { description: 'Website Redesign', quantity: 1, price: '₹750.00', total: '₹750.00' },
        { description: 'Monthly Maintenance', quantity: 2, price: '₹250.00', total: '₹500.00' },
      ],
      notes: 'Thank you for your business. Please make payment by the due date.',
      paymentMethod: 'Credit Card',
      paymentDate: '2024-01-20'
    },
    { 
      id: 'INV-002', 
      client: 'Global Retail', 
      clientEmail: 'accounts@globalretail.com',
      clientAddress: '456 Retail Ave, New York, NY 10001',
      date: '2024-01-14', 
      dueDate: '2024-02-14',
      amount: '₹890.50',
      tax: '₹80.14',
      subtotal: '₹810.36',
      status: 'Pending',
      items: [
        { description: 'E-commerce Setup', quantity: 1, price: '₹500.00', total: '₹500.00' },
        { description: 'Payment Gateway Integration', quantity: 1, price: '₹390.50', total: '₹390.50' },
      ],
      notes: 'Payment due within 30 days.',
      paymentMethod: 'Bank Transfer',
      paymentDate: null
    },
    { 
      id: 'INV-003', 
      client: 'Innovate Solutions', 
      clientEmail: 'finance@innovatesolutions.com',
      clientAddress: '789 Innovation Blvd, Austin, TX 73301',
      date: '2024-01-13', 
      dueDate: '2024-02-13',
      amount: '₹2,340.00',
      tax: '₹210.60',
      subtotal: '₹2,129.40',
      status: 'Paid',
      items: [
        { description: 'Mobile App Development', quantity: 1, price: '₹1,800.00', total: '₹1,800.00' },
        { description: 'UI/UX Design', quantity: 1, price: '₹540.00', total: '₹540.00' },
      ],
      notes: 'Project completed successfully.',
      paymentMethod: 'PayPal',
      paymentDate: '2024-01-18'
    },
    { 
      id: 'INV-004', 
      client: 'Startup Ventures', 
      clientEmail: 'accounts@startupventures.com',
      clientAddress: '101 Startup Lane, Boston, MA 02108',
      date: '2024-01-12', 
      dueDate: '2024-01-31',
      amount: '₹560.75',
      tax: '₹50.47',
      subtotal: '₹510.28',
      status: 'Overdue',
      items: [
        { description: 'Consulting Hours', quantity: 5, price: '₹100.00', total: '₹500.00' },
        { description: 'Report Generation', quantity: 1, price: '₹60.75', total: '₹60.75' },
      ],
      notes: 'Please contact us for payment extension.',
      paymentMethod: 'Check',
      paymentDate: null
    },
    { 
      id: 'INV-005', 
      client: 'Enterprise Ltd.', 
      clientEmail: 'invoices@enterprise.com',
      clientAddress: '222 Business Park, Chicago, IL 60601',
      date: '2024-01-11', 
      dueDate: '2024-02-11',
      amount: '₹3,780.20',
      tax: '₹340.22',
      subtotal: '₹3,439.98',
      status: 'Paid',
      items: [
        { description: 'ERP Implementation', quantity: 1, price: '₹2,500.00', total: '₹2,500.00' },
        { description: 'Training Sessions', quantity: 4, price: '₹320.05', total: '₹1,280.20' },
      ],
      notes: 'Annual maintenance contract included.',
      paymentMethod: 'Wire Transfer',
      paymentDate: '2024-01-25'
    },
  ]

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'Pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'Overdue': return <XCircleIcon className="h-5 w-5 text-red-500" />
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const downloadPDF = async (invoice) => {
    setDownloading(invoice.id);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set metadata
      pdf.setProperties({
        title: `${invoice.id} - ${invoice.client}`,
        subject: 'Invoice',
        author: 'Invoice Management System',
        keywords: 'invoice, billing, payment'
      });

      // Company header with styling
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', 105, 25, null, null, 'center');

      // Add decorative line
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(20, 30, 190, 30);

      // Company info box
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('From:', 20, 40);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Your Company Name', 20, 45);
      pdf.text('123 Business Street', 20, 50);
      pdf.text('City, State 12345', 20, 55);
      pdf.text('contact@yourcompany.com', 20, 60);
      pdf.text('(123) 456-7890', 20, 65);

      // Invoice details box
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice Details:', 150, 40);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`Invoice #: ${invoice.id}`, 150, 45);
      pdf.text(`Date: ${formatDate(invoice.date)}`, 150, 50);
      pdf.text(`Due Date: ${formatDate(invoice.dueDate)}`, 150, 55);
      pdf.text(`Status: ${invoice.status}`, 150, 60);

      // Client info
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', 20, 80);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoice.client, 20, 85);
      pdf.text(invoice.clientAddress, 20, 90);
      pdf.text(invoice.clientEmail, 20, 95);

      // Items table header with styling
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(59, 130, 246);
      pdf.rect(20, 110, 170, 10, 'F');
      pdf.text('Description', 25, 117);
      pdf.text('Quantity', 110, 117);
      pdf.text('Price', 140, 117);
      pdf.text('Total', 170, 117);

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
      pdf.text('Subtotal:', 140, yPos);
      pdf.text(invoice.subtotal, 170, yPos);
      
      yPos += 8;
      pdf.text('Tax (10%):', 140, yPos);
      pdf.text(invoice.tax, 170, yPos);
      
      yPos += 8;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(140, yPos, 190, yPos);
      yPos += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('Total Amount:', 140, yPos);
      pdf.text(invoice.amount, 170, yPos);

      // Notes section
      yPos += 20;
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Notes:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      
      // Split notes into multiple lines if too long
      const notesLines = pdf.splitTextToSize(invoice.notes, 170);
      pdf.text(notesLines, 20, yPos + 5);

      // Footer
      yPos = 280;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Thank you for your business!', 105, yPos, null, null, 'center');
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 5, null, null, 'center');
      pdf.text('Invoice Management System • Professional Invoice', 105, yPos + 10, null, null, 'center');

      // Save PDF
      pdf.save(`Invoice_${invoice.id}_${invoice.client.replace(/\s+/g, '_')}.pdf`);

      // Show success message
      alert(`PDF downloaded: Invoice_${invoice.id}_${invoice.client.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  }

  const printInvoice = (invoice) => {
    setPrinting(invoice.id);
    
    try {
      // Create a print-friendly version
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to print invoice');
        setPrinting(null);
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
              <p><strong>Payment Method:</strong> ${invoice.paymentMethod || 'N/A'}</p>
              <p><strong>Payment Date:</strong> ${invoice.paymentDate ? formatDate(invoice.paymentDate) : 'Pending'}</p>
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
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price}</td>
                  <td><strong>${item.total}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <div class="total-label">Subtotal:</div>
              <div class="total-value">${invoice.subtotal}</div>
            </div>
            <div class="total-row">
              <div class="total-label">Tax (10%):</div>
              <div class="total-value">${invoice.tax}</div>
            </div>
            <div class="total-row grand-total">
              <div class="total-label">Total Amount:</div>
              <div class="total-value">${invoice.amount}</div>
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
      console.error('Print error:', error);
      alert('Error printing invoice. Please try again.');
    } finally {
      setPrinting(null);
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                  <p className="text-gray-600">Manage and track your invoices</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Invoice
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ReceiptRefundIcon className="h-8 w-8 text-blue-500 mr-4" />
                  <div>
                    <div className="text-sm text-gray-600">Total Invoices</div>
                    <div className="text-2xl font-bold mt-1">48</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-500 mr-4" />
                  <div>
                    <div className="text-sm text-gray-600">Paid</div>
                    <div className="text-2xl font-bold mt-1">32</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-yellow-500 mr-4" />
                  <div>
                    <div className="text-sm text-gray-600">Pending</div>
                    <div className="text-2xl font-bold mt-1">12</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <XCircleIcon className="h-8 w-8 text-red-500 mr-4" />
                  <div>
                    <div className="text-sm text-gray-600">Overdue</div>
                    <div className="text-2xl font-bold mt-1">4</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.client}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.dueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(invoice.status)}
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/invoices/view/${invoice.id}`}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                              title="View Invoice Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => printInvoice(invoice)}
                              disabled={printing === invoice.id}
                              className={`p-1 rounded transition-all duration-200 ${
                                printing === invoice.id 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                              }`}
                              title="Print Invoice"
                            >
                              {printing === invoice.id ? (
                                <div className="animate-spin h-5 w-5 border-2 border-green-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <PrinterIcon className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => downloadPDF(invoice)}
                              disabled={downloading === invoice.id}
                              className={`p-1 rounded transition-all duration-200 ${
                                downloading === invoice.id 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                              }`}
                              title="Download PDF"
                            >
                              {downloading === invoice.id ? (
                                <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <ArrowDownTrayIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoice Activity</h2>
              <div className="space-y-4">
                {[
                  { invoice: '#INV-001', action: 'Payment received', time: '2 hours ago', color: 'bg-green-500' },
                  { invoice: '#INV-002', action: 'Invoice sent', time: '5 hours ago', color: 'bg-blue-500' },
                  { invoice: '#INV-004', action: 'Reminder sent', time: '1 day ago', color: 'bg-red-500' },
                  { invoice: '#INV-003', action: 'Invoice generated', time: '2 days ago', color: 'bg-purple-500' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${activity.color} mr-3`}></div>
                    <div className="flex-1">
                      <span className="font-medium">{activity.invoice}</span>
                      <span className="text-gray-600 ml-2">{activity.action}</span>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Invoices