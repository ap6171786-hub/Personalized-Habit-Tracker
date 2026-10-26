import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Spinner from "./components/Spinner.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const HabitDetail = lazy(() => import("./pages/HabitDetail.jsx"));
const Habits = lazy(() => import("./pages/Habits.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));

function HomeRedirect() {
  const { token, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner fullScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/habits/:id" element={<HabitDetail />} />
            </Route>
          </Route>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
