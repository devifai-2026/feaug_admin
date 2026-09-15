import React, { useState, useEffect, useCallback } from "react";
import {
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import reviewsApi from "../../api/reviews.api";
import productApi from "../../api/product.api";
import { useToast } from "../../context/ToastContext";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "", label: "All" },
];

const Stars = ({ value = 0 }) => (
  <span className="inline-flex items-center gap-0.5" title={`${value} of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <StarIcon
        key={n}
        className={`w-4 h-4 ${n <= value ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
      />
    ))}
  </span>
);

const StatusPill = ({ status }) => {
  const map = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    approved: "bg-green-50 text-green-700 ring-green-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
  };
  return (
    <span
      className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-full ring-1 ${
        map[status] || "bg-gray-50 text-gray-600 ring-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

const emptyTestimonial = {
  productId: "",
  authorName: "",
  rating: 5,
  title: "",
  comment: "",
  status: "approved",
};

const Reviews = () => {
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingCount, setPendingCount] = useState(0);
  const [busyId, setBusyId] = useState(null);

  // Edit modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, title: "", comment: "" });

  // Add-testimonial modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...emptyTestimonial });
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reviewsApi.getAllReviews(
        activeTab ? { status: activeTab, limit: 100 } : { limit: 100 }
      );
      setReviews(res?.data?.reviews || []);
      setPendingCount(res?.pendingCount ?? 0);
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not load reviews", "error");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const moderate = async (id, status) => {
    let rejectionReason;
    if (status === "rejected") {
      rejectionReason = window.prompt("Reason for rejecting (optional):") || undefined;
    }
    try {
      setBusyId(id);
      await reviewsApi.updateStatus(id, { status, rejectionReason });
      showToast(`Review ${status}`, "success");
      fetchReviews();
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not update review", "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review permanently? This cannot be undone.")) return;
    try {
      setBusyId(id);
      await reviewsApi.deleteReview(id);
      showToast("Review deleted", "success");
      fetchReviews();
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not delete review", "error");
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (r) => {
    setEditing(r);
    setEditForm({ rating: r.rating, title: r.title || "", comment: r.comment || "" });
  };

  const saveEdit = async (publishAfter) => {
    if (!editForm.comment.trim()) {
      showToast("Comment cannot be empty", "error");
      return;
    }
    try {
      setSubmitting(true);
      await reviewsApi.editReview(editing._id, {
        ...editForm,
        ...(publishAfter ? { status: "approved" } : {}),
      });
      showToast(publishAfter ? "Saved and published" : "Changes saved", "success");
      setEditing(null);
      fetchReviews();
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not save changes", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openAdd = async () => {
    setAddForm({ ...emptyTestimonial });
    setAddOpen(true);
    if (products.length === 0) {
      try {
        const res = await productApi.getAllProducts({ limit: 200 });
        const list = res?.data?.products || res?.data || res?.products || [];
        setProducts(Array.isArray(list) ? list : []);
      } catch {
        setProducts([]);
      }
    }
  };

  const submitTestimonial = async () => {
    if (!addForm.productId) return showToast("Pick a product", "error");
    if (!addForm.authorName.trim()) return showToast("Attribution name is required", "error");
    if (!addForm.comment.trim()) return showToast("Comment is required", "error");
    try {
      setSubmitting(true);
      await reviewsApi.createReview(addForm);
      showToast("Testimonial published", "success");
      setAddOpen(false);
      fetchReviews();
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not add testimonial", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const authorOf = (r) =>
    r.source === "admin"
      ? r.authorName || "Store testimonial"
      : [r.user?.firstName, r.user?.lastName].filter(Boolean).join(" ") || "Unknown";

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            Shopper reviews stay hidden from the storefront until approved here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReviews}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <PlusIcon className="w-4 h-4" /> Add testimonial
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key || "all"}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.key === "pending" && pendingCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-700 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-12 text-center">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500 py-12 text-center">
          No {activeTab || ""} reviews.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={r.rating} />
                    <StatusPill status={r.status} />
                    {r.source === "admin" && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full ring-1 bg-blue-50 text-blue-700 ring-blue-200">
                        Store testimonial
                      </span>
                    )}
                    {r.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200">
                        Verified purchase
                      </span>
                    )}
                    {r.editedByAdmin && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full ring-1 bg-purple-50 text-purple-700 ring-purple-200">
                        Edited by admin
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {r.title || "(no title)"}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{r.comment}</p>
                  {r.editedByAdmin && r.originalComment && (
                    <p className="mt-2 text-xs text-gray-500 border-l-2 border-gray-200 pl-3">
                      <span className="font-semibold">Shopper originally wrote:</span>{" "}
                      {r.originalComment}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {authorOf(r)} · {r.product?.name || "Unknown product"}
                    {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ""}
                  </p>
                  {r.status === "rejected" && r.rejectionReason && (
                    <p className="mt-1 text-xs text-red-600">Reason: {r.rejectionReason}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {r.status !== "approved" && (
                    <button
                      disabled={busyId === r._id}
                      onClick={() => moderate(r._id, "approved")}
                      title="Approve"
                      className="p-2 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-40"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      disabled={busyId === r._id}
                      onClick={() => moderate(r._id, "rejected")}
                      title="Reject"
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(r)}
                    title="Edit"
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    disabled={busyId === r._id}
                    onClick={() => remove(r._id)}
                    title="Delete"
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900">Edit review</h2>
            {editing.source !== "admin" && (
              <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                This is a shopper's own review. Correct typos or remove personal details —
                don't change what they meant. The original text is kept on the record.
              </p>
            )}

            <label className="block mt-4 text-sm font-medium text-gray-700">Rating</label>
            <select
              value={editForm.rating}
              onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
              ))}
            </select>

            <label className="block mt-3 text-sm font-medium text-gray-700">Title</label>
            <input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />

            <label className="block mt-3 text-sm font-medium text-gray-700">Comment</label>
            <textarea
              rows={5}
              value={editForm.comment}
              onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => saveEdit(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Save
              </button>
              <button
                disabled={submitting}
                onClick={() => saveEdit(true)}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                Save &amp; publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add testimonial modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900">Add testimonial</h2>
            <p className="mt-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2">
              For real feedback collected outside the store, published under your own
              name. It is labelled a store testimonial on the product page and never
              shown as a verified purchase. Don't invent customers or feedback.
            </p>

            <label className="block mt-4 text-sm font-medium text-gray-700">Product</label>
            <select
              value={addForm.productId}
              onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
              ))}
            </select>

            <label className="block mt-3 text-sm font-medium text-gray-700">
              Attribution name
            </label>
            <input
              value={addForm.authorName}
              onChange={(e) => setAddForm({ ...addForm, authorName: e.target.value })}
              placeholder="Who gave this feedback"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />

            <label className="block mt-3 text-sm font-medium text-gray-700">Rating</label>
            <select
              value={addForm.rating}
              onChange={(e) => setAddForm({ ...addForm, rating: Number(e.target.value) })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
              ))}
            </select>

            <label className="block mt-3 text-sm font-medium text-gray-700">Title</label>
            <input
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />

            <label className="block mt-3 text-sm font-medium text-gray-700">Comment</label>
            <textarea
              rows={4}
              value={addForm.comment}
              onChange={(e) => setAddForm({ ...addForm, comment: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={submitTestimonial}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
