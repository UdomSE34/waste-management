import { useState, useEffect } from "react";
import {
  getWorkers,
  approveAction,
  addWorker,
} from "../../services/admin/workerService";
import DataTable from "../../components/admin/DataTable";

const WorkersDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(null);
  
  

  // Unified modal state
  const [modal, setModal] = useState({ user: null, type: null });
  const [comment, setComment] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

    // Dismiss messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Match backend role values exactly
const roles = [ "Staff", "Workers", "HR", "Supervisors", "Drivers"];

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

    // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch workers
  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWorkers();
      setWorkers(
        Array.isArray(data) ? data.filter((w) => w.status !== "deleted") : []
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load workers.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for any action
  const openModal = (user, type) => {
    setModal({ user, type });
    setComment("");
  };

  // Unified modal submission
  const handleModalSubmit = async () => {
    if (!comment.trim()) {
      setError("❌ Please provide a reason/comment.");
      return;
    }

    setBtnLoading(true);
    try {
      const { user, type } = modal;

      let action = "approve"; // default
      let type_val = type;

      // Map modal type to backend type/action
      switch (type) {
        case "suspend":
        case "activate":
        case "delete":
          type_val = type;
          action = "approve";
          break;

        case "approve_delete":
          type_val = "delete";
          action = "approve";
          break;

        case "reject_delete":
          type_val = "delete";
          action = "reject";
          break;

        case "approve_suspend":
          type_val = "suspend";
          action = "approve";
          break;

        case "reject_suspend":
          type_val = "suspend";
          action = "reject";
          break;

        default:
          throw new Error("Unknown modal type");
      }

      await approveAction(user.user_id, action, type_val, comment);

      setSuccess("✅ Action executed successfully.");
      setModal({ user: null, type: null });
      setComment("");
      fetchWorkers();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to process request.");
    } finally {
      setBtnLoading(false);
    }
  };

  // Stats
  const activeCount = workers.filter((w) => w.status === "active").length;
  const suspendedCount = workers.filter((w) => w.status === "suspended").length;
  const pendingActions = workers.filter((w) =>
    ["pending_suspend", "pending_delete"].includes(w.status)
  );

  const renderStatus = (status) => {
    const styles = {
      active: { label: "Active", class: "status-active" },
      suspended: { label: "Suspended", class: "status-inactive" },
      pending_suspend: { label: "Pending Suspend", class: "status-pending" },
      pending_delete: { label: "Pending Delete", class: "status-pending" },
      deleted: { label: "Deleted", class: "status-inactive" },
    };
    const s = styles[status] || { label: "Unknown", class: "status-unknown" };
    return <span className={`status-badge ${s.class}`}>{s.label}</span>;
  };

  return (
    <div className="content">
      {/* Dashboard Cards */}
      <div className="dashboard-cards flex gap-4">
        <div className="card p-4 bg-white shadow rounded-lg border flex-1">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Workers</h3>
            <i className="bi bi-person-check text-green-500 text-2xl"></i>
          </div>
          <h4 className="text-2xl font-bold mt-2">{activeCount}</h4>
        </div>

        <div className="card p-4 bg-white shadow rounded-lg border flex-1">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold">Suspended</h3>
            <i className="bi bi-person-x text-red-500 text-2xl"></i>
          </div>
          <h4 className="text-2xl font-bold mt-2 text-red-600">
            {suspendedCount}
          </h4>
        </div>

        <div className="card p-4 bg-yellow-50 shadow rounded-lg border flex-1">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold text-yellow-800">
              Pending Approval
            </h3>
            <i className="bi bi-clock-history text-yellow-500 text-2xl"></i>
          </div>
          <h4 className="text-2xl font-bold mt-2 text-yellow-700">
            {pendingActions.length}
          </h4>
        </div>
      </div>

      {/* Pending Requests Table */}
      {pendingActions.length > 0 && (
        <div className="card bg-white shadow rounded-lg border overflow-hidden mt-6">
          <div className="card-header p-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Pending Requests
            </h3>
          </div>
          <DataTable
            columns={["Name", "Email", "Type", "Reason", "Actions"]}
            rows={pendingActions.map((w) => {
              const isSuspend = w.status === "pending_suspend";
              const requestType = isSuspend ? "Suspend" : "Delete";
              const commentText = isSuspend
                ? w.suspend_comment
                : w.delete_comment;

              return {
                Name: w.name,
                Email: w.email,
                Type: (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isSuspend
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {requestType}
                  </span>
                ),
                Reason: (
                  <span className="text-gray-700 italic">
                    {commentText || "No reason provided"}
                  </span>
                ),
                Actions: (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-success px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        openModal(
                          w,
                          isSuspend ? "approve_suspend" : "approve_delete"
                        )
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-primary border border-gray-400 text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
                      onClick={() =>
                        openModal(
                          w,
                          isSuspend ? "reject_suspend" : "reject_delete"
                        )
                      }
                    >
                      Reject
                    </button>
                  </div>
                ),
              };
            })}
          />
        </div>
      )}

      {/* All Workers Table */}
      <div className="card bg-white shadow rounded-lg border overflow-hidden mt-6">
        <div className="card-header p-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">All Workers</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddUser(true)}
          >
            + Add Worker
          </button>
        </div>

        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading workers...</p>
        ) : (
          <DataTable
            columns={["Name", "Email", "Phone", "Role", "Status", "Action"]}
            rows={workers.map((w) => {
              const isActive = w.status === "active";
              const isPending = ["pending_suspend", "pending_delete"].includes(
                w.status
              );

              return {
                Name: w.name,
                Email: w.email,
                Phone: w.phone,
                Role: w.role,
                Status: renderStatus(w.status),
                Action: isPending ? (
                  <span className="text-yellow-600 text-sm">
                    Pending Review
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className={`btn px-3 py-1 rounded text-white ${
                        isActive
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      onClick={() =>
                        openModal(w, isActive ? "suspend" : "activate")
                      }
                    >
                      {isActive ? "Suspend" : "Activate"}
                    </button>
                    <button
                      className="btn btn-danger bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800"
                      onClick={() => openModal(w, "delete")}
                    >
                      Delete
                    </button>
                  </div>
                ),
              };
            })}
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
                  name="emergency_contact_phone"
                  value={newUser.emergency_contact_phone}
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


      {/* Unified Modal */}
      {modal.user && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="mb-2">
              {modal.type === "delete" && `Delete ${modal.user.name}?`}
              {modal.type === "activate" && `Activate ${modal.user.name}?`}
              {modal.type === "suspend" && `Suspend ${modal.user.name}?`}
              {modal.type === "approve_delete" &&
                `Approve delete request for ${modal.user.name}?`}
              {modal.type === "reject_delete" &&
                `Reject delete request for ${modal.user.name}?`}
              {modal.type === "approve_suspend" &&
                `Approve suspend request for ${modal.user.name}?`}
              {modal.type === "reject_suspend" &&
                `Reject suspend request for ${modal.user.name}?`}
            </h3>
            <textarea
              placeholder="Enter reason/comment (required)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              autoFocus
            />
            <div className="form-actions mt-3 flex gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setModal({ user: null, type: null })}
                disabled={btnLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleModalSubmit}
                disabled={btnLoading}
              >
                {btnLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersDashboard;
