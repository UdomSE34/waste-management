import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/admin/Header";
import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const IDLE_TIMEOUT = 1 * 60 * 1000; // 2 minutes

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    const id = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");

    if (!token || !role || !name || !id || !email) {
      localStorage.clear();
      navigate("/login");
    } else {
      setUser({ name, role, id, email });
    }
  }, [navigate]);

  // Idle logout effect
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.clear();
        navigate("/login");
      }, IDLE_TIMEOUT);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // start timer

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [navigate]);

  if (!user) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div>
      <Header user={user} />
      <div className="dashboard">
        <Sidebar user={user} />
        <div className="page-content">
          <Outlet /> {/* Nested admin pages */}
        </div>
      </div>
    </div>
  );
}
