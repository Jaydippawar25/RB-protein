import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../components/admin/DashboardLayout';

import Home from '../pages/customer/Home';
import ProductListing from '../pages/customer/ProductListing';
import ProductDetail from '../pages/customer/ProductDetail';
import Wishlist from '../pages/customer/Wishlist';
import OrderHistory from '../pages/customer/OrderHistory';
import OrderTracking from '../pages/customer/OrderTracking';
import MacroCalculator from '../pages/customer/MacroCalculator';
import Profile from '../pages/customer/Profile';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import ProductModeration from '../pages/admin/ProductModeration';
import RevenueAnalytics from '../pages/admin/RevenueAnalytics';
import ProductManagement from '../pages/admin/ProductManagement';
import InventoryManagement from '../pages/admin/InventoryManagement';
import SalesAnalytics from '../pages/admin/SalesAnalytics';
import OrderProcessing from '../pages/admin/OrderProcessing';
import SiteContentManagement from '../pages/admin/SiteContentManagement';

const adminLinks = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/products', label: 'Product Management' },
  { to: '/admin/content', label: 'Website Content & Design' },
];

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public / customer routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductListing />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/macro-calculator" element={<MacroCalculator />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated customer routes */}
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Admin routes — nested under a shared dashboard shell */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout title="Admin" links={adminLinks} /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="content" element={<SiteContentManagement />} />
        <Route path="moderation" element={<ProductModeration />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="orders" element={<OrderProcessing />} />
        <Route path="revenue" element={<RevenueAnalytics />} />
        <Route path="sales" element={<SalesAnalytics />} />
      </Route>

      <Route path="*" element={<div className="max-w-lg mx-auto py-24 text-center font-display text-2xl">404 — Page not found</div>} />
    </Routes>
  );
}
