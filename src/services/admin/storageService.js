import axios from "axios";

// Axios instance
export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch all documents for the logged-in user
export const fetchDocuments = async () => {
  try {
    const res = await api.get("/storage/");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

// Fetch documents by type
export const fetchDocumentsByType = async (documentType) => {
  try {
    const res = await api.get(`/storage/by_type/?type=${documentType}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error(`Failed to fetch documents by type ${documentType}:`, error);
    return [];
  }
};

// Search documents
export const searchDocuments = async (query) => {
  try {
    const res = await api.get(`/storage/search/?q=${query}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Failed to search documents:", error);
    return [];
  }
};

// Upload new document
export const uploadDocument = async (formData) => {
  try {
    const res = await api.post("/storage/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to upload document:", error);
    throw error;
  }
};

// Update document
export const updateDocument = async (documentId, data) => {
  try {
    const res = await api.patch(`/storage/${documentId}/`, data);
    return res.data;
  } catch (error) {
    console.error(`Failed to update document ${documentId}:`, error);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (documentId) => {
  try {
    const res = await api.delete(`/storage/${documentId}/`);
    return res.data;
  } catch (error) {
    console.error(`Failed to delete document ${documentId}:`, error);
    throw error;
  }
};

// Download document
export const downloadDocument = async (documentId, fileName) => {
  try {
    const res = await api.get(`/storage/${documentId}/download/`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || `document_${documentId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return res.data;
  } catch (error) {
    console.error(`Failed to download document ${documentId}:`, error);
    throw error;
  }
};

// Get storage statistics
export const getStorageStats = async () => {
  try {
    const res = await api.get("/storage/stats/");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch storage stats:", error);
    return {
      total_documents: 0,
      total_size: 0,
      total_size_display: "0 Bytes",
      documents_by_type: {}
    };
  }
};

// Utility function to validate file before upload
export const validateFile = (file, maxSizeMB = 50) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'];
  
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }

  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error(`File type .${fileExtension} is not supported. Allowed types: ${allowedExtensions.join(', ')}`);
  }

  return true;
};

// Export all functions as default
const storageService = {
  fetchDocuments,
  fetchDocumentsByType,
  searchDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getStorageStats,
  validateFile
};

export default storageService;