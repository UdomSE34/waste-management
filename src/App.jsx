import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import StaffLayout from "./layouts/StaffLayout"; // Staff dashboard layout
import ClientLayout from "./layouts/ClientLayout"; // Client layout

// Staff Pages
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Scheduling from "./pages/Scheduling";
import Workers from "./pages/Workers";
import Hotels from "./pages/Hotels";
import CollectionsRoutes from "./pages/CollectionsRoutes";
import Analytics from "./pages/Analytics";
import CompletedSchedule from "./pages/CompletedSchedule";
import PendingHotels from "./pages/PendingPage";

// Client Pages
import PageHotel from "./pages/client/PageHotel";
import ClientRegistration from "./pages/client/ClientRegistration";
import Login from "./pages/auth/Login";
// import ClientPendingHotels from "./pages/client/PendingPage";
// import ClientScheduling from "./pages/client/Scheduling";

// CSS
import "./css/styles.css";

export default function App() {
  return (
    <Routes>
      {/* Auth/Login */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<ClientRegistration />} />

      {/* Staff Dashboard Layout */}
      <Route path="/staff/*" element={<StaffLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="requests" element={<Requests />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="workers" element={<Workers />} />
        <Route path="hotels" element={<Hotels />} />
        <Route path="routes" element={<CollectionsRoutes />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="completed-schedules" element={<CompletedSchedule />} />
        <Route path="pending-hotels" element={<PendingHotels />} />
        <Route path="*" element={<Navigate to="/staff" />} /> {/* fallback */}
      </Route>

      {/* Client Pages */}
      <Route path="/client/*" element={<ClientLayout />}>
        <Route path="hotel" element={<PageHotel />} />
        {/* <Route path="hotel-pending" element={<ClientPendingHotels />} />
        <Route path="schedule" element={<ClientScheduling />} /> */}

        
        
      
      </Route>

      {/* Root redirect to login */}
      <Route path="*" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/register" />} /> {/* fallback */}
    </Routes>
  );
}
