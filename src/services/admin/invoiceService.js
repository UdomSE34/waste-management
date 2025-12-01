// services/admin/invoiceService.js
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

// Fetch all invoices
export const fetchInvoices = async () => {
  try {
    const res = await api.get("/invoices/");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return [];
  }
};

// Send an invoice (no amount needed now)
export const sendInvoice = async (invoiceId) => {
  try {
    const res = await api.post(`/invoices/${invoiceId}/send_invoice/`);
    return res.data;
  } catch (error) {
    console.error(`Failed to send invoice ${invoiceId}:`, error);
    throw error;
  }
};

// Upload files to invoice
export const uploadInvoiceFiles = async (invoiceId, files) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const res = await api.post(`/invoices/${invoiceId}/upload_files/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to upload files to invoice ${invoiceId}:`, error);
    throw error;
  }
};

// Remove file from invoice
export const removeInvoiceFile = async (invoiceId, fileId) => {
  try {
    const res = await api.post(`/invoices/${invoiceId}/remove_file/`, {
      file_id: fileId,
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to remove file from invoice ${invoiceId}:`, error);
    throw error;
  }
};

// Download all files as zip
export const downloadInvoiceFiles = async (invoiceId) => {
  try {
    const res = await api.get(`/invoices/${invoiceId}/download_files/`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice_files_${invoiceId}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return res.data;
  } catch (error) {
    console.error(`Failed to download files for invoice ${invoiceId}:`, error);
    throw error;
  }
};

// Download individual file
export const downloadInvoiceFile = async (invoiceId, fileId) => {
  try {
    const res = await api.get(`/invoices/${invoiceId}/get_file/?file_id=${fileId}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from response headers or use a default
    const contentDisposition = res.headers['content-disposition'];
    let filename = `invoice_file_${fileId}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return res.data;
  } catch (error) {
    console.error(`Failed to download file ${fileId} from invoice ${invoiceId}:`, error);
    throw error;
  }
};

// Mark invoice as received
export const markInvoiceReceived = async (invoiceId, comment = "") => {
  try {
    const res = await api.post(`/invoices/${invoiceId}/mark_received/`, {
      comment,
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to mark invoice ${invoiceId} as received:`, error);
    throw error;
  }
};

// Update invoice status
export const updateInvoiceStatus = async (invoiceId, status) => {
  try {
    const res = await api.post(`/invoices/${invoiceId}/update_status/`, {
      status,
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to update invoice ${invoiceId} status:`, error);
    throw error;
  }
};

// Generate invoices for a given month/year
export const generateInvoicesForMonth = async ({ year, month }) => {
  try {
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    const res = await api.post("/invoices/generate_for_month/", { month: monthStr });
    return res.data;
  } catch (error) {
    console.error("Failed to generate invoices for month:", error);
    throw error;
  }
};

// Get invoice statistics
export const getInvoiceStats = async () => {
  try {
    const res = await api.get("/invoices/stats/");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch invoice stats:", error);
    return {
      total_invoices: 0,
      sent_invoices: 0,
      received_invoices: 0,
      invoices_with_files: 0
    };
  }
};

// Bulk send multiple invoices
export const bulkSendInvoices = async (invoiceIds) => {
  try {
    const res = await api.post("/invoices/bulk_send/", {
      invoice_ids: invoiceIds
    });
    return res.data;
  } catch (error) {
    console.error("Failed to bulk send invoices:", error);
    throw error;
  }
};

// Get invoices by hotel
export const fetchInvoicesByHotel = async (hotelId) => {
  try {
    const res = await api.get(`/invoices/?hotel=${hotelId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error(`Failed to fetch invoices for hotel ${hotelId}:`, error);
    return [];
  }
};

// Get invoices by status
export const fetchInvoicesByStatus = async (status) => {
  try {
    const res = await api.get(`/invoices/?status=${status}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error(`Failed to fetch invoices with status ${status}:`, error);
    return [];
  }
};

// Utility function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utility function to get file icon based on extension
export const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const iconMap = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    txt: '📃',
    zip: '📦',
    rar: '📦'
  };
  return iconMap[extension] || '📎';
};

// Utility function to validate file before upload
export const validateFile = (file, maxSizeMB = 500) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Please upload PDF, Word, Excel, images, or text files.');
  }

  return true;
};

// Export all functions as default
const invoiceService = {
  fetchInvoices,
  sendInvoice,
  uploadInvoiceFiles,
  removeInvoiceFile,
  downloadInvoiceFiles,
  downloadInvoiceFile,
  markInvoiceReceived,
  updateInvoiceStatus,
  generateInvoicesForMonth,
  getInvoiceStats,
  bulkSendInvoices,
  fetchInvoicesByHotel,
  fetchInvoicesByStatus,
  formatFileSize,
  getFileIcon,
  validateFile
};

export default invoiceService;