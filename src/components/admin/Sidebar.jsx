import { NavLink } from "react-router-dom";
import "../../css/admin/Sidebar.css";

export default function Sidebar() {
  const links = [
    { to: "/admin", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/admin/salary-dashboard", icon: "bi-calendar-event", label: "Salary Dashboard" },
    { to: "/admin/salary-policies", icon: "bi-truck", label: "Salary Policies" },
    { to: "/admin/attendance", icon: "bi-people", label: "Attendance" },
    { to: "/admin/workers", icon: "bi-people", label: "Workers" },
    { to: "/admin/deleted-workers", icon: "bi-person-x", label: "Deleted Workers" },
    { to: "/admin/hotels", icon: "bi-building", label: "Hotel Clients" },
    { to: "/admin/pending-hotels", icon: "bi-building", label: "Pending Hotels" },
    { to: "/admin/routes", icon: "bi-speedometer2", label: "Routes" },
    { to: "/admin/scheduling", icon: "bi-calendar-event", label: "Scheduling" },
    { to: "/admin/incomplete-schedules", icon: "bi-bar-chart-line", label: "Incomplete Schedules" },
    { to: "/admin/completed-schedules", icon: "bi-check2-circle", label: "Completed Schedules" },
    { to: "/admin/paid-hotels", icon: "bi-building", label: "Hotels Payment" },
    { to: "/admin/payment-slips", icon: "bi-file-earmark-text", label: "Payment Slips" },
    { to: "/admin/invoice", icon: "bi-receipt", label: "Invoices" },
    { to: "/admin/monthly-summary", icon: "bi-bar-chart-line", label: "Monthly Summary" },
    { to: "/admin/storage", icon: "bi-folder2-open", label: "Storage Management" },
    { to: "/admin/client-management", icon: "bi-people-fill", label: "Client Management" }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
      </div>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <i className={`bi ${link.icon} nav-icon`}></i>
          <span className="nav-text">{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
