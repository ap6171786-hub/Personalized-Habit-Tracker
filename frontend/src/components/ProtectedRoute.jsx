import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "./Spinner.jsx";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
