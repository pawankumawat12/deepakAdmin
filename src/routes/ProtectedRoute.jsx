import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
export default function ProtectedRoute() {
  return useSelector((state) => state.auth.user) ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
