import axiosInstance from './axiosConfig';

const reviewsApi = {
  // status: 'pending' | 'approved' | 'rejected'; also filterable by product/rating/source
  getAllReviews: (params = {}) =>
    axiosInstance.get('/admin/reviews', { params }).then((res) => res.data),

  // Approve / reject / send back to the queue. rejectionReason is optional.
  updateStatus: (id, payload) =>
    axiosInstance.patch(`/admin/reviews/${id}/status`, payload).then((res) => res.data),

  // Edit content (rating/title/comment). Editing a shopper's words keeps the
  // original text on the record; the API flags it as admin-edited.
  editReview: (id, payload) =>
    axiosInstance.patch(`/admin/reviews/${id}`, payload).then((res) => res.data),

  // Store-published testimonial collected offline. Stored as source: 'admin'
  // and never marked a verified purchase.
  createReview: (payload) =>
    axiosInstance.post('/admin/reviews', payload).then((res) => res.data),

  deleteReview: (id) =>
    axiosInstance.delete(`/admin/reviews/${id}`).then((res) => res.data),
};

export default reviewsApi;
