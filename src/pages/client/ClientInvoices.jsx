import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import {
  fetchClientInvoices,
  markInvoiceReceived,
} from "../../services/client/invoiceService";

const ClientInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Default selected month = current month
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load invoices for logged-in client
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const clientId = localStorage.getItem("userId");
      if (!clientId) throw new Error("Not logged in");

      const data = await fetchClientInvoices();
      const clientInvoices = Array.isArray(data)
        ? data.filter((inv) => String(inv.client) === String(clientId))
        : [];
      setInvoices(clientInvoices);
    } catch (err) {
      console.error(err);
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  // Handle month change
  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  // Filter invoices by selected month
  const filteredInvoices = invoices.filter((inv) => {
    const invMonthYear = `${inv.year}-${String(inv.month).padStart(2, "0")}`;
    return invMonthYear === selectedMonth;
  });

  // Modal open/close
  const openModal = (invoice) => {
    setActiveInvoice(invoice);
    setComment("");
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setActiveInvoice(null);
    setComment("");
  };

  // Mark invoice as received & optionally download PDF
  const handleMarkReceived = async () => {
    if (!activeInvoice) return alert("No invoice selected.");
    setSubmitting(true);
    try {
      await markInvoiceReceived(activeInvoice.invoice_id, { comment });
      alert("✅ Invoice marked as received and downloaded!");
      closeModal();
      loadInvoices();
    } catch (err) {
      console.error(err);
      alert("❌ Could not mark invoice as received.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>My Invoices</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Invoices</h3>
          <div
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label style={{ marginRight: "0.5rem" }}>Filter by Month:</label>
            <input
              type="month"
              className="filter-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              disabled={loading}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading invoices...</div>
        ) : filteredInvoices.length > 0 ? (
          <DataTable
            columns={[
              "Hotel",
              "Amount",
              "Month",
              "Status",
              "Comment",
              "Action",
            ]}
            rows={filteredInvoices.map((inv) => ({
              Hotel: inv.hotel_name || "-",
              Amount: `Tsh ${Number(inv.amount).toLocaleString()}`,
              Month: `${inv.month}/${inv.year}`,
              Status: (
                <span
                  className={`status-badge ${
                    inv.status === "sent"
                      ? "sent"
                      : inv.status === "received" || inv.is_received
                      ? "received"
                      : "pending"
                  }`}
                >
                  {inv.is_received ? "received" : inv.status}
                </span>
              ),
              Comment: inv.comment || "-",
              // Show button only if status is "sent" AND is_received is false
              Action: inv.status === "sent" && !inv.is_received && (
                <button
                  className="btn btn-outline"
                  onClick={() => openModal(inv)}
                >
                  View Invoice
                </button>
              ),
            }))}
          />
        ) : (
          <div className="no-data">No invoices found for this month.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && activeInvoice && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Mark Invoice as Received</h3>
              <button className="btn-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Hotel:</label>
                <input type="text" value={activeInvoice.hotel_name} readOnly />
              </div>
              <div className="form-group">
                <label>Message (optional):</label>
                <textarea
                  rows={4}
                  placeholder="Leave a note for the admin..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleMarkReceived}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Mark as Received & Download PDF"}
              </button>
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .status-badge {
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          text-transform: capitalize;
        }
        .status-badge.sent { background: #cce5ff; color: #004085; }
        .status-badge.received { background: #d4edda; color: #155724; }
        .status-badge.pending { background: #fff3cd; color: #856404; }

        .modal { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5);
        display:flex; justify-content:center; align-items:center; z-index:1000; padding:20px; }
        .modal-content { background:#fff; border-radius:10px; padding:20px; max-width:600px; width:100%; position:relative; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; }
        .modal-body { display:flex; flex-direction:column; gap:10px; }
        .btn-close { background:none; border:none; font-size:1.3rem; cursor:pointer; }
        .error-message { color:red; margin-bottom:10px; }
      `}</style>
    </div>
  );
};

export default ClientInvoices;
