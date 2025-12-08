import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import {
  fetchInvoices,
  sendInvoice,
  generateInvoicesForMonth,
  uploadInvoiceFiles,
  removeInvoiceFile,
  downloadInvoiceFiles,
  downloadInvoiceFile,
  updateInvoiceStatus,
  getInvoiceStats,
  bulkSendInvoices,
  formatFileSize,
  getFileIcon,
  validateFile
} from "../../services/admin/invoiceService";
import { fetchHotels } from "../../services/admin/hotelService";

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({
    total_invoices: 0,
    sent_invoices: 0,
    received_invoices: 0,
    invoices_with_files: 0
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);

  // Load hotels once
  useEffect(() => {
    loadHotels();
    loadStats();
  }, []);

  // Load invoices whenever month changes
  useEffect(() => {
    if (selectedMonth) loadInvoices(selectedMonth);
  }, [selectedMonth]);

  // Fetch hotels
  const loadHotels = async () => {
    try {
      const data = await fetchHotels();
      setHotels(data);
    } catch (err) {
      console.error("Failed to load hotels:", err);
      setError("Failed to load hotels.");
    }
  };

  // Load invoice statistics
  const loadStats = async () => {
    try {
      const data = await getInvoiceStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  // Load invoices and generate defaults for the month
  const loadInvoices = async (month) => {
    setLoading(true);
    setError("");
    try {
      const [year, monthNum] = month.split("-").map(Number);
      await generateInvoicesForMonth({ year, month: monthNum });
      const data = await fetchInvoices();
      setInvoices(Array.isArray(data) ? data : []);
      await loadStats(); // Refresh stats after loading invoices
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  // Month filter
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Status filter
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // Filter invoices by month & status
  const filteredInvoices = invoices.filter((i) => {
    const matchesMonth =
      !selectedMonth ||
      `${i.year}-${String(i.month).padStart(2, "0")}` === selectedMonth;

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "not_received" ? i.status !== 'received' : i.status === statusFilter);

    return matchesMonth && matchesStatus;
  });

  // Compute dashboard stats from filtered invoices
  const filteredStats = {
    sent: filteredInvoices.filter((i) => i.status === "sent").length,
    notSent: filteredInvoices.filter((i) => i.status === "not_sent").length,
    received: filteredInvoices.filter((i) => i.status === "received").length,
    notReceived: filteredInvoices.filter((i) => i.status !== "received").length,
    withFiles: filteredInvoices.filter((i) => i.files && i.files.length > 0).length,
  };

  // ✅ FIX: Handle file viewing with proper URL correction
  const handleViewFile = (fileUrl, fileName) => {
    console.log("Original file URL:", fileUrl);
    
    let correctedUrl = fileUrl;
    
    // If URL contains localhost:5173 (React server), redirect to Django server
    if (fileUrl.includes('localhost:5173')) {
      correctedUrl = fileUrl.replace('http://localhost:5173', 'https://back.deploy.tz');
    } 
    // If it's a relative URL starting with /media/, prepend Django server
    else if (fileUrl.startsWith('/media/')) {
      correctedUrl = `https://back.deploy.tz${fileUrl}`;
    }
    // If it's a relative URL without /media/, prepend Django server and /media/
    else if (fileUrl.startsWith('/') && !fileUrl.startsWith('/media/')) {
      correctedUrl = `/media${fileUrl}`;
    }
    
    console.log("Corrected file URL:", correctedUrl);
    window.open(correctedUrl, '_blank');
  };

  // Open modal to send invoice
  const openSendModal = (invoice) => {
    setActiveInvoice(invoice);
    setShowModal(true);
  };

  const closeSendModal = () => {
    setShowModal(false);
    setActiveInvoice(null);
  };

  // Open modal to view files
  const openFilesModal = (invoice) => {
    setActiveInvoice(invoice);
    setShowFilesModal(true);
  };

  const closeFilesModal = () => {
    setShowFilesModal(false);
    setActiveInvoice(null);
  };

  // Open modal to upload files
  const openUploadModal = (invoice) => {
    setActiveInvoice(invoice);
    setSelectedFiles([]);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setActiveInvoice(null);
    setSelectedFiles([]);
  };

  // Open bulk send modal
  const openBulkModal = () => {
    // Select all invoices with files that haven't been sent
    const eligibleInvoices = filteredInvoices.filter(
      inv => inv.files && inv.files.length > 0 && inv.status !== 'sent'
    );
    setSelectedInvoices(eligibleInvoices.map(inv => inv.invoice_id));
    setShowBulkModal(true);
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setSelectedInvoices([]);
  };

  // Handle file selection with validation
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      try {
        validateFile(file, 50); // 50MB max size
        validFiles.push(file);
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      alert(`Some files were rejected:\n${errors.join('\n')}`);
    }

    setSelectedFiles(validFiles);
  };

  // Upload files to invoice
  const handleUploadFiles = async () => {
    if (!activeInvoice || selectedFiles.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    setUploading(true);
    try {
      await uploadInvoiceFiles(activeInvoice.invoice_id, selectedFiles);
      alert("✅ Files uploaded successfully!");
      closeUploadModal();
      loadInvoices(selectedMonth); // Refresh invoices
    } catch (err) {
      console.error("Error uploading files:", err);
      alert("❌ Failed to upload files.");
    } finally {
      setUploading(false);
    }
  };

  // Remove file from invoice
  const handleRemoveFile = async (fileId) => {
    if (!activeInvoice || !fileId) return;

    if (!window.confirm("Are you sure you want to remove this file?")) return;

    try {
      await removeInvoiceFile(activeInvoice.invoice_id, fileId);
      alert("✅ File removed successfully!");
      loadInvoices(selectedMonth); // Refresh invoices
    } catch (err) {
      console.error("Error removing file:", err);
      alert("❌ Failed to remove file.");
    }
  };

  // Download individual file
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      await downloadInvoiceFile(activeInvoice.invoice_id, fileId);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("❌ Failed to download file.");
    }
  };

  // Download all files as zip
  const handleDownloadFiles = async (invoice) => {
    try {
      await downloadInvoiceFiles(invoice.invoice_id);
    } catch (err) {
      console.error("Error downloading files:", err);
      alert("❌ Failed to download files.");
    }
  };

  // Send invoice
  const handleSendInvoice = async () => {
    if (!activeInvoice) return alert("No invoice selected.");

    // Check if invoice has files
    if (!activeInvoice.files || activeInvoice.files.length === 0) {
      alert("Please upload files before sending the invoice.");
      return;
    }

    setSubmitting(true);
    try {
      await sendInvoice(activeInvoice.invoice_id);
      alert("✅ Invoice sent successfully!");
      closeSendModal();
      loadInvoices(selectedMonth);
    } catch (err) {
      console.error("Error sending invoice:", err);
      alert("❌ Failed to send invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk send invoices
  const handleBulkSend = async () => {
    if (selectedInvoices.length === 0) {
      alert("Please select invoices to send.");
      return;
    }

    setBulkSending(true);
    try {
      const result = await bulkSendInvoices(selectedInvoices);
      alert(`✅ ${result.results.filter(r => !r.error).length} invoices sent successfully!`);
      closeBulkModal();
      loadInvoices(selectedMonth);
    } catch (err) {
      console.error("Error bulk sending invoices:", err);
      alert("❌ Failed to send some invoices.");
    } finally {
      setBulkSending(false);
    }
  };

  // Update invoice status (for admin actions like marking as approved)
  const handleUpdateStatus = async (invoice, newStatus) => {
    try {
      await updateInvoiceStatus(invoice.invoice_id, newStatus);
      alert(`✅ Invoice status updated to ${newStatus}!`);
      loadInvoices(selectedMonth);
    } catch (err) {
      console.error("Error updating invoice status:", err);
      alert("❌ Failed to update invoice status.");
    }
  };

  // Toggle invoice selection for bulk operations
  const toggleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  // Select all invoices for bulk operations
  const selectAllInvoices = () => {
    const eligibleInvoices = filteredInvoices.filter(
      inv => inv.files && inv.files.length > 0 && inv.status !== 'sent'
    );
    setSelectedInvoices(eligibleInvoices.map(inv => inv.invoice_id));
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>Invoices Management</h2>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={openBulkModal}
            disabled={filteredInvoices.filter(inv => inv.files && inv.files.length > 0 && inv.status !== 'sent').length === 0}
          >
            📤 Bulk Send
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Total Invoices</h3>
          </div>
          <h4>{stats.total_invoices}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Sent</h3>
          </div>
          <h4>{stats.sent_invoices}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Received</h3>
          </div>
          <h4>{stats.received_invoices}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>With Files</h3>
          </div>
          <h4>{stats.invoices_with_files}</h4>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Filter by Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            disabled={loading}
            className="filter-select"
          />
        </div>

        <div className="filter-group">
          <label>Filter by Status:</label>
          <select className="filter-select" value={statusFilter} onChange={handleStatusFilter}>
            <option value="">All</option>
            <option value="not_sent">Not Sent</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
            <option value="approved">Approved</option>
            <option value="not_received">Not Received</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filtered Results:</label>
          <div className="filter-stats">
            {filteredInvoices.length} invoices
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="card-header">
          <h3>Customer Invoices</h3>
        </div>
        {loading ? (
          <div className="loading-indicator">Loading invoices...</div>
        ) : filteredInvoices.length > 0 ? (
          <DataTable
            columns={["", "Hotel", "Month", "Files", "Status", "Actions"]}
            rows={filteredInvoices.map((inv) => ({
              "": (
                <input
                  type="checkbox"
                  checked={selectedInvoices.includes(inv.invoice_id)}
                  onChange={() => toggleInvoiceSelection(inv.invoice_id)}
                  disabled={!inv.files || inv.files.length === 0 || inv.status === 'sent'}
                />
              ),
              Hotel: inv.hotel_name || "-",
              Month: `${inv.year}-${String(inv.month).padStart(2, "0")}`,
              Files: (
                <div className="files-info">
                  <span className="file-count">
                    {inv.files ? inv.files.length : 0} files
                  </span>
                  {inv.files && inv.files.length > 0 && (
                    <button
                      className="btn-link"
                      onClick={() => openFilesModal(inv)}
                    >
                      View
                    </button>
                  )}
                </div>
              ),
              Status: (
                <span
                  className={`status-badge ${
                    inv.status === "sent"
                      ? "sent"
                      : inv.status === "received"
                      ? "received"
                      : inv.status === "approved"
                      ? "approved"
                      : "pending"
                  }`}
                >
                  {inv.status}
                </span>
              ),
              Actions: (
                <div className="action-buttons">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openUploadModal(inv)}
                    title="Upload Files"
                  >
                    📎 Upload
                  </button>
                  {inv.files && inv.files.length > 0 && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openSendModal(inv)}
                        disabled={inv.status === "sent"}
                        title="Send Invoice"
                      >
                        📤 Send
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleDownloadFiles(inv)}
                        title="Download Files"
                      >
                        ⬇️ Download
                      </button>
                    </>
                  )}
                  {/* Admin can mark as approved after client marks as received */}
                  {inv.status === "received" && (
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleUpdateStatus(inv, 'approved')}
                      title="Mark as Approved"
                    >
                      ✓ Approve
                    </button>
                  )}
                </div>
              ),
            }))}
          />
        ) : (
          <div className="no-data">No invoices found.</div>
        )}
      </div>

      {/* Send Invoice Modal */}
      {showModal && activeInvoice && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Send Invoice</h3>
              <button className="btn-close" onClick={closeSendModal}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Hotel:</strong> {activeInvoice.hotel_name}</p>
              <p><strong>Month:</strong> {activeInvoice.year}-{String(activeInvoice.month).padStart(2, "0")}</p>
              <p><strong>Files:</strong> {activeInvoice.files ? activeInvoice.files.length : 0} files attached</p>
              <div className="warning-message">
                ⚠️ This will send the invoice with all attached files to the client and hotel.
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleSendInvoice}
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Invoice"}
              </button>
              <button className="btn btn-secondary" onClick={closeSendModal}>
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
              {activeInvoice.files && activeInvoice.files.length > 0 ? (
                <div className="files-list">
                  {activeInvoice.files.map((file) => {
                    console.log("File URL in modal:", file.url); // Debug log
                    return (
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
                            onClick={() => handleViewFile(file.url, file.name)}
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
                          <button
                            className="btn-link text-danger"
                            onClick={() => handleRemoveFile(file.id)}
                            title="Remove File"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No files uploaded for this invoice.</p>
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

      {/* Upload Files Modal */}
      {showUploadModal && activeInvoice && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Files - {activeInvoice.hotel_name}</h3>
              <button className="btn-close" onClick={closeUploadModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Files (Max 50MB per file):</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
                />
                <small>Supported formats: PDF, Word, Excel, Images, Text, ZIP</small>
              </div>
              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  <h4>Selected Files ({selectedFiles.length}):</h4>
                  <ul>
                    {selectedFiles.map((file, index) => (
                      <li key={index}>
                        {getFileIcon(file.name)} {file.name} ({formatFileSize(file.size)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleUploadFiles}
                disabled={uploading || selectedFiles.length === 0}
              >
                {uploading ? "Uploading..." : "Upload Files"}
              </button>
              <button className="btn btn-secondary" onClick={closeUploadModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Send Modal */}
      {showBulkModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Bulk Send Invoices</h3>
              <button className="btn-close" onClick={closeBulkModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Selected {selectedInvoices.length} invoices for sending.</p>
              <div className="bulk-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={selectAllInvoices}
                >
                  Select All Eligible
                </button>
              </div>
              <div className="warning-message">
                ⚠️ This will send all selected invoices with their attached files to respective clients and hotels.
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleBulkSend}
                disabled={bulkSending || selectedInvoices.length === 0}
              >
                {bulkSending ? "Sending..." : `Send ${selectedInvoices.length} Invoices`}
              </button>
              <button className="btn btn-secondary" onClick={closeBulkModal}>
                Cancel
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
        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
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
        .status-badge.approved { background: #d1ecf1; color: #0c5460; }
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
        .text-danger {
          color: #dc3545;
        }
        .files-list {
          max-height: 400px;
          overflow-y: auto;
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
        .selected-files {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 4px;
        }
        .selected-files ul {
          margin: 0.5rem 0 0 0;
          padding-left: 1rem;
        }
        .selected-files li {
          margin-bottom: 0.25rem;
        }
        .warning-message {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 0.75rem;
          border-radius: 4px;
          margin: 1rem 0;
        }
        .bulk-actions {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default AdminInvoices;