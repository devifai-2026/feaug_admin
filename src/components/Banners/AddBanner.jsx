import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  TrashIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import bannerApi from "../../api/banners.api";
import productApi from "../../api/product.api";
import { getAllPromoCodes } from "../../api/promoCodes.api";
import s3Api from "../../api/s3.api";
import { useToast } from "../../context/ToastContext";

// Placement presets — single dropdown maps to bannerType + page + position
const PLACEMENT_OPTIONS = [
  {
    value: "homepage_carousel",
    label: "Homepage Top Carousel",
    description: "Main hero slider at the top of the homepage. Add multiple images for carousel slides.",
    bannerType: "header",
    page: "home",
    position: "top",
    showPerImageFields: true,
    showPromo: false,
    showButtonText: true,
    showSubheader: true,
    showBody: true,
  },
  {
    value: "homepage_hero",
    label: "Homepage Hero (Cleopatra Section)",
    description: "Large hero image with text overlay in the Cleopatra Glam section.",
    bannerType: "hero",
    page: "home",
    position: "hero",
    showPerImageFields: false,
    showPromo: false,
    showButtonText: true,
    showSubheader: true,
    showBody: true,
  },
  {
    value: "homepage_promotional",
    label: "Homepage Promotional Card",
    description: "Small promo card below the hero section. Create 2 of these for the side-by-side layout.",
    bannerType: "promotional",
    page: "home",
    position: "top",
    showPerImageFields: false,
    showPromo: true,
    showButtonText: true,
    showSubheader: true,
    showBody: false,
  },
  {
    value: "homepage_flash_sale",
    label: "Homepage Flash Sale",
    description: "Background banner for the Flash Sale section with countdown timer. Set an End Date for the timer.",
    bannerType: "slider",
    page: "home",
    position: "top",
    showPerImageFields: false,
    showPromo: false,
    showButtonText: false,
    showSubheader: false,
    showBody: true,
  },
  {
    value: "homepage_sidebar",
    label: "Homepage Sidebar (BestSeller Sale)",
    description: "Sale panel on the left side of the BestSeller section.",
    bannerType: "header",
    page: "home",
    position: "sidebar",
    showPerImageFields: false,
    showPromo: false,
    showButtonText: true,
    showSubheader: true,
    showBody: false,
  },
  {
    value: "homepage_bottom",
    label: "Homepage Bottom Banner",
    description: "Full-width banner near the bottom of the homepage, before the footer.",
    bannerType: "header",
    page: "home",
    position: "bottom",
    showPerImageFields: false,
    showPromo: false,
    showButtonText: true,
    showSubheader: true,
    showBody: true,
  },
  {
    value: "homepage_middle",
    label: "Homepage Middle Banner",
    description: "Full-width banner between content sections on the homepage.",
    bannerType: "header",
    page: "home",
    position: "middle",
    showPerImageFields: false,
    showPromo: false,
    showButtonText: true,
    showSubheader: true,
    showBody: true,
  },
];

