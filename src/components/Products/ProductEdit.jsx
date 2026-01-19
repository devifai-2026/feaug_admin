import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CheckIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '10',
    description: '',
    brand: '',
    sku: '',
    supplier: '',
    supplierContact: '',
    weight: '',
    dimensions: '',
    location: '',
    features: [],
    image: '',
    images: []
  });
  const [newFeature, setNewFeature] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Categories for dropdown
  const categories = [
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Sports',
    'Home & Office',
    'Beauty',
    'Books',
    'Toys',
    'Automotive',
    'Health'
  ];

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = () => {
    setLoading(true);
    try {
      const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Dummy products for reference
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
          images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop'
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
          images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop'
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
          images: [
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e7?w=300&h=300&fit=crop'
          ]
        },
        { 
          id: 4, 
          name: 'Smart Watch', 
          category: 'Electronics', 
          price: '₹199.99', 
          cost: '₹95.00',
          stock: 67, 
          minStock: 20,
          status: 'In Stock', 
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
          description: 'Advanced smartwatch with health monitoring and GPS tracking.',
          brand: 'TechWear',
          sku: 'TW-SW450',
          supplier: 'Gadget World Inc.',
          supplierContact: 'orders@gadgetworld.com',
          rating: 4.8,
          reviews: 342,
          weight: '0.3 kg',
          dimensions: '4 x 4 x 1 cm',
          location: 'Warehouse C, Shelf 3',
          features: ['Heart rate monitor', 'GPS tracking', 'Water resistant', '7-day battery'],
          isDummy: true,
          images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1579586337278-3fdsa6fdf0f4?w=300&h=300&fit=crop'
          ]
        },
        { 
          id: 5, 
          name: 'Backpack', 
          category: 'Fashion', 
          price: '₹49.99', 
          cost: '₹22.00',
          stock: 89, 
          minStock: 25,
          status: 'In Stock', 
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop',
          description: 'Durable backpack with laptop compartment and USB charging port.',
          brand: 'UrbanPack',
          sku: 'UP-BK100',
          supplier: 'Fashion Accessories Co.',
          supplierContact: 'info@fashionacc.com',
          rating: 4.3,
          reviews: 167,
          weight: '0.9 kg',
          dimensions: '45 x 30 x 15 cm',
          location: 'Warehouse B, Shelf 15',
          features: ['Laptop compartment', 'USB port', 'Water resistant', 'Multiple pockets'],
          isDummy: true,
          images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop'
          ]
        },
        { 
          id: 6, 
          name: 'Desk Lamp', 
          category: 'Home & Office', 
          price: '₹34.99', 
          cost: '₹15.00',
          stock: 12, 
          minStock: 8,
          status: 'Low Stock', 
          image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop',
          description: 'Adjustable LED desk lamp with touch controls and multiple brightness levels.',
          brand: 'BrightWorks',
          sku: 'BW-DL250',
          supplier: 'Office Supplies Inc.',
          supplierContact: 'support@officesupplies.com',
          rating: 4.6,
          reviews: 94,
          weight: '1.2 kg',
          dimensions: '35 x 20 x 10 cm',
          location: 'Warehouse A, Shelf 20',
          features: ['Adjustable brightness', 'Touch controls', 'USB charging', 'Eye-care technology'],
          isDummy: true,
          images: [
            'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=300&h=300&fit=crop'
          ]
        },
      ];

      const userProducts = savedProducts.filter(p => !p.isDummy);
      const allProducts = [...dummyProducts, ...userProducts];
      
      const foundProduct = allProducts.find(p => p.id.toString() === id);
      
      if (foundProduct) {
        if (foundProduct.isDummy) {
          alert('Cannot edit demo products. You will be redirected to add a new product instead.');
          navigate('/products/add');
          return;
        }
        
        setProduct(foundProduct);
        // Populate form data
        setFormData({
          name: foundProduct.name || '',
          category: foundProduct.category || '',
          price: foundProduct.price ? foundProduct.price.replace('₹', '') : '',
          cost: foundProduct.cost ? foundProduct.cost.replace('₹', '') : '',
          stock: foundProduct.stock?.toString() || '',
          minStock: foundProduct.minStock?.toString() || '10',
          description: foundProduct.description || '',
          brand: foundProduct.brand || '',
          sku: foundProduct.sku || '',
          supplier: foundProduct.supplier || '',
          supplierContact: foundProduct.supplierContact || '',
          weight: foundProduct.weight || '',
          dimensions: foundProduct.dimensions || '',
          location: foundProduct.location || '',
          features: foundProduct.features || [],
          image: foundProduct.image || '',
          images: foundProduct.images || [foundProduct.image]
        });
        
        setImageUrls(foundProduct.images || [foundProduct.image]);
      } else {
        alert('Product not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Error loading product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && isValidUrl(newImageUrl)) {
      setImageUrls(prev => [...prev, newImageUrl.trim()]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    } else {
      alert('Please enter a valid URL');
    }
  };

  const handleRemoveImage = (index) => {
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
    setFormData(prev => ({
      ...prev,
      images: newImageUrls
    }));
  };

  const handleSetPrimaryImage = (index) => {
    const primaryImage = imageUrls[index];
    setFormData(prev => ({
      ...prev,
      image: primaryImage
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.price || !formData.stock) {
        alert('Please fill in all required fields (Name, Category, Price, Stock)');
        setSaving(false);
        return;
      }

      // Format price and cost
      const formattedPrice = formData.price.startsWith('₹') ? formData.price : `₹${formData.price}`;
      const formattedCost = formData.cost ? (formData.cost.startsWith('₹') ? formData.cost : `₹${formData.cost}`) : '';

      // Calculate status based on stock
      const stockNum = parseInt(formData.stock) || 0;
      const minStockNum = parseInt(formData.minStock) || 10;
      const status = stockNum === 0 ? 'Out of Stock' : 
                    stockNum <= minStockNum ? 'Low Stock' : 'In Stock';

      // Get existing products
      const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Find and update the product
      const updatedProducts = savedProducts.map(p => {
        if (p.id === product.id) {
          return {
            ...p,
            name: formData.name,
            category: formData.category,
            price: formattedPrice,
            cost: formattedCost,
            stock: stockNum,
            minStock: minStockNum,
            status: status,
            description: formData.description,
            brand: formData.brand,
            sku: formData.sku,
            supplier: formData.supplier,
            supplierContact: formData.supplierContact,
            weight: formData.weight,
            dimensions: formData.dimensions,
            location: formData.location,
            features: formData.features,
            image: formData.image || imageUrls[0] || '',
            images: formData.images,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      });

      // Save to localStorage
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      // Show success message
      alert('Product updated successfully!');
      
      // Redirect to product view
      navigate(`/products/view/${product.id}`);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedProducts = savedProducts.filter(p => p.id !== product.id);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        
        alert('Product deleted successfully!');
        navigate('/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
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
              <div className="text-gray-500">Loading product data...</div>
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
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-gray-700">Dashboard</Link>
                    <span className="mx-2">/</span>
                    <Link to="/products" className="hover:text-gray-700">Products</Link>
                    <span className="mx-2">/</span>
                    <Link to={`/products/view/${product.id}`} className="hover:text-gray-700">{product.name}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Edit</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                  <p className="text-gray-600">Update product information and details</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link 
                    to={`/products/view/${product.id}`}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Cancel
                  </Link>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          name="cost"
                          value={formData.cost}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Stock Level
                      </label>
                      <input
                        type="number"
                        name="minStock"
                        value={formData.minStock}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Alert when stock falls below this level
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Contact
                      </label>
                      <input
                        type="email"
                        name="supplierContact"
                        value={formData.supplierContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight
                      </label>
                      <input
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="e.g., 0.5 kg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleInputChange}
                        placeholder="e.g., 18 x 15 x 8 cm"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warehouse Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Warehouse A, Shelf 12"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Features Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Features</h2>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add a feature"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <PlusIcon className="h-5 w-5 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                  
                  {formData.features.length > 0 ? (
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mr-3"></div>
                            <span>{feature}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No features added yet. Add some features to describe your product.
                    </div>
                  )}
                </div>
              </div>

              {/* Images Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex-shrink-0">
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="h-10 w-10 rounded-lg object-cover border border-gray-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=150&h=150&fit=crop';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg border border-gray-300 flex items-center justify-center">
                            <PhotoIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Image URLs
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image2.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <PlusIcon className="h-5 w-5 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                  
                  {imageUrls.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product image ${index + 1}`}
                            className="h-32 w-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop';
                            }}
                          />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {formData.image === url && (
                              <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Primary</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(index)}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Set Primary
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <PhotoIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p>No additional images added yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <TrashIcon className="h-5 w-5 mr-2" />
                      Delete Product
                    </button>
                   
                  </div>
                  
                  <div className="flex gap-3">
                    <Link
                      to={`/products/view/${product.id}`}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductEdit;