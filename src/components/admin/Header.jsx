import { useNavigate } from "react-router-dom";
import logo from "../../image/logo.jpg";

export default function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session info
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Logo" />
        <h1>Waste Management System</h1>
      </div>

      <div className="user-controls">
        <div className="notification-bell">
          🔔
          <span className="notification-badge">3</span>
        </div>

        <span>{user ? `${user.name} (${user.role})` : "Guest"}</span>

        <button onClick={handleLogout} className="btn btn-primary">
          Logout
        </button>
      </div>
    </header>
  );
}
