import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  PhotoIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const loadProduct = () => {
    setLoading(true);
    try {
      const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
      
      const dummyProducts = [
        { 
          id: 1, 
          name: 'Wireless Headphones', 
          category: 'Electronics', 
          price: '₹99.99', 
          cost: '₹45.00',
          stock: 45, 
          minStock: 10,
          status: 'In Stock', 
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
          description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
          brand: 'SoundMax',
          sku: 'SM-WH001',
          supplier: 'Tech Suppliers Inc.',
          supplierContact: 'supplier@tech.com',
          rating: 4.5,
          reviews: 128,
          weight: '0.5 kg',
          dimensions: '18 x 15 x 8 cm',
          location: 'Warehouse A, Shelf 12',
          features: ['Noise Cancelling', 'Bluetooth 5.0', '30-hour battery', 'Water resistant'],
          isDummy: true,
          createdAt: '2024-01-15',
          lastRestocked: '2024-03-10',
          totalSold: 245,
          revenue: '₹24,497.55',
          margin: '55%',
          images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop'
          ]
        },
        { 
          id: 2, 
          name: 'Running Shoes', 
          category: 'Sports', 
          price: '₹129.99', 
          cost: '₹65.00',
          stock: 23, 
          minStock: 15,
          status: 'Low Stock', 
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
          description: 'Lightweight running shoes with enhanced cushioning for maximum comfort.',
          brand: 'RunPro',
          sku: 'RP-RS202',
          supplier: 'Sport Gear Co.',
          supplierContact: 'contact@sportgear.com',
          rating: 4.2,
          reviews: 89,
          weight: '0.8 kg',
          dimensions: '30 x 20 x 12 cm',
          location: 'Warehouse B, Shelf 5',
          features: ['Breathable mesh', 'Shock absorption', 'Non-slip sole', 'Lightweight'],
          isDummy: true,
          createdAt: '2024-02-10',
          lastRestocked: '2024-03-05',
          totalSold: 189,
          revenue: '₹24,568.11',
          margin: '50%',
          images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&h=300&fit=crop'
          ]
        },
        { 
          id: 3, 
          name: 'Coffee Maker', 
          category: 'Home & Kitchen', 
          price: '₹79.99', 
          cost: '₹35.00',
          stock: 0, 
          minStock: 5,
          status: 'Out of Stock', 
          image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
          description: 'Programmable coffee maker with thermal carafe and built-in grinder.',
          brand: 'BrewMaster',
          sku: 'BM-CM300',
          supplier: 'Home Appliances Ltd.',
          supplierContact: 'sales@homeappliances.com',
          rating: 4.7,
          reviews: 256,
          weight: '3.2 kg',
          dimensions: '25 x 35 x 30 cm',
          location: 'Warehouse A, Shelf 8',
          features: ['Programmable', 'Built-in grinder', 'Thermal carafe', '24-hour timer'],
          isDummy: true,
          createdAt: '2024-01-20',
          lastRestocked: '2024-02-28',
          totalSold: 156,
          revenue: '₹12,478.44',
          margin: '56%',
          images: [
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e7?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1518834103326-9fd4c5fff6d1?w=300&h=300&fit=crop'
          ]
        },
        // ... rest of the dummy products with images arrays
      ];

      const userProducts = savedProducts.filter(p => !p.isDummy);
      const allProducts = [...dummyProducts, ...userProducts];
      
      const foundProduct = allProducts.find(p => p.id.toString() === id);
      
      if (foundProduct) {
        setProduct(foundProduct);
        // Set image gallery
        if (foundProduct.images && foundProduct.images.length > 0) {
          setImageGallery(foundProduct.images);
        } else {
          // Create gallery from single image
          setImageGallery([foundProduct.image]);
        }
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const generateSalesData = () => {
    const data = [
      { month: 'Jan', sales: 45 },
      { month: 'Feb', sales: 52 },
      { month: 'Mar', sales: 38 },
      { month: 'Apr', sales: 61 },
      { month: 'May', sales: 55 },
      { month: 'Jun', sales: 48 },
    ];
    setSalesData(data);
  };

  const generateStockHistory = () => {
    const history = [
      { date: '2024-01-15', action: 'Added', quantity: 100, user: 'Admin' },
      { date: '2024-02-10', action: 'Sold', quantity: -25, user: 'System' },
      { date: '2024-02-28', action: 'Sold', quantity: -18, user: 'System' },
      { date: '2024-03-05', action: 'Restocked', quantity: 30, user: 'Admin' },
      { date: '2024-03-10', action: 'Sold', quantity: -20, user: 'System' },
    ];
    setStockHistory(history);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const restockProduct = () => {
    const quantity = prompt('Enter quantity to restock:', '50');
    if (quantity && !isNaN(quantity)) {
      const updatedProduct = {
        ...product,
        stock: product.stock + parseInt(quantity),
        status: product.stock + parseInt(quantity) > product.minStock ? 'In Stock' : 'Low Stock'
      };
      setProduct(updatedProduct);
      
      // In a real app, you would update localStorage here
      alert(`Restocked ${quantity} units successfully.`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading product details...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
              <Link to="/products" className="text-blue-600 hover:text-blue-800">
                ← Back to Products
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-6' : 'lg:pl-6'}`}>
          <div className="mx-auto max-w-7xl">
            {/* Header with Breadcrumbs */}
            <div className="mb-6">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Link to="/" className="hover:text-gray-700">Dashboard</Link>
                <span className="mx-2">/</span>
                <Link to="/products" className="hover:text-gray-700">Products</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{product.name}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
                  <p className="text-gray-600">View and analyze product performance</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/products" 
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Products
                  </Link>
                  
                  {product.isDummy && (
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      Demo Product
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
                    <p className="text-2xl font-bold mt-1">{product.stock} units</p>
                  </div>
                  <CubeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Min. Stock: {product.minStock || 10}</span>
                    <span className={`font-medium ${
                      product.stock <= (product.minStock || 10) ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        product.stock > (product.minStock || 10) * 2 ? 'bg-green-500' : 
                        product.stock > (product.minStock || 10) ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((product.stock / ((product.minStock || 10) * 3)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1">{product.revenue || '₹0.00'}</p>
                  </div>
                  <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+12.5% from last month</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">Total Sold: {product.totalSold || 0} units</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Profit Margin</p>
                    <p className="text-2xl font-bold mt-1">{product.margin || '0%'}</p>
                  </div>
                  <ChartPieIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Cost: {product.cost || 'N/A'}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-600">Price: {product.price}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: product.margin ? parseFloat(product.margin) + '%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Customer Rating</p>
                    <p className="text-2xl font-bold mt-1">{product.rating || '0.0'}/5.0</p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">{product.reviews || 0} reviews</span>
                  </div>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
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
                    <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
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
                              e.target.src = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=400&fit=crop';
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
                              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImage === index 
                                  ? 'border-blue-500 ring-2 ring-blue-200' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img 
                                src={img} 
                                alt={`Thumbnail ${index + 1}`}
                                className="h-20 w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=150&h=150&fit=crop';
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
                          <h3 className="font-medium text-gray-900">Image Details</h3>
                          <p className="text-sm text-gray-600">
                            Showing {selectedImage + 1} of {imageGallery.length} images
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">ID: {product.id}</span>
                          <span className="text-sm text-gray-500">|</span>
                          <span className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Information Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                          <div className="text-lg font-semibold">{product.name}</div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <div className="text-gray-600">{product.description || 'No description available.'}</div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <div className="flex items-center">
                            <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {product.category}
                            </span>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                          <div className="flex items-center">
                            <span className="text-gray-600">{product.brand || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                          <div className="font-mono text-gray-900">{product.sku || `PROD-${product.id.toString().padStart(5, '0')}`}</div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <div className="flex items-center">
                            <CubeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">{product.location || 'Not specified'}</span>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                          <div className="text-gray-600">{product.dimensions || 'N/A'}</div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                          <div className="text-gray-600">{product.weight || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
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
                {/* Sales Performance Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
                      <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                        <option>Last 6 months</option>
                        <option>Last 3 months</option>
                        <option>Last month</option>
                        <option>This year</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm text-gray-600">Average Monthly Sales</p>
                        <p className="text-2xl font-bold">48 units</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-green-600">
                          <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                          <span>+15.2% growth</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Compared to last period</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {salesData.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-16 text-sm text-gray-600">{item.month}</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className="h-4 rounded-full bg-blue-500"
                                style={{ width: `${(item.sales / 70) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-16 text-right text-sm font-medium">{item.sales} units</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Supplier Information Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Supplier Information</h2>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                      <div className="text-gray-900 font-medium">{product.supplier || 'Not specified'}</div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                      <div className="text-gray-600">{product.supplierContact || 'N/A'}</div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time</label>
                      <div className="text-gray-600">5-7 business days</div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                      View Supplier Details
                    </button>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
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
                  <h2 className="text-lg font-semibold text-gray-900">Stock History</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stockHistory.map((item, index) => {
                          const balance = stockHistory
                            .slice(0, index + 1)
                            .reduce((sum, hist) => sum + hist.quantity, 0);
                          
                          return (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.action === 'Sold' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {item.action}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">
                                <span className={item.action === 'Sold' ? 'text-red-600' : 'text-green-600'}>
                                  {item.action === 'Sold' ? '-' : '+'}{Math.abs(item.quantity)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{item.user}</td>
                              <td className="px-4 py-3 text-sm font-medium">{balance} units</td>
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
              {(product.stock <= (product.minStock || 10) || product.status === 'Out of Stock') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-800 mb-1">
                        {product.status === 'Out of Stock' ? 'Out of Stock Alert' : 'Low Stock Alert'}
                      </h3>
                      <p className="text-red-700 mb-3">
                        {product.status === 'Out of Stock' 
                          ? 'This product is currently out of stock. Consider restocking immediately.'
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
        </main>
      </div>
    </div>
  );
};

export default ProductView;