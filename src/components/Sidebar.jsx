import { NavLink } from "react-router-dom";
import "../css/Sidebar.css"; // Create this file for styles

export default function Sidebar() {
  const links = [
    { to: "/", icon: "📊", label: "Dashboard" },
    { to: "/scheduling", icon: "🗓️", label: "Scheduling" },
    { to: "/routes", icon: "🚛", label: "Collection Routes" },
    { to: "/workers", icon: "👷", label: "Worker Management" },
    { to: "/hotels", icon: "🏨", label: "Hotel Clients" },
    { to: "/analytics", icon: "📈", label: "Analytics" },
    
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
          <span className="nav-icon">{link.icon}</span>
          <span className="nav-text">{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}