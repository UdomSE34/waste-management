// src/routes/ClientPrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function ClientPrivateRoute() {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "client") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // render nested client routes
}
