import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../context/authSlice";
import { useGetMeQuery } from "../services/authApi";
import { LoaderCircle } from "lucide-react";

export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetMeQuery();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if(!token){
      return;
    }
    if (data?.user) dispatch(setUser(data));
  }, [data, dispatch]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          color: "#6b7280",
          gap: "8px",
        }}
      >
        <LoaderCircle size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return data?.user?.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
