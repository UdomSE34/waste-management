import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Scheduling from "./pages/Scheduling";
import Workers from "./pages/Workers";
import Hotels from "./pages/Hotels";
import CollectionsRoutes from "./pages/CollectionsRoutes";
import Analytics from "./pages/Analytics";
// import Settings from "./pages/Settings";
import "./css/styles.css";

export default function App() {
  return (
    <div>
      <Header />
      <div className="dashboard">
        <Sidebar />
        <div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/scheduling" element={<Scheduling />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/routes" element={<CollectionsRoutes />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
