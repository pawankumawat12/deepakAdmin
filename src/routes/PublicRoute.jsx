import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, signOut } from "../context/authSlice";
import { useGetMeQuery } from "../services/authApi";
import { LoaderCircle } from "lucide-react";

export default function PublicRoute() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  const hasLocalToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken"));
  const hasAuth = Boolean(user || accessToken || hasLocalToken);

  const { data, isLoading } = useGetMeQuery(undefined, {
    skip: !hasAuth,
    refetchOnMountOrArgChange: false,
  });

  useEffect(() => {
    if (data?.user) {
      dispatch(
        setUser({
          ...data.user,
          accessToken: data.accessToken || data.token || data.user?.token,
        })
      );
    }
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
  if (user?.role === "admin" || data?.user?.role === "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

