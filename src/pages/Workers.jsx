import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  fetchWorkers,
  addWorker,
  deleteWorker,
  toggleActive,
} from "../services/userService";
import "../css/Workers.css";

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showWorkerDetails, setShowWorkerDetails] = useState(null);
  const [newWorker, setNewWorker] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Load workers
  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const data = await fetchWorkers();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching workers:", err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // Add worker
  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
      await addWorker({
        name: newWorker.name,
        email: newWorker.email,
        phone: newWorker.phone,
        password_hash: "default123", // ensure backend hashes this
        role: "Workers",
      });
      setShowAddWorker(false);
      setNewWorker({ name: "", email: "", phone: "" });
      await loadWorkers();
    } catch (err) {
      console.error("Error adding worker:", err);
      alert("Failed to add worker.");
    }
  };

  // Suspend/Activate
  const handleToggleActive = async (worker) => {
    try {
      await toggleActive(worker.user_id, !worker.is_active);
      await loadWorkers();
    } catch (err) {
      console.error("Error toggling active:", err);
      alert("Failed to update status.");
    }
  };

  // Delete
  const handleDelete = async (worker) => {
    if (!window.confirm(`Delete worker ${worker.name}?`)) return;
    try {
      await deleteWorker(worker.user_id);
      await loadWorkers();
    } catch (err) {
      console.error("Error deleting worker:", err);
      alert("Failed to delete worker.");
    }
  };

  // Form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorker((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>Worker Management</h2>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Workers</h3>
          <button className="btn btn-primary" onClick={() => setShowAddWorker(true)}>
            + Add Worker
          </button>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading workers...</div>
        ) : (
          <DataTable
            columns={["Name", "Email", "Phone", "Status", "Actions"]}
            rows={workers.map((w) => ({
              Name: w.name,
              Email: w.email,
              Phone: w.phone,
              Status: (
                <span
                  className={`status-badge ${
                    w.is_active ? "status-active" : "status-inactive"
                  }`}
                >
                  {w.is_active ? "Active" : "Suspended"}
                </span>
              ),
              Actions: (
                <div className="action-buttons">
                  <button className="btn btn-outline" onClick={() => setShowWorkerDetails(w)}>
                    View
                  </button>
                  <button className="btn btn-outline" onClick={() => handleToggleActive(w)}>
                    {w.is_active ? "Suspend" : "Activate"}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(w)}>
                    Delete
                  </button>
                </div>
              ),
            }))}
          />
        )}
      </div>

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Worker</h3>
              <span className="close-modal" onClick={() => setShowAddWorker(false)}>
                &times;
              </span>
            </div>
            <form onSubmit={handleAddWorker}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  required
                  value={newWorker.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  required
                  value={newWorker.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  required
                  value={newWorker.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddWorker(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Worker Details Modal */}
      {showWorkerDetails && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Worker Details</h3>
              <span className="close-modal" onClick={() => setShowWorkerDetails(null)}>
                &times;
              </span>
            </div>
            <div className="worker-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span>{showWorkerDetails.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span>{showWorkerDetails.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span>{showWorkerDetails.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span
                  className={`status-badge ${
                    showWorkerDetails.is_active ? "status-active" : "status-inactive"
                  }`}
                >
                  {showWorkerDetails.is_active ? "Active" : "Suspended"}
                </span>
              </div>
              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setShowWorkerDetails(null)}>
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

export default WorkerManagement;
