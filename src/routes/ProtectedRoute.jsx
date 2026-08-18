import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../context/authSlice";
import { useGetMeQuery } from "../services/authApi";
export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (data?.user) dispatch(setUser(data));
  }, [data, dispatch]);

  if (isLoading) return null;
  return data?.user?.role === "admin" ? <Outlet /> : <Navigate to="/login" replace />;
}
