import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, signOut } from "../context/authSlice";
import { useGetMeQuery } from "../services/authApi";
import { LoaderCircle } from "lucide-react";

export default function PublicRoute() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const hasToken =
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("accessToken"));

  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !hasToken,
  });

  useEffect(() => {
    if (data?.user) dispatch(setUser(data.user));
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(signOut());
    }
  }, [isError, dispatch]);

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
  if (user?.role === "admin" || data?.user?.role === "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

