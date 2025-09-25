import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/client/Header";
import Sidebar from "../components/client/Sidebar";
import { logout } from "../api/api";

export default function ClientLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");

    // If any info is missing or token missing → logout
    if (!token || !name || !role || !id || !email) {
      logout(); // clears storage and redirects
      return;
    }

    setUser({ name, role, id, email });
  }, []);

  if (!user) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div>
      <Header user={user} />
      <div className="dashboard">
        <Sidebar user={user} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
