import { useState, useEffect } from "react";
import { getWorkers, approveAction } from "../../services/admin/workerService";
import DataTable from "../../components/admin/DataTable";

const DeletedWorkers = () => {
  const [deletedWorkers, setDeletedWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  // Modal state for restore comment
  const [modal, setModal] = useState({ user: null });
  const [comment, setComment] = useState("");

  // Auto-dismiss messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchDeletedWorkers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWorkers();
      const deleted = (Array.isArray(data) ? data : []).filter(
        (u) => u.status === "deleted"
      );
      setDeletedWorkers(deleted);
    } catch (err) {
      console.error("Failed to fetch deleted workers:", err);
      setError("Could not load deleted workers. Please try again.");
      setDeletedWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedWorkers();
  }, []);

  // Open restore modal
  const openRestoreModal = (user) => {
    setModal({ user });
    setComment("");
  };

  // Handle restore
  const handleRestore = async () => {
    if (!comment.trim()) {
      setError("❌ Please provide a reason/comment for restore.");
      return;
    }

    setBtnLoading(true);
    try {
      await approveAction(modal.user.user_id, "approve", "activate", comment);
      setSuccess(`✅ ${modal.user.name} has been restored successfully.`);
      setModal({ user: null });
      fetchDeletedWorkers();
    } catch (err) {
      console.error("Failed to restore worker:", err);
      setError("❌ Failed to restore worker. Please try again.");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>Deleted Workers</h2>
      </div>

      <div className="card bg-white shadow rounded-lg border overflow-hidden">
        <div className="card-header p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Deleted Workers
          </h3>
        </div>

        {loading ? (
          <p className="p-6 text-center text-gray-500">
            Loading deleted workers...
          </p>
        ) : error ? (
          <p className="p-6 text-center text-red-500">{error}</p>
        ) : deletedWorkers.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            No deleted workers found.
          </p>
        ) : (
          <DataTable
            columns={[
              "Name",
              "Email",
              "Role",
              "Start Date",
              "Deleted Date",
              "Deletion Reason",
              "Action",
            ]}
            rows={deletedWorkers.map((w) => ({
              Name: w.name,
              Email: w.email,
              Role: w.role,
              "Start Date": w.created_at
                ? new Date(w.created_at).toLocaleDateString()
                : "-",
              "Deleted Date": w.deleted_at
                ? new Date(w.deleted_at).toLocaleDateString()
                : "-",
              "Deletion Reason": w.finaldelete_comment || "-",
              Action: (
                <button
                  className="btn btn-primary bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={() => openRestoreModal(w)}
                  disabled={btnLoading}
                >
                  Restore
                </button>
              ),
            }))}
          />
        )}

        {success && <p className="p-4 text-green-600">{success}</p>}
      </div>

      {/* Restore Modal */}
      {modal.user && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="mb-2">Restore {modal.user.name}?</h3>
            <div className="form-group">
              <textarea
                placeholder="Enter reason/comment for restore (required)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                autoFocus
              />
            </div>

            <div className="form-actions mt-3 flex gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setModal({ user: null })}
                disabled={btnLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRestore}
                disabled={btnLoading}
              >
                {btnLoading ? "Restoring..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedWorkers;
