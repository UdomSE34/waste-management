import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  fetchWorkers,
  addWorker,
  requestSuspend,
  requestDelete,
} from "../services/userService";
import "../css/Workers.css";

// Match backend role values exactly
const roles = ["Workers", "HR", "Supervisors", "Drivers"];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // Shared state
  const [comment, setComment] = useState("");
  const [btnLoading, setBtnLoading] = useState(false); // For submit buttons

  // New user form
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Workers",
    date_of_birth: "",
    national_id: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_phone: "",
  });

  // Dismiss messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Fetch users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    clearMessages();
    setLoading(true);
    try {
      const data = await fetchWorkers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    clearMessages();
    setBtnLoading(true);

    try {
      await addWorker({
        ...newUser,
        password: "123456", // backend hashes this
      });
      setShowAddUser(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "Workers",
        date_of_birth: "",
        national_id: "",
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_phone: "",
      });
      setSuccess("User added successfully!");
      await loadUsers();
    } catch (err) {
      console.error("Error adding user:", err);
      setError(
        "Failed to add user. Please check the information and try again."
      );
    } finally {
      setBtnLoading(false);
    }
  };

  // Suspend request
  const handleSuspendSubmit = async () => {
    if (!comment.trim()) {
      alert("Please provide a reason for suspension.");
      return;
    }
    clearMessages();
    setBtnLoading(true);

    try {
      // 🔁 Use 'id' — assuming backend returns 'id', not 'user_id'
      if (!suspendUser || !suspendUser.user_id) {
        throw new Error("Invalid user selected for suspension");
      }

      await requestSuspend(suspendUser.user_id, comment);
      setSuspendUser(null);
      setComment("");
      setSuccess("Suspension request submitted successfully.");
      await loadUsers();
    } catch (err) {
      console.error("Error requesting suspend:", err);
      setError("Failed to submit suspension request. Please try again.");
    } finally {
      setBtnLoading(false);
    }
  };

  // Delete request
  const handleDeleteSubmit = async () => {
    if (!comment.trim()) {
      alert("Please provide a reason for deletion.");
      return;
    }
    clearMessages();
    setBtnLoading(true);

    try {
      if (!deleteUser || !deleteUser.user_id) {
        throw new Error("Invalid user selected for deletion");
      }

      await requestDelete(deleteUser.user_id, comment);
      setDeleteUser(null);
      setComment("");
      setSuccess("Deletion request submitted successfully.");
      await loadUsers();
    } catch (err) {
      console.error("Error requesting delete:", err);
      setError("Failed to submit deletion request. Please try again.");
    } finally {
      setBtnLoading(false);
    }
  };

  // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Status badge
  const renderStatus = (status) => {
    const statusMap = {
      active: { label: "Active", class: "status-active" },
      pending_suspend: { label: "Pending Suspend", class: "status-pending" },
      pending_delete: { label: "Pending Delete", class: "status-pending" },
      suspended: { label: "Suspended", class: "status-inactive" },
      deleted: { label: "Deleted", class: "status-inactive" },
    };
    const config = statusMap[status] || {
      label: "Unknown",
      class: "status-unknown",
    };
    return (
      <span className={`status-badge ${config.class}`}>{config.label}</span>
    );
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>User Management</h2>
      </div>

      {/* Success Message */}
      {success && (
        <div
          className="success-message"
          onClick={() => setSuccess("")}
          style={{ cursor: "pointer" }}
        >
          ✅ {success} (click to dismiss)
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="error-message"
          onClick={() => setError("")}
          style={{ cursor: "pointer" }}
        >
          ❌ {error} (click to dismiss)
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Users</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddUser(true)}
          >
            + Add User
          </button>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading users...</div>
        ) : (
          <DataTable
            columns={[
              "Name",
              "Phone",
              "Role",
              "National ID",
              "Status",
              "Details",
              "Actions",
            ]}
            rows={users.map((u) => ({
              Name: u.name,
              Phone: u.phone,
              Role: u.role,
              "National ID": u.national_id || "-",
              Status: renderStatus(u.status),
              Details: (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowUserDetails(u)}
                >
                  View
                </button>
              ),
              Actions: (
                <div className="action-buttons">
                  {u.status === "active" && (
                    <>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSuspendUser(u);
                          setComment("");
                        }}
                      >
                        Suspend
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setDeleteUser(u);
                          setComment("");
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {(u.status === "pending_suspend" ||
                    u.status === "pending_delete") && (
                    <span className="status-badge status-pending">
                      Pending Approval
                    </span>
                  )}
                </div>
              ),
            }))}
          />
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New User</h3>
              {/* <span className="close-modal" onClick={resetAddForm}>
                &times;
              </span> */}
            </div>

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={newUser.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={newUser.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>National ID</label>
                <input
                  type="text"
                  name="national_id"
                  value={newUser.national_id}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Relatives Name</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={newUser.emergency_contact_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Relatives Phone</label>
                <input
                  type="text"
                  name="emergency_contact_relationship"
                  value={newUser.emergency_contact_relationship}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Relationship</label>{" "}
                <select
                  name="emergency_contact_relationship"
                  value={newUser.emergency_contact_relationship}
                  onChange={handleInputChange}
                  required
                >
                  {" "}
                  <option value="">--Select--</option>{" "}
                  <option value="baba">Baba</option>{" "}
                  <option value="mama">Mama</option>{" "}
                  <option value="kaka">Kaka</option>{" "}
                  <option value="dada">Dada</option>{" "}
                  <option value="babu">Babu</option>{" "}
                  <option value="bibi">Bibi</option>{" "}
                  <option value="other">Other</option>{" "}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddUser(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={btnLoading}
                >
                  {btnLoading ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="form-group">
              <h3>Suspend {suspendUser.name}?</h3>
              <textarea
                placeholder="Enter reason for suspension (required)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                autoFocus // Auto-focus comment field
              />
            </div>

            <div className="form-actions">
              <button
                className="btn btn-outline"
                onClick={() => setSuspendUser(null)}
                disabled={btnLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-warning"
                onClick={handleSuspendSubmit}
                disabled={btnLoading}
              >
                {btnLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="form-group">
              <h3>Delete {deleteUser.name}?</h3>
              <textarea
                placeholder="Enter reason for deletion (required)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>

            <div className="form-actions">
              <button
                className="btn btn-outline"
                onClick={() => setDeleteUser(null)}
                disabled={btnLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteSubmit}
                disabled={btnLoading}
              >
                {btnLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>User Details</h3>
              <span
                className="close-modal"
                onClick={() => setShowUserDetails(null)}
                style={{ cursor: "pointer" }}
              >
                &times;
              </span>
            </div>
            <div className="worker-details">
              {[
                ["Name", showUserDetails.name],
                ["Email", showUserDetails.email],
                ["Phone", showUserDetails.phone],
                ["Role", showUserDetails.role],
                ["National ID", showUserDetails.national_id || "-"],
                [
                  "Emergency Contact",
                  showUserDetails.emergency_contact_name || "-",
                ],
                [
                  "Relationship",
                  showUserDetails.emergency_contact_relationship || "-",
                ],
                [
                  "Emergency Phone",
                  showUserDetails.emergency_contact_phone || "-",
                ],
                ["Status", renderStatus(showUserDetails.status)],
              ].map(([label, value]) => (
                <div key={label} className="detail-row">
                  <span className="detail-label">{label}:</span>{" "}
                  <span>{value}</span>
                </div>
              ))}

              <div className="form-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowUserDetails(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
