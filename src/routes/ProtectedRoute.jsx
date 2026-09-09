import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, signOut } from "../context/authSlice";
import { useGetMeQuery } from "../services/authApi";
import { baseApi } from "../services/baseApi";
import { LoaderCircle } from "lucide-react";

export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const { data, isLoading, isFetching, isError } = useGetMeQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );

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

  useEffect(() => {
    if (isError && user) {
      dispatch(signOut());
    }
  }, [isError, user, dispatch]);

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

  // When signed out or unauthorized, user and reset cache will both be null
  const effectiveUser = user || data?.user;
  const isAdmin = Boolean(effectiveUser && effectiveUser.role === "admin");

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}

