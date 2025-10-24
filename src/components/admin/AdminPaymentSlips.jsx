import { useEffect, useState } from "react";
import DataTable from "../admin/DataTable";
import { fetchPaymentSlips, updatePaymentSlip } from "../../services/admin/paymentSlipService";
import { fetchHotels } from "../../services/admin/hotelService";

const AdminPaymentSlips = () => {
  const [slips, setSlips] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Active slip states
  const [activeSlip, setActiveSlip] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadHotels();
    loadSlips();
  }, []);

  const clearError = () => setError("");

  const loadHotels = async () => {
    try {
      const data = await fetchHotels();
      setHotels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load hotels:", err);
      setError("Failed to load hotels.");
    }
  };

  const loadSlips = async (month = "") => {
    clearError();
    setLoading(true);
    try {
      const data = await fetchPaymentSlips(month);
      let filtered = Array.isArray(data) ? data : [];
      if (month) filtered = filtered.filter((slip) => slip.month_paid?.startsWith(month));
      setSlips(filtered);
    } catch (err) {
      console.error("Failed to load payment slips:", err);
      setError("Failed to load payment slips.");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    loadSlips(month);
  };

  const getFileUrl = (slip, key) =>
    slip[`${key}_url`] || slip[key] || slip[`${key}Url`] || slip[`${key}URL`] || null;

  const handleViewFile = async (fileUrl) => {
    if (!fileUrl) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(fileUrl, { headers: { Authorization: `Token ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("Error opening file:", err);
      alert("Failed to open file. You may not have permission.");
    }
  };

  const openModal = (slip) => {
    setActiveSlip(slip);
    setNewAmount(slip.amount ?? "");
    setAdminComment(slip.admin_comment ?? "");
    setReceiptFile(null);
    setShowModal(true);
  };

  const openDetailsModal = (slip) => {
    setActiveSlip(slip);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveSlip(null);
    setNewAmount("");
    setAdminComment("");
    setReceiptFile(null);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setActiveSlip(null);
  };

  const handleSaveChanges = async () => {
    if (!activeSlip) return;

    const slipId = activeSlip.slip_id ?? activeSlip.id;
    const amountChanged = newAmount !== "" && parseFloat(newAmount) !== parseFloat(activeSlip.amount ?? 0);
    const receiptChanged = !!receiptFile;
    const commentChanged = adminComment.trim() !== (activeSlip.admin_comment ?? "").trim();

    if (!amountChanged && !receiptChanged && !commentChanged) {
      alert("Please make at least one change before saving.");
      return;
    }

    setSubmitting(true);
    try {
      await updatePaymentSlip(slipId, {
        amount: amountChanged ? parseFloat(newAmount) : undefined,
        receiptFile: receiptChanged ? receiptFile : undefined,
        adminComment: commentChanged ? adminComment : undefined,
      });

      await loadSlips(selectedMonth);
      alert("Payment slip updated successfully!");
      closeModal();
    } catch (err) {
      console.error("Error updating slip:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to update slip";
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getHotelName = (clientId) => hotels.find((h) => h.client === clientId)?.name || "-";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("en-US", { month: "long", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>All Hotel Payment Slips</h2>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError} className="btn-close">×</button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Payment Slips</h3>
          <div className="filter-section">
            <label htmlFor="month-filter">Filter by Month: </label>
            <input id="month-filter" className="filter-select" type="month" value={selectedMonth} onChange={handleMonthChange} />
            <button className="btn btn-sm" onClick={() => { setSelectedMonth(""); loadSlips(); }} disabled={!selectedMonth}>
              Clear Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading payment slips...</div>
        ) : slips.length > 0 ? (
          <DataTable
            columns={["Hotel Name","Month","Amount","Status","File","Receipt","Details","Action"]}
            rows={slips.map((slip) => {
              const slipFile = getFileUrl(slip, "file");
              const receiptFileUrl = getFileUrl(slip, "receipt");

              return {
                "Hotel Name": getHotelName(slip.client),
                Month: formatDate(slip.month_paid),
                Amount: `Tsh ${Number(slip.amount ?? 0).toLocaleString()}`,
                Status: <span className={`status-badge ${slip.status === "current" ? "current" : "past"}`}>{slip.status || "Unknown"}</span>,
                File: slipFile ? <button className="btn  btn-outline" onClick={() => handleViewFile(slipFile)}> Slip</button> : <i style={{ color: "#999" }}>No file</i>,
                Receipt: receiptFileUrl ? <button className="btn btn-outline" onClick={() => handleViewFile(receiptFileUrl)}> Receipt</button> : <i style={{ color: "#999" }}>No receipt</i>,
                Details: (
                  <button className="btn btn-outline" onClick={() => openDetailsModal(slip)}>
                    Comments
                  </button>
                ),
                Action: (
                  <button className="btn btn-outline" onClick={() => openModal(slip)}>
                    Manage
                  </button>
                ),
              };
            })}
          />
        ) : (
          <div className="no-data">{selectedMonth ? `No payment slips for ${formatDate(selectedMonth)}` : "No payment slips found"}</div>
        )}
      </div>

      {/* 🗂 DETAILS MODAL */}
      {showDetailsModal && activeSlip && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>Slip Comments</h3>
              <button className="btn-close" onClick={closeDetailsModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label><strong>Client Comment:</strong></label>
                <div className="form-control">
                  {activeSlip.comment ? activeSlip.comment : <i>No comment from client</i>}
                </div>
              </div>
              <div className="form-group">
                <label><strong>Admin Comment:</strong></label>
                <div className="form-control">
                  {activeSlip.admin_comment ? activeSlip.admin_comment : <i>No admin comment</i>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetailsModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Manage Modal */}
      {showModal && activeSlip && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>Manage Payment Slip</h3>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Hotel:</label>
                <div className="form-control">{getHotelName(activeSlip.client)}</div>
              </div>
              <div className="form-group">
                <label>Month Paid:</label>
                <div className="form-control">{formatDate(activeSlip.month_paid)}</div>
              </div>
              <div className="form-group">
                <label>Update Amount (Tsh):</label>
                <input type="number" step="0.01" min="0" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="form-control" />
                <small>Current: Tsh {Number(activeSlip.amount ?? 0).toLocaleString()}</small>
              </div>
              <div className="form-group">
                <label>Upload New Receipt:</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setReceiptFile(e.target.files[0])} className="form-control" />
              </div>
              <div className="form-group">
                <label>Admin Comment:</label>
                <textarea rows="4" value={adminComment} onChange={(e) => setAdminComment(e.target.value)} className="form-control" placeholder="Comment visible to client" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSaveChanges} disabled={submitting}>
                {submitting ? "⏳ Saving..." : "💾 Save Changes"}
              </button>
              <button className="btn btn-secondary" onClick={closeModal} disabled={submitting}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; padding:20px; z-index:1000; }
        .modal-content { background:#fff; padding:1.5rem; border-radius:10px; width:700px; max-width:95%; max-height:90vh; overflow-y:auto; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid #eee; }
        .modal-body { display:flex; flex-direction:column; gap:1rem; }
        .modal-footer { display:flex; justify-content:flex-end; gap:1rem; margin-top:1.5rem; border-top:1px solid #eee; }
        .form-group { display:flex; flex-direction:column; gap:0.5rem; }
        .form-control { padding:0.5rem; border:1px solid #ddd; border-radius:4px; font-size:0.9rem; background:#f5f5f5; white-space:pre-wrap; }
        .btn { padding:0.5rem 1rem; border:1px solid #ddd; border-radius:4px; cursor:pointer; font-size:0.9rem; transition:all 0.2s; }
        .btn-outline { background:transparent; color:#007bff; border-color:#007bff; }
        .btn-outline:hover { background:#007bff; color:white; }
        .btn-sm { padding:0.25rem 0.5rem; font-size:0.8rem; }
        .btn-primary { background:#007bff; color:white; border-color:#007bff; }
        .btn-secondary { background:#6c757d; color:white; border-color:#6c757d; }
        .status-badge.current { background:#e8f5e8; color:#2e7d32; }
        .status-badge.past { background:#fff3cd; color:#856404; }
      `}</style>
    </div>
  );
};

export default AdminPaymentSlips;
