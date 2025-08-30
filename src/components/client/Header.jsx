export default function Header() {
  return (
    <header>
      <div className="logo">
        <img src="/logo.png" alt="Logo" />
        <h1>Waste Management System</h1>
      </div>
      <div className="user-controls">
        <div className="notification-bell">
          🔔
          <span className="notification-badge">3</span>
        </div>
        <span>Staff</span>
      </div>
    </header>
  );
}
