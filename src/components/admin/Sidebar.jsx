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
    { to: "/admin/paid-hotels", icon: "bi-building", label: "Hotels Payment" },
    { to: "/admin/payment-slips", icon: "bi-file-earmark-text", label: "Payment Slips" },
    // { to: "/admin/admin-messaging", icon: "bi-chat-dots", label: "Messaging" },
    // { to: "/admin/monthly-summary", icon: "bi-bar-chart-line", label: "Monthly Summary" },
    // Add role-specific links if needed
    // { to: "/admin/incomplete-schedules", icon: "bi-bar-chart-line", label: "Incomplete Schedules" },
    // { to: "/admin/completed-schedules", icon: "bi-check2-circle", label: "Completed Schedules" },
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
