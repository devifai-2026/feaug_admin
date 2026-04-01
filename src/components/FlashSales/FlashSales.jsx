import React, { useState, useEffect } from "react";
import {
  BoltIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import flashSaleApi from "../../api/flashSale.api";
import s3Api from "../../api/s3.api";
import { useToast } from "../../context/ToastContext";

const defaultFormData = {
  title: "FLASH SALE",
  productName: "",
  description: "",
  price: "",
  originalPrice: "",
  backgroundImage: "",
  productLink: "",
  promoCode: "",
  discountPercentage: "",
  endDate: "",
  stock: 0,
  isActive: true,
};

const FlashSales = () => {
  const { showToast } = useToast();

  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Date limits for calendar
  const [dateLimits, setDateLimits] = useState(() => {
    const now = new Date();
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(now.getMonth() + 1);
    
    return {
      min: now.toISOString().slice(0, 16),
      max: oneMonthFromNow.toISOString().slice(0, 16)
    };
  });

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlashSale, setEditingFlashSale] = useState(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const response = await flashSaleApi.getAllFlashSales({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
      });
      const data = response.data || response;
      setFlashSales(data.flashSales || data.docs || data || []);
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
      console.error("Error fetching flash sales:", err);
      setError(err.message || "Failed to load flash sales");
      showToast("Error fetching flash sales", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashSales();
  }, [pagination.page, pagination.limit, searchQuery]);

  const handleOpenModal = (flashSale = null) => {
    if (flashSale) {
      setEditingFlashSale(flashSale);
      setFormData({
        title: flashSale.title || "FLASH SALE",
        productName: flashSale.productName || "",
        description: flashSale.description || "",
        price: flashSale.price || "",
        originalPrice: flashSale.originalPrice || "",
        backgroundImage: flashSale.backgroundImage || "",
        productLink: flashSale.productLink || "",
        promoCode: flashSale.promoCode || "",
        discountPercentage: flashSale.discountPercentage || "",
        endDate: flashSale.endDate
          ? new Date(flashSale.endDate).toISOString().slice(0, 16)
          : "",
        stock: flashSale.stock !== undefined ? flashSale.stock : 0,
        isActive: flashSale.isActive !== undefined ? flashSale.isActive : true,
      });
      setImagePreview(flashSale.backgroundImage || "");
    } else {
      setEditingFlashSale(null);
      setFormData({ ...defaultFormData });
      setImagePreview("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFlashSale(null);
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
      const result = await s3Api.uploadImage(file, "flash-sales");
      setFormData((prev) => ({ ...prev, backgroundImage: result.url }));
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
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        discountPercentage: formData.discountPercentage
          ? Number(formData.discountPercentage)
          : undefined,
        stock: Number(formData.stock),
      };
      if (editingFlashSale) {
        await flashSaleApi.updateFlashSale(editingFlashSale._id, payload);
        showToast("Flash sale saved successfully", "success");
      } else {
        await flashSaleApi.createFlashSale(payload);
        showToast("Flash sale created successfully", "success");
      }
      fetchFlashSales();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving flash sale:", err);
      showToast(err.message || "Failed to save flash sale", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this flash sale?")) {
      try {
        await flashSaleApi.deleteFlashSale(id);
        showToast("Flash sale deleted successfully", "success");
        fetchFlashSales();
      } catch (err) {
        console.error("Error deleting flash sale:", err);
        showToast("Failed to delete flash sale", "error");
      }
    }
  };

  const handleToggleStatus = async (flashSale) => {
    try {
      await flashSaleApi.updateFlashSale(flashSale._id, {
        isActive: !flashSale.isActive,
      });
      showToast(
        `Flash sale ${!flashSale.isActive ? "activated" : "deactivated"} successfully`,
        "success"
      );
      fetchFlashSales();
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Error updating flash sale status", "error");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BoltIcon className="h-5 w-5 text-indigo-600" />
                Flash Sales
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage flash sale campaigns with countdown timers and special
                offers.
              </p>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
            >
              <PlusIcon className="h-4 w-4" />
              Create Flash Sale
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name..."
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
                Error Loading Flash Sales
              </h3>
              <p className="text-gray-500 text-xs mb-4">{error}</p>
              <button
                onClick={fetchFlashSales}
                className="px-4 py-2 bg-gray-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : flashSales.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="bg-gray-50/50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold text-sm mb-1">
                No Flash Sales Yet
              </h3>
              <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto">
                Create your first flash sale to offer limited-time deals to your
                customers.
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md shadow-indigo-100 transition-all active:scale-95"
              >
                Create Your First Flash Sale
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
                          Product Name
                        </th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          End Date
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
                      {flashSales.map((sale) => (
                        <tr
                          key={sale._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            {sale.backgroundImage ? (
                              <img
                                src={sale.backgroundImage}
                                alt={sale.productName}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <BoltIcon className="h-5 w-5 text-gray-300" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900 text-xs">
                              {sale.productName}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-gray-900">
                                {sale.price}
                              </span>
                              {sale.originalPrice && (
                                <span className="text-[10px] text-gray-400 line-through">
                                  {sale.originalPrice}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {sale.endDate
                              ? new Date(sale.endDate).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {isExpired(sale.endDate) ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-red-50 text-red-700 border-red-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  Expired
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleToggleStatus(sale)}
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                                    sale.isActive
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      sale.isActive
                                        ? "bg-emerald-500"
                                        : "bg-gray-400"
                                    }`}
                                  ></span>
                                  {sale.isActive ? "Active" : "Inactive"}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenModal(sale)}
                                className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors"
                                title="Edit"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(sale._id)}
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
                  {editingFlashSale ? "Edit Flash Sale" : "New Flash Sale"}
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
                    placeholder="e.g. FLASH SALE"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                    required
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="e.g. 24K Gold Stud Earrings"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the flash sale"
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50 resize-none"
                  />
                </div>

                {/* Price & Original Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold bg-gray-50/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Original Price
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                {/* Background Image Upload */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Background Image
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

                {/* Product Link */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Product Link
                  </label>
                  <input
                    type="text"
                    name="productLink"
                    value={formData.productLink}
                    onChange={handleInputChange}
                    placeholder="e.g. /product/gold-earrings"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                  />
                </div>

                {/* Promo Code & Discount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Promo Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="promoCode"
                      value={formData.promoCode}
                      onChange={handleInputChange}
                      placeholder="e.g. FLASH20"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Discount %
                    </label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold bg-gray-50/50"
                    />
                  </div>
                </div>

                {/* End Date & Stock */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={dateLimits.min}
                      max={dateLimits.max}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold bg-gray-50/50"
                    />
                  </div>
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
                    ) : editingFlashSale ? (
                      "Save Changes"
                    ) : (
                      "Create Flash Sale"
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

export default FlashSales;
