import { NavLink } from "react-router-dom";
// import "../../css/client/Sidebar.css";

export default function Sidebar() {
  const links = [
    { to: "/client/hotel", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/client/pending-hotels", icon: "bi-building", label: "Registered Hotels" },
    { to: "/client/scheduling", icon: "bi-calendar-event", label: "Scheduling" },
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
