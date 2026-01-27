import axiosInstance from './axiosConfig';

const invoiceApi = {
  // Generate invoice PDF for an order
  generateInvoice: (orderId) =>
    axiosInstance.get(`/admin/orders/${orderId}/invoice`, {
      responseType: 'blob'
    }),

  // Send invoice via email
  sendInvoiceEmail: (orderId, emailData) =>
    axiosInstance.post(`/admin/orders/${orderId}/send-invoice`, emailData)
      .then(response => response.data),

  // Download invoice as PDF
  downloadInvoice: async (orderId, orderNumber) => {
    const response = await axiosInstance.get(`/admin/orders/${orderId}/invoice`, {
      responseType: 'blob'
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${orderNumber || orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  },
};

export default invoiceApi;
