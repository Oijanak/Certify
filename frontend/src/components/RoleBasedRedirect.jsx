import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleBasedRedirect() {
  const { isAdmin } = useAuth();

  return isAdmin ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/user" replace />
  );
}
