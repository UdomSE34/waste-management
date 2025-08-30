import { Outlet } from "react-router-dom";
import Header from "../components/client/Header";
import Sidebar from "../components/client/Sidebar";

export default function ClientLayout() {
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
