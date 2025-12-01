import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import {
  fetchClientInvoices,
  markInvoiceReceived,
  downloadInvoiceFile,
  viewInvoiceFile,
  formatFileSize,
  getFileIcon,
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
  const [showFilesModal, setShowFilesModal] = useState(false);
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

  // Modal open/close for viewing files with comment requirement
  const openFilesModal = (invoice) => {
    setActiveInvoice(invoice);
    
    // If status is "sent", show comment modal first
    if (invoice.status === "sent") {
      setComment("");
      setShowModal(true);
    } else {
      // If status is already "received", show files directly
      setShowFilesModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveInvoice(null);
    setComment("");
  };

  const closeFilesModal = () => {
    setShowFilesModal(false);
    setActiveInvoice(null);
  };

  // Mark invoice as received & download PDF, then show files
  const handleMarkReceivedAndViewFiles = async () => {
    if (!activeInvoice) return alert("No invoice selected.");
    
    setSubmitting(true);
    try {
      // Mark as received and download PDF
      await markInvoiceReceived(activeInvoice.invoice_id, { comment });
      
      alert("✅ Invoice marked as received and downloaded!");
      
      // Close comment modal and open files modal
      closeModal();
      setShowFilesModal(true);
      
      // Refresh invoices to update status
      loadInvoices();
    } catch (err) {
      console.error(err);
      alert("❌ Could not mark invoice as received.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle file download
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      await downloadInvoiceFile(activeInvoice.invoice_id, fileId, fileName);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("❌ Failed to download file.");
    }
  };

  // Handle file viewing
  const handleViewFile = async (fileId, fileUrl) => {
    try {
      await viewInvoiceFile(activeInvoice.invoice_id, fileId, fileUrl);
    } catch (err) {
      console.error("Error viewing file:", err);
      alert("❌ Failed to view file.");
    }
  };

  // Dashboard stats for client
  const stats = {
    total: filteredInvoices.length,
    received: filteredInvoices.filter(inv => inv.status === "received").length,
    pending: filteredInvoices.filter(inv => inv.status === "sent").length,
    withFiles: filteredInvoices.filter(inv => inv.files && inv.files.length > 0).length,
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>My Invoices</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Dashboard Cards for Client */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Total Invoices</h3>
          </div>
          <h4>{stats.total}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Received</h3>
          </div>
          <h4>{stats.received}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Pending Review</h3>
          </div>
          <h4>{stats.pending}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>With Files</h3>
          </div>
          <h4>{stats.withFiles}</h4>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Invoices</h3>
          <div className="filters-container">
            <div className="filter-group">
              <label>Filter by Month:</label>
              <input
                type="month"
                className="filter-select"
                value={selectedMonth}
                onChange={handleMonthChange}
                disabled={loading}
              />
            </div>
            <div className="filter-group">
              <label>Filtered Results:</label>
              <div className="filter-stats">
                {filteredInvoices.length} invoices
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading invoices...</div>
        ) : filteredInvoices.length > 0 ? (
          <DataTable
            columns={[
              "Hotel",
              "Month",
              "Files",
              "Status",
              "Comment",
              "Actions",
            ]}
            rows={filteredInvoices.map((inv) => ({
              Hotel: inv.hotel_name || "-",
              Month: `${inv.month}/${inv.year}`,
              Files: (
                <div className="files-info">
                  <span className="file-count">
                    {inv.files ? inv.files.length : 0} files
                  </span>
                </div>
              ),
              Status: (
                <span
                  className={`status-badge ${
                    inv.status === "sent"
                      ? "sent"
                      : inv.status === "received"
                      ? "received"
                      : "pending"
                  }`}
                >
                  {inv.status}
                </span>
              ),
              Comment: inv.comment || "-",
              Actions: (
                <div className="action-buttons">
                  {inv.files && inv.files.length > 0 && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openFilesModal(inv)}
                      title={inv.status === "sent" ? "Mark as Received & View Files" : "View Files"}
                    >
                      {inv.status === "sent" ? "✓ View Files" : "📎 View Files"}
                    </button>
                  )}
                </div>
              ),
            }))}
          />
        ) : (
          <div className="no-data">No invoices found for this month.</div>
        )}
      </div>

      {/* Comment Modal (shown when status is "sent") */}
      {showModal && activeInvoice && activeInvoice.status === "sent" && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Invoice Receipt</h3>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Hotel:</label>
                <input type="text" value={activeInvoice.hotel_name} readOnly />
              </div>
              <div className="form-group">
                <label>Month:</label>
                <input type="text" value={`${activeInvoice.month}/${activeInvoice.year}`} readOnly />
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
              <div className="warning-message">
                ⚠️ By proceeding, you confirm that you have received this invoice. 
                The invoice will be marked as received and a PDF will be downloaded automatically.
                You will then be able to view all attached files.
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleMarkReceivedAndViewFiles}
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Confirm & View Files"}
              </button>
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Files Modal */}
      {showFilesModal && activeInvoice && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Invoice Files - {activeInvoice.hotel_name}</h3>
              <button className="btn-close" onClick={closeFilesModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="invoice-info">
                <p><strong>Status:</strong> <span className={`status-badge ${activeInvoice.status === "received" ? "received" : "sent"}`}>{activeInvoice.status}</span></p>
                {activeInvoice.comment && (
                  <p><strong>Your Comment:</strong> {activeInvoice.comment}</p>
                )}
              </div>
              
              {activeInvoice.files && activeInvoice.files.length > 0 ? (
                <div className="files-list">
                  <h4>Attached Files ({activeInvoice.files.length})</h4>
                  {activeInvoice.files.map((file) => (
                    <div key={file.id} className="file-item">
                      <div className="file-info">
                        <span className="file-icon">{getFileIcon(file.name)}</span>
                        <div>
                          <span className="file-name">{file.name}</span>
                          <span className="file-meta">
                            {file.size ? formatFileSize(file.size) : 'Unknown size'} • 
                            {new Date(file.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="file-actions">
                        <button
                          className="btn-link"
                          onClick={() => handleViewFile(file.id, file.url)}
                          title="View File"
                        >
                          View
                        </button>
                        <button
                          className="btn-link"
                          onClick={() => handleDownloadFile(file.id, file.name)}
                          title="Download File"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No files available for this invoice.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeFilesModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-cards {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .dashboard-cards .card {
          flex: 1;
          padding: 1rem;
          border-radius: 8px;
          background: #f8f9fa;
          text-align: center;
        }
        .filters-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: end;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .filter-stats {
          padding: 0.5rem;
          background: #e9ecef;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
        }
        .status-badge {
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          text-transform: capitalize;
          font-size: 0.8rem;
        }
        .status-badge.sent { background: #cce5ff; color: #004085; }
        .status-badge.received { background: #d4edda; color: #155724; }
        .status-badge.pending { background: #fff3cd; color: #856404; }
        .files-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .file-count {
          font-weight: bold;
        }
        .action-buttons {
          display: flex;
          gap: 0.3rem;
          flex-wrap: wrap;
        }
        .btn-sm {
          padding: 0.2rem 0.5rem;
          font-size: 0.8rem;
        }
        .btn-link {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          text-decoration: underline;
          font-size: 0.8rem;
          padding: 0.2rem 0.5rem;
        }
        .btn-link:hover {
          background: #f8f9fa;
          border-radius: 4px;
        }
        .files-list {
          max-height: 400px;
          overflow-y: auto;
          margin-top: 1rem;
        }
        .files-list h4 {
          margin-bottom: 1rem;
          color: #333;
        }
        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-bottom: 1px solid #eee;
        }
        .file-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        .file-icon {
          font-size: 1.2rem;
        }
        .file-name {
          font-weight: bold;
          display: block;
        }
        .file-meta {
          font-size: 0.8rem;
          color: #666;
          display: block;
        }
        .file-actions {
          display: flex;
          gap: 0.75rem;
        }
        .invoice-info {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .invoice-info p {
          margin: 0.5rem 0;
        }
        .warning-message {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 0.75rem;
          border-radius: 4px;
          margin: 1rem 0;
        }
        .modal { 
          position: fixed; top:0; left:0; right:0; bottom:0; 
          background: rgba(0,0,0,0.5); display:flex; 
          justify-content:center; align-items:center; z-index:1000; padding:20px; 
        }
        .modal-content { 
          background:#fff; border-radius:10px; padding:20px; 
          max-width:600px; width:100%; position:relative; 
        }
        .modal-header { 
          display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; 
        }
        .modal-body { display:flex; flex-direction:column; gap:10px; }
        .btn-close { background:none; border:none; font-size:1.3rem; cursor:pointer; }
        .error-message { color:red; margin-bottom:10px; }
      `}</style>
    </div>
  );
};

export default ClientInvoices;