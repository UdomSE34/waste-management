import { Navigate, Outlet } from "react-router-dom";
import { logout } from "../api/api";

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  // No token → logout
  if (!token) {
    logout();
    return <Navigate to="/login" />;
  }

  // Role not allowed → redirect
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
