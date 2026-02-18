import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import PrivateRoute from "./components/utils/PrivateRoute";
import Dashboard from "./components/Dashboard";
import Orders from "./components/Orders/Orders";
import Product from "./components/Products/Product";
import Categories from "./components/Categories/Categories";
import Invoices from "./components/Invoices/Invoices";
import Users from "./components/Users/Users";
import AddProduct from "./components/Products/AddProduct";
import AddCategory from "./components/Categories/AddCategory";
import ProductView from "./components/Products/ProductView";
import ProductEdit from "./components/Products/ProductEdit";
import InvoiceView from "./components/Invoices/InvoiceView";
import UserAdd from "./components/Users/UserAdd";
import UserEdit from "./components/Users/UserEdit";
import MyProfile from "./components/MyProfile/MyProfile";
import Login from "./components/MyProfile/Login";
import OrderView from "./components/Orders/OrderView";
import OrderUpdate from "./components/Orders/OrderUpdate";
import EditCategory from "./components/Categories/EditCategory";
import Subcategories from "./components/Categories/Subcategories";
import AddSubcategory from "./components/Categories/AddSubcategory";
import EditSubcategory from "./components/Categories/EditSubcategory";
import Banners from "./components/Banners/Banners";
import AddBanner from "./components/Banners/AddBanner";
import EditBanner from "./components/Banners/EditBanner";
import PromoCodes from "./components/PromoCodes/PromoCodes";
import Notifications from "./components/Notifications";
import { SocketProvider } from "./context/SocketContext";

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

import AdminLayout from "./components/AdminLayout";

function AppContent() {
  return (
    <Routes>
      {/* Public route - only accessible when not logged in */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes wrapped in AdminLayout */}
      <Route
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Product />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/view/:id" element={<ProductView />} />
        <Route path="/products/edit/:id" element={<ProductEdit />} />

        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/add" element={<AddCategory />} />
        <Route path="/categories/edit/:id" element={<EditCategory />} />

        <Route path="/subcategories" element={<Subcategories />} />
        <Route path="/subcategories/add" element={<AddSubcategory />} />
        <Route path="/subcategories/edit/:id" element={<EditSubcategory />} />

        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/view/:id" element={<OrderView />} />
        <Route path="/orders/update/:id" element={<OrderUpdate />} />

        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/view/:id" element={<InvoiceView />} />

        <Route path="/users" element={<Users />} />
        <Route path="/users/add" element={<UserAdd />} />
        <Route path="/users/edit/:id" element={<UserEdit />} />

        <Route path="/banners" element={<Banners />} />
        <Route path="/banners/add" element={<AddBanner />} />
        <Route path="/banners/edit/:id" element={<EditBanner />} />
        <Route path="/banners/view/:id" element={<EditBanner />} />

        <Route path="/promo-codes" element={<PromoCodes />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Catch all route - redirect to login if route doesn't exist */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
            <AppContent />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
