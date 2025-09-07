import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    { to: "/client/hotel", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/client/hotel-pending", icon: "bi-building", label: "Registered Hotels" },
    { to: "/client/schedule", icon: "bi-calendar-event", label: "Scheduling" },
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
