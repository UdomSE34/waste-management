import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import {
  fetchPaymentSlips,
  addPaymentSlip,
  updatePaymentSlip,
  deletePaymentSlip,
} from "../../services/client/paymentSlipService";

const PaymentSlips = () => {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [activeSlip, setActiveSlip] = useState(null);

  const [newSlip, setNewSlip] = useState({
    client: "",
    month_paid: "",
    status: "current",
    comment: "",
    file: null,
  });

  const [editSlip, setEditSlip] = useState({
    slip_id: "",
    month_paid: "",
    status: "current",
    comment: "",
    file: null,
  });

  const navigate = useNavigate();

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Pre-fill client ID
  useEffect(() => {
    const clientId = localStorage.getItem("userId");
    if (!clientId) {
      alert("You must log in to access this page.");
      navigate("/login");
      return;
    }
    setNewSlip((prev) => ({ ...prev, client: clientId }));
  }, [navigate]);

  // Load only the logged-in client’s payment slips
  useEffect(() => {
    loadSlips();
  }, []);

  const loadSlips = async () => {
    clearMessages();
    setLoading(true);
    try {
      const clientId = localStorage.getItem("userId");
      const data = await fetchPaymentSlips();
      const clientSlips = Array.isArray(data)
        ? data.filter((s) => String(s.client) === String(clientId))
        : [];
      setSlips(clientSlips);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load payment slips.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Slip
  const handleAddSlip = async (e) => {
    e.preventDefault();
    clearMessages();
    setBtnLoading(true);

    try {
      const formData = new FormData();
      let formattedMonth = newSlip.month_paid;
      if (formattedMonth?.length === 7) formattedMonth = `${formattedMonth}-01`;

      formData.append("client", newSlip.client);
      formData.append("month_paid", formattedMonth);
      formData.append("status", newSlip.status);
      formData.append("comment", newSlip.comment);
      if (newSlip.file) formData.append("file", newSlip.file);

      await addPaymentSlip(formData);

      setShowAddModal(false);
      setNewSlip({
        client: localStorage.getItem("userId"),
        month_paid: "",
        status: "current",
        comment: "",
        file: null,
      });
      setSuccess("✅ Payment slip added successfully!");
      await loadSlips();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add payment slip.");
    } finally {
      setBtnLoading(false);
    }
  };

  // Handle Edit Slip
  const handleEditSlipSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setBtnLoading(true);

    try {
      const formData = new FormData();
      let formattedMonth = editSlip.month_paid;
      if (formattedMonth?.length === 7) formattedMonth = `${formattedMonth}-01`;

      formData.append("month_paid", formattedMonth);
      formData.append("status", editSlip.status);
      formData.append("comment", editSlip.comment);
      if (editSlip.file) formData.append("file", editSlip.file);

      await updatePaymentSlip(editSlip.slip_id, formData);

      setShowEditModal(false);
      setEditSlip({
        slip_id: "",
        month_paid: "",
        status: "current",
        comment: "",
        file: null,
      });
      setSuccess("✅ Payment slip updated successfully!");
      await loadSlips();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to update payment slip.");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value, files } = e.target;
    const val = name === "file" ? files[0] : value;
    if (isEdit) setEditSlip((prev) => ({ ...prev, [name]: val }));
    else setNewSlip((prev) => ({ ...prev, [name]: val }));
  };

  // View files securely
  const handleViewFile = async (fileUrl) => {
    if (!fileUrl) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(fileUrl, { headers: { Authorization: `Token ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error opening file:", err);
      alert("Failed to open file.");
    }
  };

  const handleDeleteSlip = async (slipId) => {
    if (!window.confirm("Are you sure you want to delete this slip?")) return;
    try {
      await deletePaymentSlip(slipId);
      setSuccess("✅ Slip deleted!");
      await loadSlips();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to delete slip.");
    }
  };

  const openEditModal = (slip) => {
    setEditSlip({
      slip_id: slip.slip_id,
      month_paid: slip.month_paid?.slice(0, 7) || "",
      status: slip.status,
      comment: slip.comment || "",
      file: null,
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (slip) => {
    setActiveSlip(slip);
    setShowDetailsModal(true);
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>Payment Slips</h2>
      </div>

      {success && <div className="success-message" onClick={() => setSuccess("")}>{success}</div>}
      {error && <div className="error-message" onClick={() => setError("")}>{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Payment Slips</h3>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Payment Slip</button>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading payment slips...</div>
        ) : (
          <DataTable
            columns={["Month", "Paid For", "File", "Receipt", "Comment", "Actions"]}
            rows={slips.map((s) => ({
              Month: s.month_paid || "-",
              "Paid For": s.status === "current" ? "Current Month" : "Previous Month",
              File: (
                <button className="btn btn-outline" onClick={() => handleViewFile(s.file)}>View Slip</button>
              ),
              Receipt: s.receipt ? (
                <button className="btn btn-outline" onClick={() => handleViewFile(s.receipt)}>View Receipt</button>
              ) : (
                <i style={{ color: "#999" }}>No receipt</i>
              ),
              Comment: (
                <button className="btn btn-sm btn-outline" onClick={() => openDetailsModal(s)}>
                  View Details
                </button>
              ),
              Actions: (
                <>
                  <button className="btn btn-outline" onClick={() => openEditModal(s)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSlip(s.slip_id)}>Delete</button>
                </>
              ),
            }))}
          />
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header"><h3>Add Payment Slip</h3></div>
            <form onSubmit={handleAddSlip}>
              <div className="form-group">
                <label>Month</label>
                <input type="month" name="month_paid" value={newSlip.month_paid} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Paid For</label>
                <select name="status" value={newSlip.status} onChange={handleInputChange}>
                  <option value="current">Current Month</option>
                  <option value="previous">Previous Month</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea name="comment" value={newSlip.comment} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>File (PDF/Image)</label>
                <input type="file" name="file" accept=".pdf,image/*" onChange={handleInputChange} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={btnLoading}>{btnLoading ? "Uploading..." : "Upload"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header"><h3>Edit Payment Slip</h3></div>
            <form onSubmit={handleEditSlipSubmit}>
              <div className="form-group">
                <label>Month</label>
                <input type="month" name="month_paid" value={editSlip.month_paid} onChange={(e) => handleInputChange(e, true)} required />
              </div>
              <div className="form-group">
                <label>Paid For</label>
                <select name="status" value={editSlip.status} onChange={(e) => handleInputChange(e, true)}>
                  <option value="current">Current Month</option>
                  <option value="previous">Previous Month</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea name="comment" value={editSlip.comment} onChange={(e) => handleInputChange(e, true)} />
              </div>
              <div className="form-group">
                <label>File (PDF/Image)</label>
                <input type="file" name="file" accept=".pdf,image/*" onChange={(e) => handleInputChange(e, true)} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={btnLoading}>{btnLoading ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && activeSlip && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Slip Details</h3>
              <button className="btn-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Month:</strong> {activeSlip.month_paid}</p>
              <p><strong>Paid For:</strong> {activeSlip.status === "current" ? "Current Month" : "Previous Month"}</p>
              <p><strong>Your Comment:</strong></p>
              <div className="comment-box">{activeSlip.comment || "No comment"}</div>
              <p><strong>Admin Comment:</strong></p>
              <div className="comment-box">{activeSlip.admin_comment || "No admin comment yet"}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5);
          display:flex; justify-content:center; align-items:center; z-index:1000; padding:20px; }
        .modal-content { background:#fff; border-radius:10px; padding:20px; max-width:600px; width:100%; position:relative; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; }
        .modal-body { display:flex; flex-direction:column; gap:10px; }
        .btn-close { background:none; border:none; font-size:1.3rem; cursor:pointer; }
        .comment-box { background:#f9f9f9; border:1px solid #ddd; padding:10px; border-radius:6px; white-space:pre-wrap; }
      `}</style>
    </div>
  );
};

export default PaymentSlips;
