import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getScheduleVisibility } from "../../services/client/SideberService";

export default function Sidebar() {
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const role = localStorage.getItem("userRole");
    setUserRole(role);

    const fetchVisibility = async () => {
      try {
        const visible = await getScheduleVisibility();
        setShowSchedule(visible);
      } catch (error) {
        console.error("Failed to fetch schedule visibility:", error);
      }
    };

    fetchVisibility();
  }, [navigate]);

  const links = [
    { to: "/client/hotel", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/client/hotel-pending", icon: "bi-building", label: "Registered Customer" },
    { to: "/client/payment-slips", icon: "bi-file-earmark-text", label: "Payment Slips" },

  ];

  // Show scheduling link only if visible and user is client
  if (showSchedule && userRole === "client") {
    links.push({
      to: "/client/schedule",
      icon: "bi-calendar-event",
      label: "Scheduling",
    });
  }

  return (
    <aside className="sidebar">
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
