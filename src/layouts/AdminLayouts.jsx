import { Outlet } from "react-router-dom";
import Header from "../components/admin/Header";
import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout() {
  return (
    <div>
          <Header />
          <div className="dashboard">
            <Sidebar />
            <div className="page-content">
              <Outlet /> {/* Nested staff pages */}
            </div>
          </div>
        </div>
  );
}
