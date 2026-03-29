import React, { useState, useEffect } from "react";
import {
  NewspaperIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import updatesApi from "../../api/updates.api";
import s3Api from "../../api/s3.api";
import { useToast } from "../../context/ToastContext";

const CATEGORY_OPTIONS = ["TIPS", "GUIDE", "NEWS", "COLLECTION", "TREND"];

const defaultFormData = {
  title: "",
  category: "NEWS",
  author: "",
  image: "",
  link: "",
  publishDate: new Date().toISOString().split("T")[0],
  isActive: true,
  displayOrder: 0,
};

const Updates = () => {
  const { showToast } = useToast();

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await updatesApi.getAllUpdates({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
      });
      const data = response.data || response;
      setUpdates(data.updates || data.docs || data || []);
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total || 0,
          totalPages: data.pagination.totalPages || 1,
        }));
      } else if (data.totalPages) {
        setPagination((prev) => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
        }));
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching updates:", err);
      setError(err.message || "Failed to load updates");
      showToast("Error fetching updates", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [pagination.page, pagination.limit, searchQuery]);

  const handleOpenModal = (update = null) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        title: update.title || "",
        category: update.category || "NEWS",
        author: update.author || "",
        image: update.image || "",
        link: update.link || "",
        publishDate: update.publishDate
          ? new Date(update.publishDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        isActive: update.isActive !== undefined ? update.isActive : true,
        displayOrder: update.displayOrder || 0,
      });
      setImagePreview(update.image || "");
    } else {
      setEditingUpdate(null);
      setFormData({ ...defaultFormData });
      setImagePreview("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUpdate(null);
    setFormData({ ...defaultFormData });
    setImagePreview("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await s3Api.uploadImage(file, "updates");
      setFormData((prev) => ({ ...prev, image: result.url }));
      setImagePreview(result.url);
      showToast("Image uploaded successfully", "success");
    } catch (err) {
      console.error("Error uploading image:", err);
      showToast("Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUpdate) {
        await updatesApi.updateUpdate(editingUpdate._id, formData);
        showToast("Update saved successfully", "success");
      } else {
        await updatesApi.createUpdate(formData);
        showToast("Update created successfully", "success");
      }
      fetchUpdates();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving update:", err);
      showToast(err.message || "Failed to save update", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this update?")) {
      try {
        await updatesApi.deleteUpdate(id);
        showToast("Update deleted successfully", "success");
        fetchUpdates();
      } catch (err) {
        console.error("Error deleting update:", err);
        showToast("Failed to delete update", "error");
      }
    }
  };

  const handleToggleStatus = async (update) => {
    try {
      await updatesApi.updateUpdate(update._id, {
        isActive: !update.isActive,
      });
      showToast(
        `Update ${!update.isActive ? "activated" : "deactivated"} successfully`,
        "success"
      );
      fetchUpdates();
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Error updating update status", "error");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <NewspaperIcon className="h-5 w-5 text-indigo-600" />
                Latest Updates
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage news, tips, guides, and trend updates.
              </p>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
            >
              <PlusIcon className="h-4 w-4" />
              Add New Update
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-white border border-red-100 rounded-xl p-8 text-center shadow-sm">
              <XCircleIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-gray-900 font-bold text-sm mb-1">
                Error Loading Updates
              </h3>
              <p className="text-gray-500 text-xs mb-4">{error}</p>
              <button
                onClick={fetchUpdates}
                className="px-4 py-2 bg-gray-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : updates.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="bg-gray-50/50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <NewspaperIcon className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold text-sm mb-1">
                No Updates Yet
              </h3>
              <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto">
                Create your first update to share news, tips, and guides with
                your audience.
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md shadow-indigo-100 transition-all active:scale-95"
              >
                Create Your First Update
              </button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Publish Date
                        </th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {updates.map((update) => (
                        <tr
                          key={update._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            {update.image ? (
                              <img
                                src={update.image}
                                alt={update.title}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <NewspaperIcon className="h-5 w-5 text-gray-300" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900 text-xs">
                              {update.title}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {update.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {update.author}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {update.publishDate
                              ? new Date(
                                  update.publishDate
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleStatus(update)}
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                                update.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  update.isActive
                                    ? "bg-emerald-500"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                              {update.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenModal(update)}
                                className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors"
                                title="Edit"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(update._id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-500">
                    Page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-bold text-gray-900">
                  {editingUpdate ? "Edit Update" : "New Update"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-colors"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter update title"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Author name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {uploading && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-3.5 w-3.5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-500">
                        Uploading...
                      </span>
                    </div>
                  )}
                  {imagePreview && !uploading && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                {/* Link */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                  />
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                    required
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold bg-gray-50/50"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2.5 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-xs font-semibold text-gray-700 cursor-pointer flex-1"
                  >
                    Set as active
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : editingUpdate ? (
                      "Save Changes"
                    ) : (
                      "Create Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Updates;
