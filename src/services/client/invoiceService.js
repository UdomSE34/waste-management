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

// Fetch all invoices for the logged-in client
export const fetchClientInvoices = async () => {
  try {
    const res = await api.get("/invoices/");
    return Array.isArray(res.data) ? res.data : res.data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch client invoices:", error);
    return [];
  }
};

/**
 * Mark invoice as received AND download PDF
 * @param {string} invoiceId - ID of the invoice
 * @param {object} param1 - { comment: string }
 */
export const markInvoiceReceived = async (invoiceId, { comment }) => {
  try {
    // Fetch PDF + mark received
    const res = await api.post(
      `/invoices/${invoiceId}/mark_received_and_download/`,
      { comment },
      { responseType: "blob" } // important to handle PDF
    );

    // Create blob and trigger download
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${invoiceId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error(`Failed to mark invoice ${invoiceId} as received:`, error);
    throw error;
  }
};

// Download individual file from invoice
export const downloadInvoiceFile = async (invoiceId, fileId, fileName) => {
  try {
    const res = await api.get(`/invoices/${invoiceId}/get_file/?file_id=${fileId}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || `invoice_file_${fileId}`);
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

// View file in new tab
export const viewInvoiceFile = async (invoiceId, fileId, fileUrl) => {
  try {
    // If we have a direct URL, use it (with proper correction for local development)
    let correctedUrl = fileUrl;
    
    if (fileUrl.includes('localhost:5173')) {
      correctedUrl = fileUrl.replace('http://localhost:5173', 'https://back.deploy.tz');
    } else if (fileUrl.startsWith('/media/')) {
      correctedUrl = `https://back.deploy.tz${fileUrl}`;
    } else if (fileUrl.startsWith('/') && !fileUrl.startsWith('/media/')) {
      correctedUrl = `https://back.deploy.tz/media${fileUrl}`;
    }
    
    window.open(correctedUrl, '_blank');
    return true;
  } catch (error) {
    console.error(`Failed to view file ${fileId} from invoice ${invoiceId}:`, error);
    throw error;
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

// Export all functions as default
const clientInvoiceService = {
  fetchClientInvoices,
  markInvoiceReceived,
  downloadInvoiceFile,
  viewInvoiceFile,
  formatFileSize,
  getFileIcon
};

export default clientInvoiceService;