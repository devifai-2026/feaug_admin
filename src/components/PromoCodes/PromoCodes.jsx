import React, { useState, useEffect } from "react";
import {
  TicketIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import * as promoApi from "../../api/promoCodes.api";
import categoryApi from "../../api/categories.api";


const PromoCodes = () => {

  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    isActive: true,
    isSecret: false,
    applicableCategory: "",
    minimumPurchase: 0,
    firstTimeOnly: false,
    maxUses: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await promoApi.getAllPromoCodes();
      setPromoCodes(response.data.promoCodes);
      setError(null);
    } catch (err) {
      console.error("Error fetching promo codes:", err);
      setError(err.response?.data?.message || "Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAllCategories();
      setCategories(response.data?.categories || response.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
    fetchCategories();
  }, []);

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        discountPercentage: promo.discountPercentage,
        isActive: promo.isActive,
        isSecret: promo.isSecret || false,
        applicableCategory: typeof promo.applicableCategory === 'object' ? promo.applicableCategory._id : promo.applicableCategory || "",
        minimumPurchase: promo.minimumPurchase || 0,
        firstTimeOnly: promo.firstTimeOnly || false,
        maxUses: promo.maxUses || 0,
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: "",
        discountPercentage: "",
        isActive: true,
        isSecret: false,
        applicableCategory: "",
        minimumPurchase: 0,
        firstTimeOnly: false,
        maxUses: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
    setFormData({
      code: "",
      discountPercentage: "",
      isActive: true,
      isSecret: false,
      applicableCategory: "",
      minimumPurchase: 0,
      firstTimeOnly: false,
      maxUses: 0,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPromo) {
        await promoApi.updatePromoCode(editingPromo._id, formData);
      } else {
        if (promoCodes.length >= 10) {
          alert("Maximum limit of 10 promo codes reached.");
          setSubmitting(false);
          return;
        }
        await promoApi.createPromoCode(formData);
      }
      fetchPromoCodes();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving promo code:", err);
      alert(err.response?.data?.message || "Failed to save promo code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this promo code?")) {
      try {
        await promoApi.deletePromoCode(id);
        fetchPromoCodes();
      } catch (err) {
        console.error("Error deleting promo code:", err);
        alert("Failed to delete promo code");
      }
    }
  };

  return (
    <>
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-indigo-600" />
              Promo Codes
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage simplified discounts for your store. (Max 10 active)
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            disabled={promoCodes.length >= 10}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${promoCodes.length >= 10
                ? "bg-gray-100 cursor-not-allowed text-gray-400 border border-gray-200"
                : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
              }`}
          >
            <PlusIcon className="h-4 w-4" />
            New Promo Code
          </button>
        </div>

        {/* Alert for max limit */}
        {promoCodes.length >= 10 && (
          <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-lg p-3.5 flex items-start gap-3">
            <InformationCircleIcon className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-indigo-900 font-semibold text-xs">
                Limit Reached
              </h3>
              <p className="text-indigo-700 text-[11px] mt-0.5">
                You have reached the maximum limit of 10 promo codes. Delete
                or deactivate existing ones to add more.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-white border border-red-100 rounded-xl p-8 text-center shadow-sm">
            <XCircleIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-gray-900 font-bold text-sm mb-1">
              Error Loading Promo Codes
            </h3>
            <p className="text-gray-500 text-xs mb-4">{error}</p>
            <button
              onClick={fetchPromoCodes}
              className="px-4 py-2 bg-gray-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <div className="bg-gray-50/50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold text-sm mb-1">
              No Promo Codes Yet
            </h3>
            <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto">
              Create your first simplified promo code like 'FEAUGE10' with a
              percentage discount.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md shadow-indigo-100 transition-all active:scale-95"
            >
              Create Your First Code
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {promoCodes.map((promo) => (
              <div
                key={promo._id}
                className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group overflow-hidden"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${promo.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${promo.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                    ></span>
                    {promo.isActive ? "Active" : "Inactive"}
                  </div>

                  {promo.isSecret && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-100">
                      Secret
                    </div>
                  )}

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(promo)}
                      className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors"
                      title="Edit"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Promo Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Promo Code
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="inline-block font-mono font-bold text-base text-indigo-700 bg-indigo-50/50 px-2 py-1 rounded border border-indigo-100/50">
                        {promo.code}
                      </div>
                      <button
                        onClick={() => handleCopy(promo.code)}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-md transition-all flex items-center gap-1"
                        title="Copy to clipboard"
                      >
                        {copiedCode === promo.code ? (
                          <span className="text-[10px] font-bold text-emerald-600 animate-in fade-in zoom-in duration-200">
                            Copied!
                          </span>
                        ) : (
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                        Discount
                      </p>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-black text-gray-900 leading-none">
                          {promo.discountPercentage}%
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">
                          OFF
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                        Added On
                      </p>
                      <p className="text-[11px] font-medium text-gray-600">
                        {new Date(promo.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Condition Badges */}
                {(promo.minimumPurchase > 0 || promo.applicableCategory || promo.firstTimeOnly || promo.maxUses > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-dashed border-gray-100">
                    {promo.minimumPurchase > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        Min ₹{promo.minimumPurchase}
                      </span>
                    )}
                    {promo.applicableCategory && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                        {(() => {
                          const category = categories.find(c => c._id === (typeof promo.applicableCategory === 'object' ? promo.applicableCategory._id : promo.applicableCategory));
                          return category ? category.name : (typeof promo.applicableCategory === 'object' ? promo.applicableCategory.name : promo.applicableCategory);
                        })()} only
                      </span>
                    )}
                    {promo.firstTimeOnly && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                        New users
                      </span>
                    )}
                    {promo.maxUses > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                        Max {promo.maxUses} uses
                      </span>
                    )}
                  </div>
                )}

                {/* Ticket "Cuts" Effect */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-gray-50/50 rounded-full border border-gray-200 -translate-y-1/2"></div>
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-gray-50/50 rounded-full border border-gray-200 -translate-y-1/2"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

      {/* Modal Overlay */ }
  {
    isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 border border-gray-200 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold text-gray-900">
                {editingPromo ? "Edit Promo Code" : "New Promo Code"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-colors"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Promo Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g. SAVE20"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase font-bold text-indigo-700 bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Discount Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold bg-gray-50/50"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    %
                  </div>
                </div>
              </div>

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

              <div className="flex items-center gap-2.5 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                <input
                  type="checkbox"
                  id="isSecret"
                  name="isSecret"
                  checked={formData.isSecret}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="isSecret"
                  className="text-xs font-semibold text-gray-700 cursor-pointer flex-1"
                >
                  Secret Code (Hidden from list)
                </label>
              </div>

              {/* Applicable Category */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Applicable Category
                </label>
                <select
                  name="applicableCategory"
                  value={formData.applicableCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minimum Purchase Amount */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Minimum Purchase Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="minimumPurchase"
                    value={formData.minimumPurchase}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold bg-gray-50/50"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    ₹
                  </div>
                </div>
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Max Uses <span className="normal-case font-normal text-gray-400">(0 = unlimited)</span>
                </label>
                <input
                  type="number"
                  name="maxUses"
                  value={formData.maxUses}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold bg-gray-50/50"
                />
              </div>

              {/* First Time Users Only */}
              <div className="flex items-center gap-2.5 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                <input
                  type="checkbox"
                  id="firstTimeOnly"
                  name="firstTimeOnly"
                  checked={formData.firstTimeOnly}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="firstTimeOnly"
                  className="text-xs font-semibold text-gray-700 cursor-pointer flex-1"
                >
                  First Time Users Only
                </label>
              </div>

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
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : editingPromo ? (
                    "Save Changes"
                  ) : (
                    "Create Promo"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
    </>
  );
};

export default PromoCodes;
