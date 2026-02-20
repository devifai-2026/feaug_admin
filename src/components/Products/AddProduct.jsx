import React, { useState } from "react";
import {
  ArrowLeftIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import { Link, useNavigate } from "react-router-dom";

import categoryApi from "../../api/categories.api";
import productApi from "../../api/product.api";
import s3Api from "../../api/s3.api";

const modules = {
  toolbar: [["bold", "italic", "underline"], ["clean"]],
};

const formats = ["bold", "italic", "underline", "clean"];

const AddProduct = () => {

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    basePrice: "",
    sellingPrice: "",
    stockQuantity: "",
    lowStockThreshold: "10",
    description: "",
    shortDescription: "",
    sku: "",
    brand: "",
    material: "",
    purity: "",
    gender: "unisex",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    discountType: "none",
    discountValue: "0",
    isActive: true,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    metaTitle: "",
    metaDescription: "",
    tags: "",
    image: "",
  });
  const [categoriesList, setCategoriesList] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch categories on mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        if (response && response.data && response.data.categories) {
          setCategoriesList(response.data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);



  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Clear error for this field if user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const generateSku = () => {
    const randomChars = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    const datePart = new Date().getTime().toString().slice(-4);
    const newSku = `SKU-${randomChars}-${datePart}`;
    setFormData((prev) => ({ ...prev, sku: newSku }));
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: value,
      },
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value === "") return;

    if (["stockQuantity", "lowStockThreshold", "discountValue"].includes(name)) {
      const num = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(num) || num < 0 ? "0" : num.toString(),
      }));
    } else if (["basePrice", "sellingPrice", "weight"].includes(name)) {
      const num = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(num) || num < 0 ? "0" : num.toString(),
      }));
    }
  };

  const handleDimensionBlur = (e) => {
    const { name, value } = e.target;
    if (value === "") return;
    const num = parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: isNaN(num) || num < 0 ? "0" : num.toString(),
      },
    }));
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate files
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    for (let i = 0; i < files.length; i++) {
      if (!allowedTypes.includes(files[i].type)) {
        showToast("error", `"${files[i].name}" is not a supported image format. Use JPG, PNG, WebP, or GIF.`);
        return;
      }
      if (files[i].size > 10 * 1024 * 1024) {
        showToast("error", `"${files[i].name}" exceeds the 10MB size limit.`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      if (files.length === 1) {
        // Single file upload
        const result = await s3Api.uploadImage(files[0], "products", (percent) => {
          setUploadProgress(percent);
        });
        setImageUrls((prev) => [...prev, result.url]);
        if (imageUrls.length === 0 && !formData.image) {
          setFormData((prev) => ({ ...prev, image: result.url }));
        }
      } else {
        // Multiple files upload
        const result = await s3Api.uploadImages(files, "products", (percent) => {
          setUploadProgress(percent);
        });
        const urls = result.files.map((f) => f.url);
        setImageUrls((prev) => [...prev, ...urls]);
        if (imageUrls.length === 0 && !formData.image && urls.length > 0) {
          setFormData((prev) => ({ ...prev, image: urls[0] }));
        }
      }
      setUploadProgress(100);
      showToast("success", "Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      showToast("error", error.response?.data?.message || error.message || "Error uploading images");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && isValidUrl(newImageUrl)) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    } else {
      showToast("error", "Please enter a valid URL");
    }
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index) => {
    const primaryImage = imageUrls[index];
    setFormData((prev) => ({
      ...prev,
      image: primaryImage,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.basePrice || formData.basePrice < 0)
      newErrors.basePrice = "Base price is required";
    if (!formData.sellingPrice || formData.sellingPrice < 0)
      newErrors.sellingPrice = "Selling price is required";
    if (!formData.stockQuantity || formData.stockQuantity < 0)
      newErrors.stockQuantity = "Stock quantity is required";
    if (!formData.material) newErrors.material = "Material is required";
    if (!formData.description || formData.description.length < 50)
      newErrors.description = "Description must be at least 50 characters";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stockQuantity: parseInt(formData.stockQuantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        discountValue: parseFloat(formData.discountValue),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: {
          length: formData.dimensions.length
            ? parseFloat(formData.dimensions.length)
            : undefined,
          width: formData.dimensions.width
            ? parseFloat(formData.dimensions.width)
            : undefined,
          height: formData.dimensions.height
            ? parseFloat(formData.dimensions.height)
            : undefined,
        },
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        // Collect all images ensuring unique URLs and preserving primary selection
        images: (() => {
          const allUrls = new Set([...imageUrls]);
          if (formData.image && formData.image.trim()) {
            allUrls.add(formData.image.trim());
          }
          return Array.from(allUrls).map((url) => ({
            url,
            isPrimary: url === formData.image,
          }));
        })(),
      };

      await productApi.createProduct(payload);

      showToast("success", "Product added successfully!");
      setTimeout(() => navigate("/products"), 1500);
    } catch (error) {
      console.error("Error creating product:", error);
      showToast("error", error.response?.data?.message || "Error creating product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Sports",
    "Books",
    "Beauty",
    "Toys",
    "Automotive",
  ];

  return (
    <div>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link
                to="/products"
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Add New Product
                </h1>
                <p className="text-gray-600">
                  Fill in the details to add a new product
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.name ? "border-red-300 ring-red-50" : "border-gray-200"}`}
                    placeholder="Enter product title"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center font-medium">
                      <ExclamationCircleIcon className="h-3.5 w-3.5 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.category ? "border-red-300" : "border-gray-200"}`}
                    required
                  >
                    <option value="">Select category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Brand name"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Material *
                  </label>
                  <select
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.material ? "border-red-300" : "border-gray-200"}`}
                  >
                    <option value="">Select Material</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                    <option value="pearl">Pearl</option>
                    <option value="gemstone">Gemstone</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Purity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purity
                  </label>
                  <select
                    name="purity"
                    value={formData.purity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Purity</option>
                    <option value="14k">14k</option>
                    <option value="18k">18k</option>
                    <option value="22k">22k</option>
                    <option value="24k">24k</option>
                    <option value="925">925 (Silver)</option>
                    <option value="950">950 (Platinum)</option>
                    <option value="999">999</option>
                    <option value="na">N/A</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                    <option value="kids">Kids</option>
                  </select>
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SKU (Auto-generated if blank)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="PROD-123456"
                    />
                    <button
                      type="button"
                      onClick={generateSku}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Stock section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
                Pricing & Inventory
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Base Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Base Price (Cost) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min="0"
                      className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.basePrice ? "border-red-300" : "border-gray-200"}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selling Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min="0"
                      className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.sellingPrice ? "border-red-300" : "border-gray-200"}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Discount section */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Disc. Type
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="none">None</option>
                      <option value="percentage">% Off</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Value
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min="0"
                      disabled={formData.discountType === "none"}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="0"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.stockQuantity ? "border-red-300" : "border-gray-200"}`}
                    placeholder="0"
                  />
                </div>

                {/* Min Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="0"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                Description & Content
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description
                </label>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
                  <ReactQuill
                    theme="snow"
                    value={formData.shortDescription}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        shortDescription: value,
                      }))
                    }
                    modules={modules}
                    formats={formats}
                    className="h-24 mb-10"
                    placeholder="Brief summary (appears in lists)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Description * (Min 50 chars)
                </label>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: value,
                      }))
                    }
                    modules={modules}
                    formats={formats}
                    className={`h-64 mb-12 ${errors.description ? "border-red-300" : ""}`}
                  />
                </div>
                {errors.description && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Images section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2 text-orange-600" />
                Media Management
              </h2>
            </div>
            <div className="p-6">
              {/* Primary Image */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary Image URL
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <PhotoIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Primary"
                      className="h-11 w-11 rounded-lg object-cover border border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=100&h=100&fit=crop";
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Gallery Images
                </label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/gallery.jpg"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-5 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all"
                  >
                    Add URL
                  </button>
                </div>

                {/* File Upload UI */}
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-50 hover:border-blue-300">
                  <div className="p-3 bg-white rounded-full shadow-sm mb-4">
                    <ArrowUpTrayIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <label className="relative cursor-pointer group">
                      <span className="text-blue-600 font-bold group-hover:text-blue-700 transition-colors">
                        Click to upload files
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-1 font-medium italic">
                      or drag and drop images here
                    </p>
                  </div>
                  {uploading && (
                    <div className="mt-4 w-full max-w-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-blue-600">Uploading...</span>
                        <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Grid */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-8">
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:ring-2 hover:ring-blue-500"
                      >
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className={`p-1.5 rounded-lg transition-colors ${formData.image === url ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                            title="Make Primary"
                          >
                            {formData.image === url ? (
                              <CheckIcon className="h-4 w-4" />
                            ) : (
                              <PhotoIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        {formData.image === url && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-[10px] font-bold text-white rounded uppercase tracking-wider">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specifications & Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Physical Specs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2 text-cyan-600" />
                  Physical Details
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="0"
                    step="0.001"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.000"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                      Length
                    </label>
                    <input
                      type="number"
                      name="length"
                      value={formData.dimensions.length}
                      onChange={handleDimensionChange}
                      onBlur={handleDimensionBlur}
                      min="0"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      placeholder="L"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                      Width
                    </label>
                    <input
                      type="number"
                      name="width"
                      value={formData.dimensions.width}
                      onChange={handleDimensionChange}
                      onBlur={handleDimensionBlur}
                      min="0"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      placeholder="W"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                      Height
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.dimensions.height}
                      onChange={handleDimensionChange}
                      onBlur={handleDimensionBlur}
                      min="0"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      placeholder="H"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flags/Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-pink-600" />
                  Visibility & Status
                </h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                {[
                  {
                    id: "isActive",
                    label: "Active",
                    desc: "Visible to users",
                  },
                  {
                    id: "isFeatured",
                    label: "Featured",
                    desc: "Home page spotlight",
                  },
                  {
                    id: "isNewArrival",
                    label: "New Arrival",
                    desc: "Latest products tag",
                  },
                  {
                    id: "isBestSeller",
                    label: "Bestseller",
                    desc: "Hot purchase badge",
                  },
                ].map((flag) => (
                  <label
                    key={flag.id}
                    className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white hover:border-blue-200"
                  >
                    <input
                      type="checkbox"
                      name={flag.id}
                      checked={formData[flag.id]}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-bold text-gray-900">
                        {flag.label}
                      </span>
                      <span className="block text-[10px] text-gray-500 font-medium leading-none mt-1">
                        {flag.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* SEO and Tags section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="h-5 w-5 mr-2 bg-indigo-600 rounded flex items-center justify-center text-[10px] text-white">
                  SEO
                </div>
                Search Engine Optimization
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Product title for SEO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="ring, gold, sapphire, wedding"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="SEO optimized description for search engines..."
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t border-gray-100">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-center"
            >
              Discard Changes
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center min-w-[180px]"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[70] flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl max-w-sm border ${
          toast.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}>
          <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}>
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <p className={`flex-1 text-sm font-medium ${toast.type === "success" ? "text-green-800" : "text-red-800"}`}>
            {toast.message}
          </p>
          <button onClick={() => setToast(null)} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
