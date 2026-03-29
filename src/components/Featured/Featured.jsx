import React, { useState, useEffect, useRef } from "react";
import {
  SparklesIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import featuredApi from "../../api/featured.api";
import productApi from "../../api/product.api";
import { useToast } from "../../context/ToastContext";

const Featured = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    isActive: true,
    title: "",
    subtitle: "",
    products: [],
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await featuredApi.getConfig();
      const data = response.data || response;
      setFormData({
        isActive: data.isActive ?? true,
        title: data.title ?? "",
        subtitle: data.subtitle ?? "",
        products: data.products ?? [],
      });
    } catch (err) {
      console.error("Error fetching featured config:", err);
      showToast(err.message || "Failed to load featured config", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAllProducts({ limit: 1000 });
      const data = response.data || response;
      setAllProducts(Array.isArray(data) ? data : data.products || data.docs || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      showToast(err.message || "Failed to load products", "error");
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchProducts();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const selectedProductIds = formData.products.map((p) =>
    typeof p === "string" ? p : p._id || p.id
  );

  const filteredProducts = allProducts.filter((product) => {
    const id = product._id || product.id;
    if (selectedProductIds.includes(id)) return false;
    if (!searchQuery.trim()) return true;
    return product.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddProduct = (product) => {
    if (selectedProductIds.length >= 10) {
      showToast("Maximum 10 products allowed", "warning");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, product],
    }));
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRemoveProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => {
        const id = typeof p === "string" ? p : p._id || p.id;
        return id !== productId;
      }),
    }));
  };

  const handleMoveProduct = (index, direction) => {
    const newProducts = [...formData.products];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newProducts.length) return;
    [newProducts[index], newProducts[targetIndex]] = [
      newProducts[targetIndex],
      newProducts[index],
    ];
    setFormData((prev) => ({
      ...prev,
      products: newProducts,
    }));
  };

  const getProductDetails = (product) => {
    if (typeof product === "string") {
      const found = allProducts.find(
        (p) => (p._id || p.id) === product
      );
      return found || { _id: product, name: "Unknown Product" };
    }
    return product;
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      return primary?.url || product.images[0]?.url || product.images[0];
    }
    if (product.image) return product.image;
    if (product.thumbnail) return product.thumbnail;
    return null;
  };

  const getProductPrice = (product) => {
    if (product.sellingPrice) return product.sellingPrice;
    if (product.price) return product.price;
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        isActive: formData.isActive,
        title: formData.title,
        subtitle: formData.subtitle,
        products: formData.products.map((p) =>
          typeof p === "string" ? p : p._id || p.id
        ),
      };
      await featuredApi.updateConfig(payload);
      showToast("Featured Collection config saved successfully", "success");
    } catch (err) {
      console.error("Error saving featured config:", err);
      showToast(err.message || "Failed to save config", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-indigo-600" />
              Featured Collection
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure the featured collection section displayed on the storefront.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section Toggle */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Section Visibility
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Toggle whether the Featured Collection section is visible on the
                  storefront.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleActive}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  formData.isActive
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Section Text */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Section Text
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Featured Collection"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Subtitle
                </label>
                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Explore our handpicked featured products..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Product Picker */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-1">
              Selected Products
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Search and add up to 10 products. Use the arrows to reorder.
            </p>

            {/* Search Input */}
            <div className="relative mb-4" ref={dropdownRef}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search products by name..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50"
                />
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-400 text-center">
                      No products found.
                    </div>
                  ) : (
                    filteredProducts.slice(0, 20).map((product) => {
                      const imgUrl = getProductImage(product);
                      const price = getProductPrice(product);
                      return (
                        <button
                          type="button"
                          key={product._id || product.id}
                          onClick={() => handleAddProduct(product)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="h-8 w-8 rounded object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-gray-100 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                          </div>
                          {price != null && (
                            <span className="text-xs font-semibold text-gray-500">
                              &#8377;{price}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Selected Products List */}
            {formData.products.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
                <p className="text-xs text-gray-400">
                  No products selected yet. Search and add products above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.products.map((product, index) => {
                  const details = getProductDetails(product);
                  const imgUrl = getProductImage(details);
                  const price = getProductPrice(details);
                  const productId = details._id || details.id;

                  return (
                    <div
                      key={productId}
                      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg group"
                    >
                      <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">
                        {index + 1}
                      </span>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={details.name}
                          className="h-10 w-10 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {details.name || "Unknown Product"}
                        </p>
                        {price != null && (
                          <p className="text-xs text-gray-500">
                            &#8377;{price}
                          </p>
                        )}
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveProduct(index, -1)}
                          disabled={index === 0}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ChevronUpIcon className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProduct(index, 1)}
                          disabled={index === formData.products.length - 1}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ChevronDownIcon className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(productId)}
                        className="p-1 hover:bg-red-50 rounded transition-colors shrink-0"
                        title="Remove product"
                      >
                        <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {formData.products.length > 0 && (
              <p className="text-xs text-gray-400 mt-2 text-right">
                {formData.products.length}/10 products selected
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white shadow-md shadow-indigo-100 transition-all active:scale-95"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Featured;
