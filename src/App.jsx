import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../src/context/AuthContext'
import PrivateRoute from './components/utils/PrivateRoute'
import Dashboard from './components/Dashboard'
import Orders from './components/Orders/Orders'
import Product from './components/Products/Product'
import Categories from './components/Categories/Categories'
import Invoices from './components/Invoices/Invoices'
import Users from './components/Users/Users'
import AddProduct from './components/Products/AddProduct'
import AddCategory from './components/Categories/AddCategory'
import ProductView from './components/Products/ProductView'
import ProductEdit from './components/Products/ProductEdit'
import InvoiceView from './components/Invoices/InvoiceView'
import UserAdd from './components/Users/UserAdd'
import UserEdit from './components/Users/UserEdit'
import MyProfile from './components/MyProfile/MyProfile'
import Login from './components/MyProfile/Login'
import OrderView from './components/Orders/OrderView'
import OrderUpdate from './components/Orders/OrderUpdate'
import EditCategory from './components/Categories/EditCategory'
import Subcategories from './components/Categories/Subcategories'
import AddSubcategory from './components/Categories/AddSubcategory'
import EditSubcategory from './components/Categories/EditSubcategory'

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public route - only accessible when not logged in */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      {/* All other routes are protected */}
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      
      <Route path="/products" element={
        <PrivateRoute>
          <Product />
        </PrivateRoute>
      } />
      
      <Route path="/products/add" element={
        <PrivateRoute>
          <AddProduct />
        </PrivateRoute>
      } />
      
      <Route path="/products/view/:id" element={
        <PrivateRoute>
          <ProductView />
        </PrivateRoute>
      } />
      
      <Route path="/products/edit/:id" element={
        <PrivateRoute>
          <ProductEdit />
        </PrivateRoute>
      } />

      <Route path="/categories/add" element={
    <PrivateRoute>
      <AddCategory />
    </PrivateRoute>
  } />
      
      <Route path="/categories" element={
        <PrivateRoute>
          <Categories />
        </PrivateRoute>
      } />

      <Route path="/categories/edit/:id" element={
        <PrivateRoute>
          <EditCategory />
        </PrivateRoute>
      } />
      <Route path="/subcategories" element={
        <PrivateRoute>
          <Subcategories />
        </PrivateRoute>
      } />
      <Route path="/subcategories/add" element={
        <PrivateRoute>
          <AddSubcategory />
        </PrivateRoute>
      } />
      
      <Route path="/subcategories/edit/:id" element={
        <PrivateRoute>
          <EditSubcategory  />
        </PrivateRoute>
      } />
      
      <Route path="/orders" element={
        <PrivateRoute>
          <Orders />
        </PrivateRoute>
      } />
      
      <Route path="/orders/view/:id" element={
        <PrivateRoute>
          <OrderView />
        </PrivateRoute>
      } />
      
      <Route path="/orders/update/:id" element={
        <PrivateRoute>
          <OrderUpdate />
        </PrivateRoute>
      } />
      
      <Route path="/invoices" element={
        <PrivateRoute>
          <Invoices />
        </PrivateRoute>
      } />
      
      <Route path="/invoices/view/:id" element={
        <PrivateRoute>
          <InvoiceView />
        </PrivateRoute>
      } />
      
      <Route path="/users" element={
        <PrivateRoute>
          <Users />
        </PrivateRoute>
      } />
      
      <Route path="/users/add" element={
        <PrivateRoute>
          <UserAdd />
        </PrivateRoute>
      } />
      
      <Route path="/users/edit/:id" element={
        <PrivateRoute>
          <UserEdit />
        </PrivateRoute>
      } />
      
      <Route path="/my-profile" element={
        <PrivateRoute>
          <MyProfile />
        </PrivateRoute>
      } />
      
      {/* Catch all route - redirect to login if route doesn't exist */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App