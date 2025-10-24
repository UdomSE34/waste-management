import { NavLink } from "react-router-dom";
import "../css/Sidebar.css";

export default function Sidebar() {
  const links = [
    { to: "/staff", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/staff/scheduling", icon: "bi-calendar-event", label: "Scheduling" },
    { to: "/staff/routes", icon: "bi-truck", label: "Collection Routes" },
    { to: "/staff/workers", icon: "bi-people", label: "Worker Management" },
    { to: "/staff/hotels", icon: "bi-building", label: "Hotel Clients" },
    { to: "/staff/pending-hotels", icon: "bi-building", label: "Pending Hotels" },
    { to: "/staff/incomplete-schedules", icon: "bi-bar-chart-line", label: "Incomplete Schedules" },
    { to: "/staff/completed-schedules", icon: "bi-check2-circle", label: "Completed Schedules" },
    { to: "/staff/user-notifications", icon: "bi-bell", label: "User Notifications" },
    // { to: "/staff/staff-messaging", icon: "bi-chat-dots", label: "Messaging" },
  ];

  return (
    <aside className="sidebar">
      
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <i className={`bi ${link.icon} nav-icon`}></i>
          <span className="nav-text">{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
