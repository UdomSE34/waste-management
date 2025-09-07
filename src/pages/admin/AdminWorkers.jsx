import { useState, useEffect } from "react";
import {
  getWorkers,
  deleteWorker,
  toggleActive,
  approveAction,
} from "../../services/admin/workerService";
import DataTable from "../../components/admin/DataTable";

const WorkersDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-dismiss success/error messages
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

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWorkers();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch workers", err);
      setError("Could not load worker data. Please try again.");
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle approval
// Handle approval
const handleApprove = async (user_id, type) => {
  if (!window.confirm(`Approve ${type} request for this user?`)) return;

  try {
    if (type === "delete") {
      // If it's delete approval → remove permanently
      await deleteWorker(user_id);
      setSuccess("✅ Worker permanently deleted.");
    } else {
      // Otherwise → approve as usual
      await approveAction(user_id, "approve", type);
      setSuccess(`✅ Successfully approved ${type} request.`);
    }

    fetchWorkers();
  } catch (err) {
    console.error(`Error approving ${type}:`, err);
    setError(`❌ Failed to approve ${type} request.`);
  }
};

  // Handle rejection
  const handleReject = async (user_id, type) => {
    if (
      !window.confirm(`Reject this ${type} request? User will remain active.`)
    )
      return;

    try {
      await approveAction(user_id, "reject", type);
      setSuccess(`✅ Request rejected. User remains active.`);
      fetchWorkers();
    } catch (err) {
      console.error(`Error rejecting ${type}:`, err);
      setError(`❌ Failed to reject ${type} request.`);
    }
  };

  // Handle deletion
  const handleDelete = async (user_id) => {
    if (!window.confirm("Are you sure you want to delete this worker?")) return;

    try {
      await deleteWorker(user_id);
      setSuccess("✅ Worker deleted successfully.");
      fetchWorkers();
    } catch (err) {
      console.error("Error deleting worker:", err);
      setError("❌ Failed to delete worker.");
    }
  };

  // Stats
  const activeCount = workers.filter((w) => w.status === "active").length;
  const suspendedCount = workers.filter((w) => w.status === "suspended").length;
  const pendingActions = workers.filter((w) =>
    ["pending_suspend", "pending_delete"].includes(w.status)
  );

  // Status badge renderer
  const renderStatus = (status) => {
    const styles = {
    active: { label: "Active", class: "status-active" },
      pending_suspend: { label: "Pending Suspend", class: "status-pending" },
      pending_delete: { label: "Pending Delete", class: "status-pending" },
      suspended: { label: "Suspended", class: "status-inactive" },
      deleted: { label: "Deleted", class: "status-inactive" },
    };

    const config = styles[status] || {
      label: "Unknown",
      class: "status-unknown",
    };
    return (
      <span className={`status-badge ${config.class}`}>{config.label}</span>
    );
  };

  return (
    <div className="content">
      {/* Dashboard Cards */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3 className="">Active Workers</h3>
            <i className="bi bi-person-check "></i>
          </div>
          <h4 className="card-value">{activeCount}</h4>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-gray-600 text-sm font-medium">Suspended</h3>
            <i className="bi bi-person-x text-red-500 text-3xl"></i>
          </div>
          <h4 className="text-2xl font-bold text-red-600 mt-1">
            {suspendedCount}
          </h4>
        </div>

        <div className="card p-5 bg-yellow-50 shadow rounded-lg border border-yellow-200">
          <div className="card-header">
            <h3 className="text-yellow-800 text-sm font-medium">
              Pending Approval
            </h3>

            <i className="bi bi-clock-history text-yellow-500 text-3xl"></i>
          </div>
          <h4 className="text-2xl font-bold text-yellow-700 mt-1">
            {pendingActions.length}
          </h4>
        </div>
      </div>

      {/* Combined Pending Requests Table */}
      {pendingActions.length > 0 && (
        <div className="card bg-white shadow rounded-lg border overflow-hidden">
          <div className="card-header p-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Pending Requests
            </h3>
          </div>
          <DataTable
            columns={["Name", "Email", "Type", "Reason", "Actions"]}
            rows={pendingActions.map((w) => {
              const isSuspend = renderStatus(w.status)  === "pending_suspend";
              const requestType = isSuspend ? "Suspend" : "Delete";
              const comment = isSuspend ? w.suspend_comment : w.delete_comment;

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
                    {comment ? `"${comment}"` : "No reason provided"}
                  </span>
                ),
                Actions: (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-success bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      onClick={() =>
                        handleApprove(
                          w.user_id,
                          isSuspend ? "suspend" : "delete"
                        )
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-primary border border-gray-400 text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
                      onClick={() =>
                        handleReject(
                          w.user_id,
                          isSuspend ? "suspend" : "delete"
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
      <div className="card bg-white shadow rounded-lg border overflow-hidden">
        <div className="card-header p-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">All Workers</h3>
          <button
            className="btn btn-primary bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
            onClick={() => alert("Add Worker (Coming Soon)")}
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
                      className={`btn btn-primary px-3 py-1 rounded text-white ${
                        isActive
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      onClick={async () => {
                        try {
                          await toggleActive(w.user_id, !isActive);
                          setSuccess(
                            `User ${
                              !isActive ? "suspended" : "activated"
                            } successfully.`
                          );
                          fetchWorkers(); // ← This refreshes the list!
                        } catch {
                          setError(
                            "Failed to update user status. Please try again."
                          );
                        }
                      }}
                    >
                      {isActive ? "Suspend" : "Activate"}
                    </button>
                    <button
                      className="btn btn-danger bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800"
                      onClick={() => handleDelete(w.user_id)}
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
    </div>
  );
};

export default WorkersDashboard;
