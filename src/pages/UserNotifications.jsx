import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import "../css/UserNotification.css";
import axios from "axios";

// Token-aware Axios instance
const api = axios.create({
  baseURL: "/api/user-notifications/",
  timeout: 10000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Token ${token}`;
  }
  return config;
});

const roles = ["Admin", "HR", "Supervisors", "Drivers", "Staff", "Workers"];

const UserNotifications = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Users with notifications enabled
  const notifiedUsers = users.filter((u) => u.receive_email_notifications);

  // Users available to add in modal
  const availableUsers = users.filter(
    (u) =>
      !u.receive_email_notifications &&
      (selectedRole ? u.role === selectedRole : true)
  );

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleGrantNotifications = async () => {
    try {
      await Promise.all(
        selectedUsers.map((id) =>
          api.patch(`${id}/toggle_email/`, { receive_email_notifications: true })
        )
      );
      setSelectedUsers([]);
      setShowModal(false);
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error(err);
      setError("Failed to grant notifications");
    }
  };

  const handleToggleNotification = async (userId, currentValue) => {
    try {
      await api.patch(`${userId}/toggle_email/`, {
        receive_email_notifications: !currentValue,
      });
      // Optimistically update state
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId
            ? { ...u, receive_email_notifications: !currentValue }
            : u
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update notification setting");
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const rows = notifiedUsers.map((user) => ({
    Name: user.name,
    Email: user.email,
    Role: user.role,
    "Receive Email": (
      <input
        type="checkbox"
        checked={true}
        onChange={() =>
          handleToggleNotification(user.user_id, true)
        }
      />
    ),
  }));

  return (
    <div className="content">
      <div className="page-header">
        <h2>User Email Notifications</h2>
      </div>
      <br />

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h3>Users Receiving Notifications</h3>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Users
          </button>
        </div>
        <DataTable columns={["Name", "Email", "Role", "Receive Email"]} rows={rows} />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Grant Notification Access</h3>
            <label>Filter by Role:</label>
            <select
              className="form-control"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <br />
            <div className="user-selection-list">
              {availableUsers.length === 0 && <p>No users available.</p>}
              {availableUsers.map((user) => (
                <div key={user.user_id}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.user_id)}
                    onChange={() => handleSelectUser(user.user_id)}
                  />{" "}
                  {user.name} ({user.email})
                </div>
              ))}
            </div>
            <br />
            <button
              className="btn btn-primary"
              onClick={handleGrantNotifications}
              disabled={selectedUsers.length === 0}
            >
              Grant Notifications
            </button>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
