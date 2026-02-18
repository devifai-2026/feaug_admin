import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import productApi from "../../api/product.api";
import categoryApi from "../../api/categories.api";

const Products = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [categoriesList, setCategoriesList] = useState([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState("all");

  // Fetch categories on mount
  useEffect(() => {
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

  // Load products from API
  useEffect(() => {
    fetchProducts();
  }, [pagination.page, searchQuery, selectedCategory, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;

      // Handle stock filter
      if (stockFilter === "out_of_stock") {
        params.stockQuantity = 0;
      } else if (stockFilter === "low_stock") {
        params["stockQuantity[lt]"] = 20;
        params["stockQuantity[gt]"] = 0;
      } else if (stockFilter === "in_stock") {
        params["stockQuantity[gte]"] = 20;
      }

      const response = await productApi.getAllProducts(params);

      if (response.status === "success" && response.data) {
        // Transform API products to match component format
        const apiProducts = (response.data.products || []).map((product) => ({
          id: product._id,
          name: product.name,
          category: product.category?.name || "Uncategorized",
          price: `₹${product.sellingPrice || product.basePrice || 0}`,
          stock: product.stockQuantity || 0,
          status:
            product.stockQuantity === 0
              ? "Out of Stock"
              : product.stockQuantity < 20
                ? "Low Stock"
                : "In Stock",
          image:
            product.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150&h=150&fit=crop",
          sku: product.sku,
          isDummy: false,
        }));

        setProducts(apiProducts);

        setPagination((prev) => ({
          ...prev,
          total: response.total || response.results || apiProducts.length,
          totalPages: Math.ceil(
            (response.total || apiProducts.length) / pagination.limit,
          ),
        }));
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products from server");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Also keep localStorage sync for user-added products (backwards compatibility)
  useEffect(() => {
    if (products.length > 0) {
      const userProducts = products.filter((product) => !product.isDummy);
      localStorage.setItem("products", JSON.stringify(userProducts));
    }
  }, [products]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const productToDelete = products.find((p) => p.id === id);

      // Prevent deletion of dummy products
      if (productToDelete?.isDummy) {
        alert(
          "Cannot delete demo products. Add your own products to manage them.",
        );
        return;
      }

      try {
        await productApi.deleteProduct(id);
        const updatedProducts = products.filter((product) => product.id !== id);
        setProducts(updatedProducts);
      } catch (err) {
        console.error("Error deleting product:", err);
        alert(
          err.response?.data?.message ||
          "Failed to delete product. Please try again.",
        );
      }
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Calculate average price (excluding dummy products if desired)
  const calculateAveragePrice = () => {
    // Option 2: Calculate only for user-added products (excluding dummies)
    const userProducts = products.filter((p) => !p.isDummy);
    const productsToCalculate =
      userProducts.length > 0 ? userProducts : products;

    if (productsToCalculate.length === 0) return "0.00";

    const total = productsToCalculate.reduce((sum, p) => {
      const price = parseFloat(p.price.replace("₹", "")) || 0;
      return sum + price;
    }, 0);
    return (total / productsToCalculate.length).toFixed(2);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                  <p className="text-gray-600">
                    Manage your products inventory
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                      Blue border indicates demo products
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/products/add"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Product
                  </Link>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={handleCategoryFilter}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="relative">
                <button
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${showMoreFilters ? "bg-gray-100 ring-2 ring-blue-500" : ""}`}
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  More Filters
                  <ChevronDownIcon
                    className={`h-4 w-4 ml-2 transition-transform duration-200 ${showMoreFilters ? "rotate-180" : ""}`}
                  />
                </button>

                {showMoreFilters && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Filter by Stock
                    </h3>
                    <div className="space-y-2">
                      {["all", "in_stock", "low_stock", "out_of_stock"].map(
                        (option) => (
                          <label
                            key={option}
                            className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors text-sm"
                          >
                            <input
                              type="radio"
                              name="stockFilter"
                              value={option}
                              checked={stockFilter === option}
                              onChange={(e) => {
                                setStockFilter(e.target.value);
                                setPagination((prev) => ({ ...prev, page: 1 }));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 capitalize">
                              {option.replace("_", " ")}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => {
                          setStockFilter("all");
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Reset All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="mt-2 text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Products Table */}
            {!loading && (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center">
                              <div className="text-gray-500">
                                No products found. Click "Add Product" to get
                                started.
                              </div>
                            </td>
                          </tr>
                        ) : (
                          products.map((product) => (
                            <tr
                              key={product.id}
                              className={`hover:bg-gray-50 ${product.isDummy
                                  ? "border-l-4 border-blue-500"
                                  : ""
                                }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img
                                    className="h-10 w-10 rounded-lg object-cover"
                                    src={product.image}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150&h=150&fit=crop";
                                    }}
                                  />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {product.name}
                                      {product.isDummy && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                          Demo
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      SKU: {product.sku || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  {product.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {product.price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${product.stock > 50
                                          ? "bg-green-500"
                                          : product.stock > 20
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        }`}
                                      style={{
                                        width: `${Math.min(product.stock, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="ml-3 text-sm text-gray-600">
                                    {product.stock} units
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 text-xs rounded-full ${product.status === "In Stock"
                                      ? "bg-green-100 text-green-800"
                                      : product.status === "Low Stock"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {product.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Link
                                    to={`/products/view/${product.id}`}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="View"
                                  >
                                    <EyeIcon className="h-5 w-5" />
                                  </Link>
                                  <Link
                                    to={`/products/edit/${product.id}`}
                                    className={`p-1 ${product.isDummy
                                        ? "text-gray-400 cursor-not-allowed pointer-events-none"
                                        : "text-green-600 hover:text-green-800"
                                      }`}
                                    title={
                                      product.isDummy
                                        ? "Cannot edit demo products"
                                        : "Edit"
                                    }
                                  >
                                    <PencilIcon className="h-5 w-5" />
                                  </Link>
                                  <button
                                    className={`p-1 ${product.isDummy
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-red-600 hover:text-red-800"
                                      }`}
                                    title={
                                      product.isDummy
                                        ? "Cannot delete demo products"
                                        : "Delete"
                                    }
                                    onClick={
                                      product.isDummy
                                        ? undefined
                                        : () => deleteProduct(product.id)
                                    }
                                    disabled={product.isDummy}
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{products.length}</span> of{" "}
                    <span className="font-medium">{pagination.total}</span>{" "}
                    products
                    <span className="ml-2 text-gray-500">
                      ({products.length} products from API)
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(pagination.totalPages, 3))].map(
                      (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-3 py-1 rounded-lg ${pagination.page === i + 1
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                          {i + 1}
                        </button>
                      ),
                    )}
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">Total Products</div>
                <div className="text-2xl font-bold mt-2">{products.length}</div>
                <div className="text-sm text-green-600 mt-1">
                  +12% from last month
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">Out of Stock</div>
                <div className="text-2xl font-bold mt-2">
                  {products.filter((p) => p.status === "Out of Stock").length}
                </div>
                <div className="text-sm text-red-600 mt-1">
                  -2 from last week
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">Low Stock</div>
                <div className="text-2xl font-bold mt-2">
                  {products.filter((p) => p.status === "Low Stock").length}
                </div>
                <div className="text-sm text-yellow-600 mt-1">
                  Need attention
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">Avg. Price</div>
                <div className="text-2xl font-bold mt-2">
                  ₹{calculateAveragePrice()}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  +5.2% from last month
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;
