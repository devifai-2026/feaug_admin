import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  TagIcon,
  CubeIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import productApi from "../../api/product.api";

const decodeHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
};

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageGallery, setImageGallery] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [restockNote, setRestockNote] = useState("");
  const [restockLoading, setRestockLoading] = useState(false);

  useEffect(() => {
    loadProduct();
    generateSalesData();
    generateStockHistory();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await productApi.getProduct(id);

      if (response && response.data && response.data.product) {
        const foundProduct = response.data.product;
        // Transform API product to match component state structure if necessary
        // or just use it directly if keys match.
        // Backend returns: name, category (obj or string), sellingPrice, stockQuantity, etc.

        // We might need to map some fields to match the UI expectations if they differ
        const mappedProduct = {
          ...foundProduct,
          price: `₹${foundProduct.sellingPrice}`,
          basePrice: foundProduct.basePrice
            ? `₹${foundProduct.basePrice}`
            : null,
          cost: foundProduct.basePrice ? `₹${foundProduct.basePrice}` : null,
          stock: foundProduct.stockQuantity,
          minStock: foundProduct.lowStockThreshold || 10,
          status:
            foundProduct.stockQuantity === 0
              ? "Out of Stock"
              : foundProduct.stockQuantity <=
                (foundProduct.lowStockThreshold || 10)
                ? "Low Stock"
                : "In Stock",
          category:
            foundProduct.category?.name ||
            foundProduct.category ||
            "Uncategorized",
          subCategory:
            foundProduct.subCategory?.name || foundProduct.subCategory || "N/A",
          margin:
            foundProduct.basePrice && foundProduct.sellingPrice
              ? `${Math.round(((foundProduct.sellingPrice - foundProduct.basePrice) / foundProduct.sellingPrice) * 100)}%`
              : "0%",
          dimensions: foundProduct.dimensions
            ? `${foundProduct.dimensions.length || "-"} x ${foundProduct.dimensions.width || "-"} x ${foundProduct.dimensions.height || "-"} cm`
            : "N/A",
        };

        setProduct(mappedProduct);

        // Set image gallery
        if (foundProduct.images && foundProduct.images.length > 0) {
          // Extract URLs from image objects
          const urls = foundProduct.images.map((img) => img.url);
          setImageGallery(urls);

          const primaryIndex = foundProduct.images.findIndex(
            (img) => img.isPrimary,
          );
          if (primaryIndex !== -1) setSelectedImage(primaryIndex);
        } else if (foundProduct.image) {
          setImageGallery([foundProduct.image]); // Legacy support if applicable
        } else {
          setImageGallery([]);
        }
      } else {
        navigate("/products");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const generateSalesData = () => {
    const data = [
      { month: "Jan", sales: 45 },
      { month: "Feb", sales: 52 },
      { month: "Mar", sales: 38 },
      { month: "Apr", sales: 61 },
      { month: "May", sales: 55 },
      { month: "Jun", sales: 48 },
    ];
    setSalesData(data);
  };

  const generateStockHistory = () => {
    const history = [
      { date: "2024-01-15", action: "Added", quantity: 100, user: "Admin" },
      { date: "2024-02-10", action: "Sold", quantity: -25, user: "System" },
      { date: "2024-02-28", action: "Sold", quantity: -18, user: "System" },
      { date: "2024-03-05", action: "Restocked", quantity: 30, user: "Admin" },
      { date: "2024-03-10", action: "Sold", quantity: -20, user: "System" },
    ];
    setStockHistory(history);
  };



  const handleRestock = async () => {
    const qty = parseInt(restockQuantity);
    if (!qty || qty <= 0) return;

    setRestockLoading(true);
    try {
      await productApi.restockProduct(product._id || product.id, qty, restockNote.trim());

      const newStock = product.stock + qty;
      setProduct((prev) => ({
        ...prev,
        stock: newStock,
        status:
          newStock === 0
            ? "Out of Stock"
            : newStock <= prev.minStock
            ? "Low Stock"
            : "In Stock",
      }));

      // Prepend to stock history
      const newEntry = {
        date: new Date().toISOString().split("T")[0],
        action: "Restocked",
        quantity: qty,
        user: "Admin",
      };
      setStockHistory((prev) => [newEntry, ...prev]);

      setShowRestockModal(false);
      setRestockQuantity("");
      setRestockNote("");
    } catch (error) {
      console.error("Error restocking product:", error);
      showToast("error", error?.response?.data?.message || "Failed to restock. Please try again.");
    } finally {
      setRestockLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="h-full">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h2>
        <Link
          to="/products"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header with Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-gray-700">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-gray-700">
              Products
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">
              {product.name}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Details
              </h1>
              <p className="text-gray-600">
                View and analyze product performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/products"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Products
              </Link>

              {product.isFeatured && (
                <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full font-medium">
                  Featured
                </span>
              )}
              {product.isNewArrival && (
                <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full font-medium">
                  New Arrival
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-3 py-1 text-sm bg-pink-100 text-pink-800 rounded-full font-medium">
                  Bestseller
                </span>
              )}
              {!product.isActive && (
                <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full font-medium italic">
                  Hidden (Inactive)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold mt-1">
                  {product.stock} units
                </p>
              </div>
              <CubeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Min. Stock: {product.minStock || 10}
                </span>
                <span
                  className={`font-medium ${product.stock <= (product.minStock || 10)
                      ? "text-red-600"
                      : "text-green-600"
                    }`}
                >
                  {product.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${product.stock > (product.minStock || 10) * 2
                      ? "bg-green-500"
                      : product.stock > (product.minStock || 10)
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  style={{
                    width: `${Math.min((product.stock / ((product.minStock || 10) * 3)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {product.revenue || "₹0.00"}
                </p>
              </div>
              <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">
                  +12.5% from last month
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Total Sold: {product.totalSold || 0} units
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold mt-1">
                  {product.margin || "0%"}
                </p>
              </div>
              <ChartPieIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <div className="text-sm">
                <span className="text-gray-600">
                  Cost: {product.cost || "N/A"}
                </span>
                <span className="mx-2">•</span>
                <span className="text-gray-600">
                  Price: {product.price}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{
                    width: product.margin
                      ? parseFloat(product.margin) + "%"
                      : "0%",
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Rating</p>
                <p className="text-2xl font-bold mt-1">
                  {product.rating || "0.0"}/5.0
                </p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-600">
                  {product.reviews || 0} reviews
                </span>
              </div>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Image & Details */}
          <div className="lg:col-span-2">
            {/* Product Image Gallery */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Images
                </h2>
              </div>
              <div className="p-6">
                {/* Main Image Display */}
                <div className="mb-6">
                  <div className="bg-gray-100 rounded-lg overflow-hidden h-96 flex items-center justify-center">
                    {imageGallery.length > 0 ? (
                      <img
                        src={imageGallery[selectedImage]}
                        alt={`${product.name} - View ${selectedImage + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=400&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <PhotoIcon className="h-20 w-20 mx-auto text-gray-300 mb-4" />
                        <p>No image available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {imageGallery.length > 1 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {imageGallery.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="h-20 w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=150&h=150&fit=crop";
                            }}
                          />
                          {selectedImage === index && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-20"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Image Details
                      </h3>
                      <p className="text-sm text-gray-600">
                        Showing {selectedImage + 1} of {imageGallery.length}{" "}
                        images
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                    
                    
                      <span className="text-sm text-gray-500">
                        SKU: {product.sku || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Product Name
                      </label>
                      <div className="text-xl font-bold text-gray-900">
                        {product.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Short Description
                      </label>
                      <div 
                        className="text-gray-600 leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: decodeHtml(product.shortDescription || "No short description provided.") }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Full Description
                      </label>
                      <div className="relative">
                        <div
                          className={`text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 break-words ${!showFullDescription ? "max-h-60 overflow-hidden" : ""}`}
                          style={!showFullDescription ? { maxHeight: '240px', overflow: 'hidden' } : {}}
                          dangerouslySetInnerHTML={{ __html: decodeHtml(product.description || "No detailed description available.") }}
                        />
                        {!showFullDescription && (product.description?.length > 300) && (
                          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none rounded-b-xl"></div>
                        )}
                      </div>
                      {(product.description?.length > 300) && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                        >
                          {showFullDescription ? "See Less" : "See More"}
                          <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-200 ${showFullDescription ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Category
                        </label>
                        <div className="flex items-center">
                          <span className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg border border-blue-100">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Sub-Category
                        </label>
                        <div className="text-sm font-semibold text-gray-700">
                          {product.subCategory}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Material
                        </label>
                        <div className="text-sm font-bold text-gray-900 capitalize">
                          {product.material || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Purity
                        </label>
                        <div className="text-sm font-bold text-gray-900 uppercase">
                          {product.purity || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="min-w-0">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          SKU
                        </label>
                        <div className="font-mono text-sm text-gray-900 font-bold bg-gray-100 px-3 py-1.5 rounded-lg block w-full break-all">
                          {product.sku || "N/A"}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Gender
                        </label>
                        <div className="text-sm font-bold text-gray-900 capitalize italic">
                          {product.gender || "unisex"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Brand
                      </label>
                      <div className="text-sm font-bold text-gray-900">
                        {product.brand || "Unbranded"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Dimensions (L x W x H)
                        </label>
                        <div className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 inline-block">
                          {product.dimensions}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Weight
                        </label>
                        <div className="text-sm font-bold text-gray-900">
                          {product.weight ? `${product.weight} kg` : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* SEO Section */}
                    <div className="pt-6 border-t border-gray-100">
                      <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                        Search & SEO
                      </label>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            Meta Title
                          </p>
                          <p className="text-sm text-gray-700">
                            {product.metaTitle || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            Tags
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {product.tags && product.tags.length > 0 ? (
                              product.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase"
                                >
                                  #{tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                No tags
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <div className="h-2 w-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => setShowRestockModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <CubeIcon className="h-5 w-5 mr-2" />
                    Restock Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information & Alerts */}
        <div className="mt-8">

          {/* Alerts & Notifications */}
          {(product.stock <= (product.minStock || 10) ||
            product.status === "Out of Stock") && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-1">
                      {product.status === "Out of Stock"
                        ? "Out of Stock Alert"
                        : "Low Stock Alert"}
                    </h3>
                    <p className="text-red-700 mb-3">
                      {product.status === "Out of Stock"
                        ? "This product is currently out of stock. Consider restocking immediately."
                        : `Current stock (${product.stock} units) is below minimum threshold (${product.minStock || 10} units).`}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowRestockModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Restock Now
                      </button>
                      <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                        Notify Supplier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center">
                <CubeIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Restock Product</h3>
              </div>
              <button
                onClick={() => {
                  setShowRestockModal(false);
                  setRestockQuantity("");
                  setRestockNote("");
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-blue-700">Current Stock</span>
                <span className="text-lg font-bold text-blue-900">{product.stock} units</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Add <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || parseInt(v) > 0) setRestockQuantity(v);
                  }}
                  onBlur={(e) => {
                    const num = parseInt(e.target.value);
                    if (!num || num < 1) setRestockQuantity("");
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter quantity"
                  autoFocus
                />
                {restockQuantity && parseInt(restockQuantity) > 0 && (
                  <p className="mt-1.5 text-xs text-green-600 font-medium">
                    New stock will be: {product.stock + parseInt(restockQuantity)} units
                  </p>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g. Supplier delivery, manual adjustment"
                />
              </div> */}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  setShowRestockModal(false);
                  setRestockQuantity("");
                  setRestockNote("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={restockLoading || !restockQuantity || parseInt(restockQuantity) < 1}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {restockLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Restocking...
                  </>
                ) : (
                  "Confirm Restock"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ProductView;
