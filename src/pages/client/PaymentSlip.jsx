import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import {
  fetchPaymentSlips,
  addPaymentSlip,
  updatePaymentSlip,
  deletePaymentSlip,
} from "../../services/client/paymentSlipService";

const BACKEND_URL = "https://back.deploy.tz"; // Your deployed backend

const PaymentSlips = () => {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const [modals, setModals] = useState({
    add: false,
    edit: false,
    details: false,
  });

  const [activeSlip, setActiveSlip] = useState(null);
  const [newSlip, setNewSlip] = useState({ client: "", month_paid: "", status: "current", comment: "", file: null });
  const [editSlip, setEditSlip] = useState({ slip_id: "", month_paid: "", status: "current", comment: "", file: null });

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

  // Load payment slips
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

  // Handle input changes
  const handleInputChange = (e, isEdit = false) => {
    const { name, value, files } = e.target;
    const val = name === "file" ? files[0] : value;
    if (isEdit) setEditSlip((prev) => ({ ...prev, [name]: val }));
    else setNewSlip((prev) => ({ ...prev, [name]: val }));
  };

  // Handle add/edit
  const handleSubmit = async (isEdit = false) => {
    clearMessages();
    setBtnLoading(true);
    try {
      const slip = isEdit ? editSlip : newSlip;
      const formData = new FormData();
      const formattedMonth = slip.month_paid?.length === 7 ? `${slip.month_paid}-01` : slip.month_paid;
      if (!isEdit) formData.append("client", slip.client);
      formData.append("month_paid", formattedMonth);
      formData.append("status", slip.status);
      formData.append("comment", slip.comment);
      if (slip.file) formData.append("file", slip.file);

      if (isEdit) await updatePaymentSlip(editSlip.slip_id, formData);
      else await addPaymentSlip(formData);

      setModals((prev) => ({ ...prev, [isEdit ? "edit" : "add"]: false }));
      if (isEdit) setEditSlip({ slip_id: "", month_paid: "", status: "current", comment: "", file: null });
      else setNewSlip({ client: localStorage.getItem("userId"), month_paid: "", status: "current", comment: "", file: null });

      setSuccess(isEdit ? "✅ Payment slip updated successfully!" : "✅ Payment slip added successfully!");
      await loadSlips();
    } catch (err) {
      console.error(err);
      setError(isEdit ? "❌ Failed to update payment slip." : "❌ Failed to add payment slip.");
    } finally {
      setBtnLoading(false);
    }
  };

  // View files securely
const handleViewFile = async (filePath) => {
  if (!filePath) return alert("No file uploaded yet.");

  // Ensure HTTPS
  let fileUrl;
  if (filePath.startsWith("http")) {
    fileUrl = filePath.replace(/^http:\/\//i, "https://"); // force HTTPS
  } else {
    fileUrl = `${BACKEND_URL}/media/${filePath.replace(/^\/?media\/?/, '')}`;
  }

  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(fileUrl, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) {
      if (res.status === 404) throw new Error("File not found on server.");
      throw new Error("Failed to fetch file.");
    }
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), "_blank");
  } catch (err) {
    console.error("Error opening file:", err);
    alert(err.message);
  }
};


  // Delete slip
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
    setModals((prev) => ({ ...prev, edit: true }));
  };

  const openDetailsModal = (slip) => {
    setActiveSlip(slip);
    setModals((prev) => ({ ...prev, details: true }));
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
          <button className="btn btn-primary" onClick={() => setModals((prev) => ({ ...prev, add: true }))}>+ Add Payment Slip</button>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading payment slips...</div>
        ) : (
          <DataTable
            columns={["Month", "Paid For", "File", "Receipt", "Comment", "Actions"]}
            rows={slips.map((s) => ({
              Month: s.month_paid || "-",
              "Paid For": s.status === "current" ? "Current Month" : "Previous Month",
              File: <button className="btn btn-outline" onClick={() => handleViewFile(s.file)}>View Slip</button>,
              Receipt: s.receipt ? <button className="btn btn-outline" onClick={() => handleViewFile(s.receipt)}>View Receipt</button> : <i style={{ color: "#999" }}>No receipt</i>,
              Comment: <button className="btn btn-sm btn-outline" onClick={() => openDetailsModal(s)}>View Details</button>,
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

      {/* Add/Edit Modal */}
      {["add", "edit"].map((type) => {
        const isEdit = type === "edit";
        const slip = isEdit ? editSlip : newSlip;
        return modals[type] && (
          <div className="modal" key={type}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{isEdit ? "Edit" : "Add"} Payment Slip</h3>
                <button className="btn-close" onClick={() => setModals((prev) => ({ ...prev, [type]: false }))}>×</button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(isEdit); }}>
                <div className="form-group">
                  <label>Month</label>
                  <input type="month" name="month_paid" value={slip.month_paid} onChange={(e) => handleInputChange(e, isEdit)} required />
                </div>
                <div className="form-group">
                  <label>Paid For</label>
                  <select name="status" value={slip.status} onChange={(e) => handleInputChange(e, isEdit)}>
                    <option value="current">Current Month</option>
                    <option value="previous">Previous Month</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea name="comment" value={slip.comment} onChange={(e) => handleInputChange(e, isEdit)} />
                </div>
                <div className="form-group">
                  <label>File (PDF/Image)</label>
                  <input type="file" name="file" accept=".pdf,image/*" onChange={(e) => handleInputChange(e, isEdit)} {...(!isEdit && { required: true })} />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setModals((prev) => ({ ...prev, [type]: false }))}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={btnLoading}>{btnLoading ? (isEdit ? "Saving..." : "Uploading...") : (isEdit ? "Save Changes" : "Upload")}</button>
                </div>
              </form>
            </div>
          </div>
        );
      })}

      {/* Details Modal */}
      {modals.details && activeSlip && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Slip Details</h3>
              <button className="btn-close" onClick={() => setModals((prev) => ({ ...prev, details: false }))}>×</button>
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
        .modal { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000; padding:20px; }
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
