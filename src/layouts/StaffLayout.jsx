import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function StaffLayout() {
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
