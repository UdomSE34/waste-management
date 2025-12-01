import { useEffect, useState } from "react";
import DataTable from "../../components/admin/DataTable";
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  updateDocument,
  getStorageStats,
  validateFile,
  searchDocuments
} from "../../services/admin/storageService";

const Storage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total_documents: 0,
    total_size_display: "0 Bytes",
    documents_by_type: {}
  });

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    document_type: "other",
    description: ""
  });
  const [editForm, setEditForm] = useState({
    name: "",
    document_type: "other",
    description: ""
  });
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Document types
  const documentTypes = [
    { value: "contract", label: "Contract" },
    { value: "agreement", label: "Agreement" },
    { value: "license", label: "License" },
    { value: "certificate", label: "Certificate" },
    { value: "report", label: "Report" },
    { value: "invoice", label: "Invoice" },
    { value: "receipt", label: "Receipt" },
    { value: "proposal", label: "Proposal" },
    { value: "quotation", label: "Quotation" },
    { value: "policy", label: "Policy" },
    { value: "manual", label: "Manual" },
    { value: "presentation", label: "Presentation" },
    { value: "spreadsheet", label: "Spreadsheet" },
    { value: "other", label: "Other" }
  ];

  // Load documents and stats
  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (searchQuery) {
        data = await searchDocuments(searchQuery);
      } else if (typeFilter) {
        data = await fetchDocumentsByType(typeFilter);
      } else {
        data = await fetchDocuments();
      }
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getStorageStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load storage stats:", err);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateFile(file, 50);
      setSelectedFile(file);
      
      // Auto-fill name from filename if empty
      if (!uploadForm.name) {
        const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
        setUploadForm(prev => ({ ...prev, name: fileNameWithoutExt }));
      }
    } catch (error) {
      alert(`File validation error: ${error.message}`);
      e.target.value = ""; // Reset file input
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    if (!uploadForm.name.trim()) {
      alert("Please enter a document name.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', uploadForm.name);
      formData.append('document_type', uploadForm.document_type);
      formData.append('description', uploadForm.description);

      await uploadDocument(formData);
      alert("✅ Document uploaded successfully!");
      closeUploadModal();
      loadDocuments();
      loadStats();
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("❌ Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  // Handle download
  const handleDownload = async (document) => {
    try {
      await downloadDocument(document.document_id, `${document.name}.${document.file_extension}`);
    } catch (err) {
      console.error("Error downloading document:", err);
      alert("❌ Failed to download document.");
    }
  };

  // Handle edit
  const handleEdit = (document) => {
    setActiveDocument(document);
    setEditForm({
      name: document.name,
      document_type: document.document_type,
      description: document.description || ""
    });
    setShowEditModal(true);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!activeDocument) return;

    if (!editForm.name.trim()) {
      alert("Please enter a document name.");
      return;
    }

    setEditing(true);
    try {
      await updateDocument(activeDocument.document_id, editForm);
      alert("✅ Document updated successfully!");
      closeEditModal();
      loadDocuments();
    } catch (err) {
      console.error("Error updating document:", err);
      alert("❌ Failed to update document.");
    } finally {
      setEditing(false);
    }
  };

  // Handle delete
  const handleDelete = async (document) => {
    if (!window.confirm(`Are you sure you want to delete "${document.name}"?`)) return;

    try {
      await deleteDocument(document.document_id);
      alert("✅ Document deleted successfully!");
      loadDocuments();
      loadStats();
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("❌ Failed to delete document.");
    }
  };

  // Modal functions
  const openUploadModal = () => {
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadForm({
      name: "",
      document_type: "other",
      description: ""
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setActiveDocument(null);
    setEditForm({
      name: "",
      document_type: "other",
      description: ""
    });
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = !categoryFilter || doc.file_type_category === categoryFilter;
    const matchesType = !typeFilter || doc.document_type === typeFilter;
    return matchesCategory && matchesType;
  });



  return (
    <div className="content">
      <div className="page-header">
        <h2>Document Storage</h2>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={openUploadModal}
          >
            📁 Upload Document
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Dashboard Cards */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Total Documents</h3>
          </div>
          <h4>{stats.total_documents}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Storage Used</h3>
          </div>
          <h4>{stats.total_size_display}</h4>
        </div>
        
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Search Documents:</label>
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-select"
          />
        </div>


        <div className="filter-group">
          <button
            className="btn btn-outline"
            onClick={loadDocuments}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="card">
        <div className="card-header">
          <h3>My Documents</h3>
        </div>
        {loading ? (
          <div className="loading-indicator">Loading documents...</div>
        ) : filteredDocuments.length > 0 ? (
          <DataTable
            columns={["Name", "Type",  "Uploaded", "Actions"]}
            rows={filteredDocuments.map((doc) => ({
              Name: (
                <div className="document-info">
                  <span className="file-icon">{doc.file_icon}</span>
                  <div>
                    <div className="document-name">{doc.name}</div>
                    {doc.description && (
                      <div className="document-description">{doc.description}</div>
                    )}
                  </div>
                </div>
              ),
              Type: (
                <span className="document-type">
                  {doc.document_type}
                </span>
              ),
              Uploaded: new Date(doc.created_at).toLocaleDateString(),
              Actions: (
                <div className="action-buttons">
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handleEdit(doc)}
                    title="Edit Document"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownload(doc)}
                    title="Download"
                  >
                    ⬇️ Download
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(doc)}
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ),
            }))}
          />
        ) : (
          <div className="no-data">
            {searchQuery || typeFilter || categoryFilter 
              ? "No documents match your filters." 
              : "No documents found. Upload your first document to get started."}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button className="btn-close" onClick={closeUploadModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select File (Max 50MB):</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.csv,.zip,.rar"
                />
                <small>
                  Supported formats: PDF, Word, Excel, PowerPoint, Images, Text, CSV, ZIP, RAR
                </small>
                {selectedFile && (
                  <div className="selected-file">
                    <strong>Selected:</strong> {selectedFile.name} 
                    ({Math.round(selectedFile.size / 1024 / 1024 * 100) / 100} MB)
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Document Name:</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter document name"
                />
              </div>

              <div className="form-group">
                <label>Document Type:</label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, document_type: e.target.value }))}
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description (Optional):</label>
                <textarea
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter document description..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
              <button className="btn btn-secondary" onClick={closeUploadModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && activeDocument && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Document - {activeDocument.name}</h3>
              <button className="btn-close" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="document-info-preview">
                <p><strong>Current File:</strong> {activeDocument.original_filename}</p>
                <p><strong>File Type:</strong> {activeDocument.file_extension.toUpperCase()}</p>
                <p><strong>Size:</strong> {activeDocument.file_size_display}</p>
                <p><strong>Uploaded:</strong> {new Date(activeDocument.created_at).toLocaleString()}</p>
              </div>

              <div className="form-group">
                <label>Document Name:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter document name"
                />
              </div>

              <div className="form-group">
                <label>Document Type:</label>
                <select
                  value={editForm.document_type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, document_type: e.target.value }))}
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description (Optional):</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter document description..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleUpdate}
                disabled={editing}
              >
                {editing ? "Updating..." : "Update Document"}
              </button>
              <button className="btn btn-secondary" onClick={closeEditModal}>
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
          flex-wrap: wrap;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .document-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .file-icon {
          font-size: 1.5rem;
        }
        .document-name {
          font-weight: bold;
        }
        .document-description {
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.25rem;
        }
        .document-type {
          text-transform: capitalize;
          background: #e9ecef;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
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
        .selected-file {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #e7f3ff;
          border-radius: 4px;
          border-left: 4px solid #007bff;
        }
        .document-info-preview {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .document-info-preview p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
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
        .modal-body { display:flex; flex-direction:column; gap:15px; }
        .btn-close { background:none; border:none; font-size:1.3rem; cursor:pointer; }
        .error-message { color:red; margin-bottom:10px; }
        .loading-indicator, .no-data {
          padding: 2rem;
          text-align: center;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Storage;