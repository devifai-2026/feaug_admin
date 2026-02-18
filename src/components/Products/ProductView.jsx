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
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import productApi from "../../api/product.api";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageGallery, setImageGallery] = useState([]);

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



  const restockProduct = () => {
    const quantity = prompt("Enter quantity to restock:", "50");
    if (quantity && !isNaN(quantity)) {
      const updatedProduct = {
        ...product,
        stock: product.stock + parseInt(quantity),
        status:
          product.stock + parseInt(quantity) > product.minStock
            ? "In Stock"
            : "Low Stock",
      };
      setProduct(updatedProduct);

      // In a real app, you would update localStorage here
      alert(`Restocked ${quantity} units successfully.`);
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
                        ID: {product.id}
                      </span>
                      <span className="text-sm text-gray-500">|</span>
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
                        className="text-gray-600 leading-relaxed prose prose-sm max-w-none break-words"
                        dangerouslySetInnerHTML={{
                          __html:
                            product.shortDescription ||
                            "No short description provided.",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Full Description
                      </label>
                      <div
                        className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 prose prose-sm max-w-none break-words"
                        dangerouslySetInnerHTML={{
                          __html:
                            product.description ||
                            "<p>No detailed description available.</p>",
                        }}
                      />
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          SKU
                        </label>
                        <div className="font-mono text-sm text-gray-900 font-bold bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                          {product.sku || "N/A"}
                        </div>
                      </div>
                      <div>
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
                    onClick={restockProduct}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <CubeIcon className="h-5 w-5 mr-2" />
                    Restock Product
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                    <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                    Duplicate Product
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information & Alerts */}
        <div className="mt-8">
          {/* Stock History Card - Full Width */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Stock History
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stockHistory.map((item, index) => {
                      const balance = stockHistory
                        .slice(0, index + 1)
                        .reduce((sum, hist) => sum + hist.quantity, 0);

                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.date}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${item.action === "Sold"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                                }`}
                            >
                              {item.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <span
                              className={
                                item.action === "Sold"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              {item.action === "Sold" ? "-" : "+"}
                              {Math.abs(item.quantity)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.user}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {balance} units
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                View Full History
              </button>
            </div>
          </div>

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
                        onClick={restockProduct}
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
    </div>
  );
};

export default ProductView;
