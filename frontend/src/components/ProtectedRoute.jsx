import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import PageSpinner from "./PageSpinner";

export default function ProtectedRoute({
  adminOnly = false,
  redirectTo = "/redirect-by-role",
  userOnly = false,
}) {
  const {
    isAdmin,
    loadUser,
    token,
    isAuthenticated,
    loading,
    setRole,
    setUser,
    setLoading,
  } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isAuthenticated) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [loadUser, isAuthenticated, setRole, setUser, setLoading]);
  if (loading) {
    return <PageSpinner />;
  }
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (userOnly && isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
