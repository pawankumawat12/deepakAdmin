import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import ProductList from "../pages/products/ProductList";
import ProductCreate from "../pages/products/ProductCreate";
import ProductEdit from "../pages/products/ProductEdit";
import CategoryList from "../pages/categories/CategoryList";
import CategoryCreate from "../pages/categories/CategoryCreate";
import CategoryEdit from "../pages/categories/CategoryEdit";
import OrderList from "../pages/orders/OrderList";
import CustomerList from "../pages/customers/CustomerList";
import OfferList from "../pages/offers/OfferList";
import MessageList from "../pages/messages/MessageList";
import FavouriteList from "../pages/favourites/FavouriteList";
import Settings from "../pages/settings/Settings";
import Profile from "../pages/profile/Profile";
import ReviewList from "../pages/reviews/ReviewList";
import EmailLogList from "../pages/emailLogs/EmailLogList";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public / Unauthenticated Routes: If already logged in, redirect to "/" (Dashboard) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Admin Routes: Must be authenticated as admin to access any internal page */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductCreate />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/create" element={<CategoryCreate />} />
          <Route path="categories/:id/edit" element={<CategoryEdit />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="offers" element={<OfferList />} />
          <Route path="reviews" element={<ReviewList />} />
          <Route path="messages" element={<MessageList />} />
          <Route path="email-logs" element={<EmailLogList />} />
          <Route path="favourites" element={<FavouriteList />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
