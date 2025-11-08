import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import StaffLayout from "./layouts/StaffLayout";
import ClientLayout from "./layouts/ClientLayout";
import AdminLayout from "./layouts/AdminLayouts";

// Admin Pages
import AdminWorkers from "./pages/admin/AdminWorkers";
import SalaryDashboard from "./pages/admin/SalaryDashboard";
import SalaryPolicies from "./pages/admin/SalaryPolices";
import AttendanceDashboard from "./pages/admin/AttendanceDashboard";
import PaidHotels from "./pages/admin/PaidHotels";
import DeletedWorkers from "./pages/admin/DeletedWorkers";
import AdminMessaging from "./pages/admin/AdminMessaging";
import AdminPaymentSlips from "./components/admin/AdminPaymentSlips";
import MonthlySummaryDashboard from "./pages/admin/MonthlySummaryPage";

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
import IncompleteSchedule from "./pages/IncompleteSchedule";
import UserNotifications from "./pages/UserNotifications";
import StaffMessaging from "./pages/StaffMessaging";



// Client Pages
import PageHotel from "./pages/client/PageHotel";
import ClientRegistration from "./pages/client/ClientRegistration";
import ClientPendingHotels from "./pages/client/ClientPendingHotels";
import ClientScheduling from "./pages/client/ClientScheduling";
import PaymentSlips from "./pages/client/PaymentSlip";

// Public Municipul
import PublicDashboard from "./pages/public/PublicDashboard";

// Auth Pages
import Login from "./pages/auth/login";

// PrivateRoute for session control
import PrivateRoute from "./components/PrivateRoute";

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
      <Route path="/public" element={<PublicDashboard />} />
    </Routes>
  );
}