const AddBanner = () => {
  const navigate = useNavigate();

  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [placement, setPlacement] = useState("homepage_carousel");

  // Flash Sale specific state
  const [featuredProductId, setFeaturedProductId] = useState("");
  const [selectedProductDisplay, setSelectedProductDisplay] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [promoCodes, setPromoCodes] = useState([]);
  const searchTimerRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    subheader: "",
    body: "",
    footer: "",
    images: [],
    bannerType: "header",
    linkType: "none",
    linkTarget: "",
    page: "home",
    position: "top",
    displayOrder: 0,
    isActive: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    backgroundColor: "",
    textColor: "",
    buttonText: "",
    buttonColor: "",
    promoCode: "",
    discountPercentage: 0,
    primaryImage: "",
  });

  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [errors, setErrors] = useState({});

  const currentPlacement = PLACEMENT_OPTIONS.find((p) => p.value === placement);

  // Load promo codes when flash sale placement is selected
  useEffect(() => {
    if (placement === "homepage_flash_sale") {
      getAllPromoCodes()
        .then((data) => {
          const codes = data?.data?.promoCodes || data?.promoCodes || [];
          setPromoCodes(codes);
        })
        .catch(() => {});
    }
  }, [placement]);

  const handleProductSearch = (e) => {
    const value = e.target.value;
    setProductSearch(value);
    setProductSearchResults([]);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!value.trim()) return;

    searchTimerRef.current = setTimeout(async () => {
      setProductSearchLoading(true);
      try {
        const data = await productApi.getAllProducts({ search: value, limit: 8 });
        setProductSearchResults(data?.data?.products || []);
      } catch {
        setProductSearchResults([]);
      } finally {
        setProductSearchLoading(false);
      }
    }, 350);
  };

  const selectProduct = (product) => {
    setFeaturedProductId(product._id);
    setSelectedProductDisplay(`${product.name} — ₹${product.sellingPrice?.toLocaleString("en-IN")}`);
    setProductSearch("");
    setProductSearchResults([]);
  };

  const clearProduct = () => {
    setFeaturedProductId("");
    setSelectedProductDisplay("");
    setProductSearch("");
    setProductSearchResults([]);
  };

  const handlePromoCodeSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const pc = promoCodes.find((p) => p._id === selectedId);
    if (pc) {
      setFormData((prev) => ({
        ...prev,
        promoCode: pc.code,
        discountPercentage: pc.discountPercentage,
      }));
    }
    e.target.value = "";
  };

  const handlePlacementChange = (e) => {
    const newPlacement = e.target.value;
    setPlacement(newPlacement);
    const preset = PLACEMENT_OPTIONS.find((p) => p.value === newPlacement);
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        bannerType: preset.bannerType,
        page: preset.page,
        position: preset.position,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        url: newImageUrl.trim(),
        title: "",
        subtitle: "",
        description: "",
        subheader: "",
      },
    ]);
    setNewImageUrl("");
  };

  const removeImage = (index) => {
    const removedImage = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (removedImage.url === formData.primaryImage) {
      setFormData((prev) => ({ ...prev, primaryImage: "" }));
    }
  };

  const handleImageFieldChange = (index, field, value) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = { ...newImages[index], [field]: value };
      return newImages;
    });
  };

  const handleSetPrimaryImage = (url) => {
    setFormData((prev) => ({ ...prev, primaryImage: url }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate all files first
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith("image/")) {
        showToast(`"${files[i].name}" is not an image file`, "error");
        return;
      }
      if (files[i].size > 10 * 1024 * 1024) {
        showToast(`"${files[i].name}" exceeds 10MB limit`, "error");
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (files.length === 1) {
        // Single file upload
        const result = await s3Api.uploadImage(files[0], "banners", (percent) => {
          setUploadProgress(percent);
        });
        setImages((prev) => [
          ...prev,
          { url: result.url, title: "", subtitle: "", description: "", subheader: "" },
        ]);
      } else {
        // Multiple files upload
        const result = await s3Api.uploadImages(files, "banners", (percent) => {
          setUploadProgress(percent);
        });
        const newImages = result.files.map((f) => ({
          url: f.url, title: "", subtitle: "", description: "", subheader: "",
        }));
        setImages((prev) => [...prev, ...newImages]);
      }

      setUploadProgress(100);
      showToast("Images uploaded successfully", "success");
    } catch (error) {
      console.error("Error uploading images:", error);
      showToast(
        error.response?.data?.message || error.message || "Error uploading images. Please try again.",
        "error",
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (images.length === 0) {
      newErrors.image = "At least one banner image is required";
    }

    if (formData.linkType !== "none" && !formData.linkTarget.trim()) {
      newErrors.linkTarget =
        "Link target is required when link type is selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the errors before submitting", "error");
      return;
    }

    try {
      setLoading(true);

      const bannerData = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder) || 0,
        name: formData.title.toLowerCase().replace(/\s+/g, "-"),
        images: images.map((img) => ({
          url: img.url,
          title: img.title || "",
          subtitle: img.subtitle || "",
          description: img.description || "",
          subheader: img.subtitle || img.subheader || "",
          isPrimary: img.url === (formData.primaryImage || images[0]?.url),
          alt: img.title || formData.title,
        })),
      };

      if (featuredProductId) {
        bannerData.featuredProduct = featuredProductId;
      } else {
        bannerData.featuredProduct = null;
      }

      delete bannerData.primaryImage;

      if (!bannerData.endDate) delete bannerData.endDate;
      if (!bannerData.backgroundColor) delete bannerData.backgroundColor;
      if (!bannerData.textColor) delete bannerData.textColor;
      if (!bannerData.buttonColor) delete bannerData.buttonColor;

      await bannerApi.createBanner(bannerData);
      showToast("Banner created successfully", "success");
      navigate("/banners");
    } catch (error) {
      console.error("Error creating banner:", error);
      showToast(
        error.response?.data?.message || "Error creating banner",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/banners")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Banners
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Add New Banner
          </h1>
          <p className="text-gray-600 mt-1">
            Create a new banner for your website
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Placement */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Where should this banner appear?
            </h2>
            <div>
              <select
                value={placement}
                onChange={handlePlacementChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium"
              >
                {PLACEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {currentPlacement && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    {currentPlacement.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Banner Content
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter banner title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title}
                  </p>
                )}
              </div>

              {currentPlacement?.showSubheader && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subheader"
                    value={formData.subheader}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter subtitle (optional)"
                  />
                </div>
              )}

              {currentPlacement?.showBody && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter description (optional)"
                  ></textarea>
                </div>
              )}

              {currentPlacement?.showButtonText && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Shop Now"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2 text-blue-600" />
                Images
              </h2>
              {placement === "homepage_carousel" && (
                <p className="text-sm text-gray-500 mt-1">
                  Each image becomes a carousel slide. Add title, subtitle & description per slide.
                </p>
              )}
            </div>
            <div className="p-6 space-y-6">
              {/* Image URL Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Image via URL
                </label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      placeholder="Paste banner image URL here..."
                    />
                    <PhotoIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 active:scale-95"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* File Upload UI */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Images
                </label>
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-50 hover:border-blue-300">
                  <div className="p-3 bg-white rounded-full shadow-sm mb-4">
                    <ArrowUpTrayIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <label className="relative cursor-pointer group">
                      <span className="text-blue-600 font-bold group-hover:text-blue-700 transition-colors underline">
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
                    <p className="text-xs text-gray-400 mt-2">
                      PNG, JPG, WEBP up to 10MB each
                    </p>
                  </div>
                  {uploading && (
                    <div className="mt-4 w-full max-w-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-blue-600">
                          Uploading...
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errors.image && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.image}
                </p>
              )}

              {/* Image Gallery */}
              <div className="grid grid-cols-1 gap-6 mt-6">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`group relative flex flex-col md:flex-row bg-white rounded-xl overflow-hidden border-2 transition-all shadow-sm ${formData.primaryImage === img.url ||
                      (!formData.primaryImage && index === 0)
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-gray-100 hover:border-blue-300"
                      }`}
                  >
                    {/* Image Preview */}
                    <div className="relative w-full md:w-1/3 aspect-video md:aspect-auto">
                      <img
                        src={img.url}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(img.url)}
                          className={`p-2 rounded-lg transition-colors ${formData.primaryImage === img.url || (!formData.primaryImage && index === 0) ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-gray-100"}`}
                          title="Set as Primary"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                          title="Remove Image"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      {(formData.primaryImage === img.url ||
                        (!formData.primaryImage && index === 0)) && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                            Primary
                          </div>
                        )}
                    </div>

                    {/* Per-image fields (only for carousel) */}
                    {currentPlacement?.showPerImageFields && (
                      <div className="flex-1 p-4 bg-gray-50 flex flex-col justify-center space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Slide Title
                          </label>
                          <input
                            type="text"
                            value={img.title || ""}
                            onChange={(e) =>
                              handleImageFieldChange(index, "title", e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="e.g., Discover Sparkle"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Slide Subtitle
                          </label>
                          <input
                            type="text"
                            value={img.subtitle || ""}
                            onChange={(e) =>
                              handleImageFieldChange(index, "subtitle", e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="e.g., With Style"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Slide Description
                          </label>
                          <textarea
                            value={img.description || ""}
                            onChange={(e) =>
                              handleImageFieldChange(index, "description", e.target.value)
                            }
                            rows="2"
                            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Text shown on this carousel slide"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Promo (only for promotional banners) */}
          {currentPlacement?.showPromo && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Promotion Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                    placeholder="e.g., SAVE20"
                    maxLength="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Flash Sale Settings */}
          {placement === "homepage_flash_sale" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Flash Sale Settings
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Pin a specific product to show in this flash sale, and optionally attach a promo code.
              </p>

              {/* Featured Product */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Product
                </label>
                {featuredProductId ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{selectedProductDisplay}</p>
                      <p className="text-xs text-gray-500 mt-0.5">This product will be shown in the flash sale</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearProduct}
                      className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium ml-4 flex-shrink-0"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={handleProductSearch}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search product by name..."
                    />
                    {productSearchLoading && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                    {productSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                        {productSearchResults.map((product) => (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => selectProduct(product)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">₹{product.sellingPrice?.toLocaleString("en-IN")}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <p className="mt-1.5 text-xs text-gray-400">
                  Leave blank to auto-show the first on-sale product.
                </p>
              </div>

              {/* Promo Code for Flash Sale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                {promoCodes.length > 0 && (
                  <div className="mb-3">
                    <select
                      onChange={handlePromoCodeSelect}
                      defaultValue=""
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">— Select existing promo code —</option>
                      {promoCodes.map((pc) => (
                        <option key={pc._id} value={pc._id}>
                          {pc.code} ({pc.discountPercentage}% off)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="promoCode"
                      value={formData.promoCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                      placeholder="e.g., FLASH20"
                      maxLength="20"
                    />
                    <p className="mt-1 text-xs text-gray-400">Code shown on the flash sale card</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 20"
                    />
                    <p className="mt-1 text-xs text-gray-400">Discount %</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Link & Scheduling */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Link & Scheduling
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Type
                </label>
                <select
                  name="linkType"
                  value={formData.linkType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">No Link</option>
                  <option value="product">Product</option>
                  <option value="category">Category</option>
                  <option value="collection">Collection</option>
                  <option value="url">Custom URL</option>
                </select>
              </div>

              {formData.linkType !== "none" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Target *
                  </label>
                  <input
                    type="text"
                    name="linkTarget"
                    value={formData.linkTarget}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.linkTarget ? "border-red-500" : "border-gray-300"}`}
                    placeholder={
                      formData.linkType === "url"
                        ? "https://example.com"
                        : "Enter ID"
                    }
                  />
                  {errors.linkTarget && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.linkTarget}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                  {placement === "homepage_flash_sale" && (
                    <span className="text-blue-600 font-normal ml-1">(Used for countdown timer)</span>
                  )}
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for no end date
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/banners")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center ${loading || uploading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
                }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </>
              ) : (
                "Create Banner"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBanner;
