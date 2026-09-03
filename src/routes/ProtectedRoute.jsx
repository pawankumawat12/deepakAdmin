import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, signOut } from "../context/authSlice";
import { useGetMeQuery } from "../services/authApi";
import { LoaderCircle } from "lucide-react";

export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const { data, isLoading, isFetching, isError, refetch } = useGetMeQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // If accessToken is removed in another tab or directly via DevTools, revalidate immediately
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" && !e.newValue) {
        refetch();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refetch]);

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(signOut());
    }
  }, [isError, dispatch]);

  if ((isLoading || isFetching) && !isError && !user) {
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

  const isAdmin = user?.role === "admin" || data?.user?.role === "admin";

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}
