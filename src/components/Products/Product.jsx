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

const Products = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);

  // Dummy products that should always be available
  const dummyProducts = [
    {
      id: 1,
      name: "Wireless Headphones",
      category: "Electronics",
      price: "₹99.99",
      stock: 45,
      status: "In Stock",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop",
      isDummy: true,
    },
    {
      id: 2,
      name: "Running Shoes",
      category: "Sports",
      price: "₹129.99",
      stock: 23,
      status: "Low Stock",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop",
      isDummy: true,
    },
    {
      id: 3,
      name: "Coffee Maker",
      category: "Home & Kitchen",
      price: "₹79.99",
      stock: 0,
      status: "Out of Stock",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150&h=150&fit=crop",
      isDummy: true,
    },
    {
      id: 4,
      name: "Smart Watch",
      category: "Electronics",
      price: "₹199.99",
      stock: 67,
      status: "In Stock",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop",
      isDummy: true,
    },
    {
      id: 5,
      name: "Backpack",
      category: "Fashion",
      price: "₹49.99",
      stock: 89,
      status: "In Stock",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop",
      isDummy: true,
    },
    {
      id: 6,
      name: "Desk Lamp",
      category: "Home & Office",
      price: "₹34.99",
      stock: 12,
      status: "Low Stock",
      image:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150&h=150&fit=crop",
      isDummy: true,
    },
  ];

  // Load products from localStorage
  useEffect(() => {
    loadProductsFromStorage();
  }, []);

  const loadProductsFromStorage = () => {
    try {
      const savedProducts = JSON.parse(
        localStorage.getItem("products") || "[]"
      );

      // Filter out any dummy products that might have been saved previously
      const userProducts = savedProducts.filter((product) => !product.isDummy);

      // Combine dummy products with user's products (dummy first, then user's)
      const allProducts = [...dummyProducts, ...userProducts];

      setProducts(allProducts);

      // Only save if we need to initialize or update
      if (savedProducts.length === 0) {
        localStorage.setItem("products", JSON.stringify(userProducts));
      }
    } catch (error) {
      console.error("Error loading products:", error);
      // If error, just show dummy products
      setProducts(dummyProducts);
    }
  };

  // Save only user products to localStorage whenever products change
  useEffect(() => {
    if (products.length > 0) {
      // Filter out dummy products before saving
      const userProducts = products.filter((product) => !product.isDummy);
      localStorage.setItem("products", JSON.stringify(userProducts));
    }
  }, [products]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const productToDelete = products.find((p) => p.id === id);

      // Prevent deletion of dummy products
      if (productToDelete?.isDummy) {
        alert(
          "Cannot delete demo products. Add your own products to manage them."
        );
        return;
      }

      const updatedProducts = products.filter((product) => product.id !== id);
      setProducts(updatedProducts);
    }
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

        <main
          className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${
            sidebarOpen ? "lg:pl-6" : "lg:pl-6"
          }`}
        >
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
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home & Kitchen</option>
              </select>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FunnelIcon className="h-5 w-5 mr-2" />
                More Filters
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </button>
            </div>

            {/* Products Table */}
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
                          className={`hover:bg-gray-50 ${
                            product.isDummy ? "border-l-4 border-blue-500" : ""
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
                                    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=150&h=150&fit=crop";
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
                                  ID: #{product.id.toString().padStart(3, "0")}
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
                                  className={`h-2 rounded-full ${
                                    product.stock > 50
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
                              className={`px-3 py-1 text-xs rounded-full ${
                                product.status === "In Stock"
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
                                className={`p-1 ${
                                  product.isDummy
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
                                className={`p-1 ${
                                  product.isDummy
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
                <span className="font-medium">{products.length}</span> products
                <span className="ml-2 text-gray-500">
                  ({products.filter((p) => !p.isDummy).length} user-added)
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled
                >
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  1
                </button>
                {products.length > 10 && (
                  <>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                      3
                    </button>
                  </>
                )}
                <button
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={products.length <= 10}
                >
                  Next
                </button>
              </div>
            </div>

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