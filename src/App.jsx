import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import StaffLayout from "./layouts/StaffLayout.jsx";
import ClientLayout from "./layouts/ClientLayout.jsx";
import AdminLayout from "./layouts/AdminLayouts.jsx";

// Admin Pages
import AdminWorkers from "./pages/admin/AdminWorkers.jsx";
import SalaryDashboard from "./pages/admin/SalaryDashboard.jsx";
import SalaryPolicies from "./pages/admin/SalaryPolices.jsx";
import AttendanceDashboard from "./pages/admin/AttendanceDashboard.jsx";
import PaidHotels from "./pages/admin/PaidHotels.jsx";
import DeletedWorkers from "./pages/admin/DeletedWorkers.jsx";
import AdminMessaging from "./pages/admin/AdminMessaging.jsx";
import AdminPaymentSlips from "./components/admin/AdminPaymentSlips.jsx";
import MonthlySummaryDashboard from "./pages/admin/MonthlySummaryPage.jsx";

// Staff Pages
import Dashboard from "./pages/Dashboard.jsx";
import Requests from "./pages/Requests.jsx";
import Scheduling from "./pages/Scheduling.jsx";
import Workers from "./pages/Workers.jsx";
import Hotels from "./pages/Hotels.jsx";
import CollectionsRoutes from "./pages/CollectionsRoutes.jsx";
import Analytics from "./pages/Analytics.jsx";
import CompletedSchedule from "./pages/CompletedSchedule.jsx";
import PendingHotels from "./pages/PendingPage.jsx";
import IncompleteSchedule from "./pages/IncompleteSchedule.jsx";
import UserNotifications from "./pages/UserNotifications.jsx";
import StaffMessaging from "./pages/StaffMessaging.jsx";



// Client Pages
import PageHotel from "./pages/client/PageHotel.jsx";
import ClientRegistration from "./pages/client/ClientRegistration.jsx";
import ClientPendingHotels from "./pages/client/ClientPendingHotels.jsx";
import ClientScheduling from "./pages/client/ClientScheduling.jsx";
import PaymentSlips from "./pages/client/PaymentSlip.jsx";

// Auth Pages
import Login from "./pages/auth/Login.jsx";

// PrivateRoute for session control
import PrivateRoute from "./components/PrivateRoute.jsx";

// CSS
import "./css/styles.css";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<ClientRegistration />} />

      {/* Client Protected Routes */}
      <Route element={<PrivateRoute allowedRoles={["client"]} />}>
        <Route path="/client/*" element={<ClientLayout />}>
          <Route path="hotel" element={<PageHotel />} />
          <Route path="hotel-pending" element={<ClientPendingHotels />} />
          <Route path="schedule" element={<ClientScheduling />} />
          <Route path="payment-slips" element={<PaymentSlips />} />
          <Route path="" element={<Navigate to="hotel" />} />
        </Route>
      </Route>

      {/* Staff Protected Routes */}
      <Route element={<PrivateRoute allowedRoles={["Staff"]} />}>
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
          <Route path="incomplete-schedules" element={<IncompleteSchedule />} />
          <Route path="user-notifications" element={<UserNotifications />} />
          <Route path="staff-messaging" element={<StaffMessaging />} />
          
          <Route path="*" element={<Navigate to="/staff" />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<PrivateRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="workers" element={<AdminWorkers />} />
          <Route path="salary-dashboard" element={<SalaryDashboard />} />
          <Route path="salary-policies" element={<SalaryPolicies />} />
          <Route path="attendance" element={<AttendanceDashboard />} />
          <Route path="paid-hotels" element={<PaidHotels />} />
          <Route path="deleted-workers" element={<DeletedWorkers />} />
          <Route path="admin-messaging" element={<AdminMessaging />} />
          <Route path="payment-slips" element={<AdminPaymentSlips />} />
          <Route path="monthly-summary" element={<MonthlySummaryDashboard />} />
          <Route path="*" element={<Navigate to="/admin/workers" />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
