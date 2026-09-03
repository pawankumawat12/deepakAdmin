import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../context/authSlice";
import { useGetMeQuery } from "../services/authApi";
import { LoaderCircle } from "lucide-react";

export default function PublicRoute() {
  const dispatch = useDispatch();
  const hasToken =
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("accessToken"));

  const { data, isLoading } = useGetMeQuery(undefined, {
    skip: !hasToken,
  });

  useEffect(() => {
    if (data?.user) dispatch(setUser(data.user));
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

  // If already logged in as admin, redirect to Dashboard
  if (data?.user?.role === "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

